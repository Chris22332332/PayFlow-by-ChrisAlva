import Map       "mo:core/Map";
import Nat       "mo:core/Nat";
import Nat8      "mo:core/Nat8";
import Char      "mo:core/Char";
import Principal "mo:core/Principal";
import Time      "mo:core/Time";
import Text      "mo:core/Text";
import OutCall   "mo:caffeineai-http-outcalls/outcall";
import Types     "../types/phone";

module {
  public type PhoneVerification = Types.PhoneVerification;

  // ── Helpers ────────────────────────────────────────────────────────────────

  /// Base64-encode a string for use in HTTP Basic auth headers.
  func base64Encode(input : Text) : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let charsArr = chars.toArray();
    let bytes = input.encodeUtf8().toArray();
    var result = "";
    var i = 0;
    let n = bytes.size();
    while (i < n) {
      let b0 : Nat = bytes[i].toNat();
      let b1 : Nat = if (i + 1 < n) bytes[i + 1].toNat() else 0;
      let b2 : Nat = if (i + 2 < n) bytes[i + 2].toNat() else 0;

      let c0 = (b0 / 4) % 64;
      let c1 = ((b0 % 4) * 16 + b1 / 16) % 64;
      let c2 = ((b1 % 16) * 4 + b2 / 64) % 64;
      let c3 = b2 % 64;

      result := result # Text.fromChar(charsArr[c0]);
      result := result # Text.fromChar(charsArr[c1]);
      result := if (i + 1 < n) result # Text.fromChar(charsArr[c2]) else result # "=";
      result := if (i + 2 < n) result # Text.fromChar(charsArr[c3]) else result # "=";
      i += 3;
    };
    result;
  };

  /// URL-encode text for form submissions.
  func urlEncode(t : Text) : Text {
    t.replace(#char ' ', "%20")
     .replace(#char '+', "%2B")
     .replace(#char '&', "%26")
     .replace(#char '=', "%3D")
     .replace(#char '/', "%2F")
     .replace(#char ':', "%3A");
  };

  /// Generate a 6-digit OTP from principal bytes + current timestamp.
  func generateCode(caller : Principal, now : Int) : Text {
    let raw : Blob = caller.toBlob();
    let bytes = raw.toArray();
    var h0 : Nat8 = 0;
    var h1 : Nat8 = 0;
    var h2 : Nat8 = 0;
    let tsText = now.toText();
    for (b in bytes.vals()) {
      h0 := h0 *% 31 +% b;
      h1 := h1 *% 37 +% b;
      h2 := h2 *% 41 +% b;
    };
    for (c in tsText.toIter()) {
      let cb = Nat8.fromNat(Nat.fromNat32(c.toNat32()) % 256);
      h0 := h0 *% 13 +% cb;
      h1 := h1 *% 17 +% cb;
      h2 := h2 *% 19 +% cb;
    };
    let code : Nat = (h0.toNat() * 65536 + h1.toNat() * 256 + h2.toNat()) % 1000000;
    let raw6 = code.toText();
    // Left-pad to 6 digits
    let pad = 6 - raw6.size();
    var prefix = "";
    var p = 0;
    while (p < pad) { prefix := prefix # "0"; p += 1; };
    prefix # raw6;
  };

  // ── HTTP outcall response transform ───────────────────────────────────────

  /// Strip non-deterministic headers from Twilio responses so all replicas agree.
  public func twilioTransform(input : OutCall.TransformationInput) : OutCall.TransformationOutput {
    {
      status  = input.response.status;
      body    = input.response.body;
      headers = [];
    };
  };

  // ── SMS verification ───────────────────────────────────────────────────────

  /// Send a 6-digit OTP to `phone` via Twilio.
  public func requestVerification(
    phoneVerifications : Map.Map<Principal, PhoneVerification>,
    twilioAccountSid   : Text,
    twilioAuthToken    : Text,
    twilioFromNumber   : Text,
    caller             : Principal,
    phone              : Text,
    transform          : OutCall.Transform,
  ) : async* { #ok : Text; #err : Text } {
    if (twilioAccountSid == "" or twilioAuthToken == "" or twilioFromNumber == "") {
      return #err("Twilio is not configured");
    };
    let now     = Time.now();
    let code    = generateCode(caller, now);
    let expires = now + 600_000_000_000; // 10 minutes in nanoseconds

    let record : PhoneVerification = {
      phone;
      code;
      expiresAt = expires;
      verified  = false;
    };
    phoneVerifications.add(caller, record);

    let credentials = twilioAccountSid # ":" # twilioAuthToken;
    let authHeader  = "Basic " # base64Encode(credentials);
    let url         = "https://api.twilio.com/2010-04-01/Accounts/" # twilioAccountSid # "/Messages.json";
    let body        = "To=" # urlEncode(phone)
      # "&From=" # urlEncode(twilioFromNumber)
      # "&Body=" # urlEncode("Your PayFlow verification code is: " # code);
    let headers : [OutCall.Header] = [
      { name = "Authorization"; value = authHeader },
      { name = "Content-Type";  value = "application/x-www-form-urlencoded" },
    ];

    try {
      let _resp = await OutCall.httpPostRequest(url, headers, body, transform);
      #ok("Verification code sent");
    } catch (err) {
      #err("SMS send failed: " # err.message());
    };
  };

  /// Check whether the supplied code matches and marks phone as verified.
  public func verifyCode(
    phoneVerifications : Map.Map<Principal, PhoneVerification>,
    caller             : Principal,
    code               : Text,
  ) : { #ok : Bool; #err : Text } {
    switch (phoneVerifications.get(caller)) {
      case null    { #err("No pending verification found") };
      case (?rec) {
        if (rec.verified)           { return #ok(true) };
        if (Time.now() > rec.expiresAt) { return #err("Verification code has expired") };
        if (rec.code != code)       { return #err("Invalid verification code") };
        let updated : PhoneVerification = { rec with verified = true };
        phoneVerifications.add(caller, updated);
        #ok(true);
      };
    };
  };

  /// Remove the verified phone from the caller's account.
  public func unlinkPhone(
    phoneVerifications : Map.Map<Principal, PhoneVerification>,
    caller             : Principal,
  ) : { #ok : Bool; #err : Text } {
    phoneVerifications.remove(caller);
    #ok(true);
  };

  /// Find a principal whose verified phone matches `phone`.
  public func findByVerifiedPhone(
    phoneVerifications : Map.Map<Principal, PhoneVerification>,
    phone              : Text,
  ) : ?Principal {
    for ((principal, rec) in phoneVerifications.entries()) {
      if (rec.verified and rec.phone == phone) {
        return ?principal;
      };
    };
    null;
  };
};
