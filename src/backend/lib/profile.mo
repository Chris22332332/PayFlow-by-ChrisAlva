import Map       "mo:core/Map";
import Int       "mo:core/Int";
import Nat8      "mo:core/Nat8";
import Text      "mo:core/Text";
import Time      "mo:core/Time";
import Principal "mo:core/Principal";
import Types     "../types/profile";

module {
  public type UserProfile = Types.UserProfile;

  // ── Helpers ────────────────────────────────────────────────────────────────

  let base36Chars = "0123456789abcdefghijklmnopqrstuvwxyz";

  /// Generate an 8-character base-36 user ID from principal bytes + current timestamp.
  func generateUserId(caller : Principal, now : Int) : Text {
    let raw : Blob = caller.toBlob();
    let bytes = raw.toArray();
    var h0 : Nat8 = 0x5a;
    var h1 : Nat8 = 0xa5;
    var h2 : Nat8 = 0x3c;
    var h3 : Nat8 = 0xc3;
    for (b in bytes.vals()) {
      h0 := h0 *% 31 +% b;
      h1 := h1 *% 37 +% b;
      h2 := h2 *% 41 +% b;
      h3 := h3 *% 43 +% b;
    };
    // Mix in timestamp (take low 32 bits as 4 bytes)
    let ts : Nat = Int.abs(now) % 4294967296;
    let tb0 = Nat8.fromNat((ts / 16777216) % 256);
    let tb1 = Nat8.fromNat((ts / 65536) % 256);
    let tb2 = Nat8.fromNat((ts / 256) % 256);
    let tb3 = Nat8.fromNat(ts % 256);
    h0 := h0 *% 13 +% tb0;
    h1 := h1 *% 17 +% tb1;
    h2 := h2 *% 19 +% tb2;
    h3 := h3 *% 23 +% tb3;

    let combined : Nat = h0.toNat() * 16777216 + h1.toNat() * 65536 + h2.toNat() * 256 + h3.toNat();
    let charsArr = base36Chars.toArray();
    var val  = combined;
    var result = "";
    var count = 0;
    while (count < 8) {
      result := Text.fromChar(charsArr[val % 36]) # result;
      val    := val / 36;
      count  += 1;
    };
    result;
  };

  // ── Core profile operations ────────────────────────────────────────────────

  /// Save or overwrite the caller's profile. Auto-generates userId if not already set.
  public func saveProfile(
    profiles : Map.Map<Principal, UserProfile>,
    caller   : Principal,
    profile  : UserProfile,
  ) {
    let finalProfile : UserProfile = if (profile.userId == "") {
      // Preserve existing userId if there's already one
      let existingId = switch (profiles.get(caller)) {
        case (?p) if (p.userId != "") p.userId else generateUserId(caller, Time.now());
        case null generateUserId(caller, Time.now());
      };
      { profile with userId = existingId };
    } else {
      profile;
    };
    profiles.add(caller, finalProfile);
  };

  /// Get a profile by principal.
  public func getProfile(
    profiles : Map.Map<Principal, UserProfile>,
    user     : Principal,
  ) : ?UserProfile {
    profiles.get(user);
  };

  /// Find a principal by username (exact, case-insensitive).
  public func findByUsername(
    profiles : Map.Map<Principal, UserProfile>,
    username : Text,
  ) : ?Principal {
    let lower = username.toLower();
    for ((principal, profile) in profiles.entries()) {
      if (profile.username.toLower() == lower) {
        return ?principal;
      };
    };
    null;
  };

  /// Find a principal by email.
  public func findByEmail(
    profiles : Map.Map<Principal, UserProfile>,
    email    : Text,
  ) : ?Principal {
    let lower = email.toLower();
    for ((principal, profile) in profiles.entries()) {
      if (profile.email.toLower() == lower) {
        return ?principal;
      };
    };
    null;
  };

  /// Find a principal by phone number.
  public func findByPhone(
    profiles : Map.Map<Principal, UserProfile>,
    phone    : Text,
  ) : ?Principal {
    for ((principal, profile) in profiles.entries()) {
      if (profile.phone == phone) {
        return ?principal;
      };
    };
    null;
  };

  /// Find a profile whose userId or username matches the identifier (case-insensitive).
  public func findByIdOrUsername(
    profiles    : Map.Map<Principal, UserProfile>,
    identifier  : Text,
  ) : ?UserProfile {
    let lower = identifier.toLower();
    for ((_, profile) in profiles.entries()) {
      if (profile.userId.toLower() == lower or profile.username.toLower() == lower) {
        return ?profile;
      };
    };
    null;
  };

  /// Update only the photoUrl field of the caller's existing profile.
  public func updatePhoto(
    profiles : Map.Map<Principal, UserProfile>,
    caller   : Principal,
    photoUrl : Text,
  ) : { #ok : Bool; #err : Text } {
    switch (profiles.get(caller)) {
      case null    { #err("Profile not found") };
      case (?p)   {
        profiles.add(caller, { p with photoUrl = ?photoUrl });
        #ok(true);
      };
    };
  };
};
