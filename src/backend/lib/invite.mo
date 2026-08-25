import Map       "mo:core/Map";
import Blob      "mo:core/Blob";
import Nat8      "mo:core/Nat8";
import Principal "mo:core/Principal";
import Time      "mo:core/Time";
import ITypes    "../types/invite";
import PTypes    "../types/profile";

module {

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  func toHex2(n : Nat) : Text {
    let chars = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    chars[n / 16] # chars[n % 16];
  };

  /// Derive a deterministic invite code from a principal's blob.
  func principalToCode(p : Principal) : Text {
    let raw : Blob = p.toBlob();
    let bytes = raw.toArray();
    var h0 : Nat8 = 0;
    var h1 : Nat8 = 0;
    var h2 : Nat8 = 0;
    var h3 : Nat8 = 0;
    var i = 0;
    for (b in bytes.vals()) {
      switch (i % 4) {
        case 0 { h0 := h0 ^ b };
        case 1 { h1 := h1 ^ b };
        case 2 { h2 := h2 ^ b };
        case _ { h3 := h3 ^ b };
      };
      i += 1;
    };
    let salt : Nat8 = 0x37;
    h0 := (h0 *% 31 +% salt) & 0xff;
    h1 := (h1 *% 37 +% salt) & 0xff;
    h2 := (h2 *% 41 +% salt) & 0xff;
    h3 := (h3 *% 43 +% salt) & 0xff;
    toHex2(h0.toNat()) # toHex2(h1.toNat()) # toHex2(h2.toNat()) # toHex2(h3.toNat());
  };

  /// Find the owner principal of a given code by scanning all entries.
  func findOwner(
    invites : Map.Map<Principal, ITypes.InviteRecord>,
    code    : Text,
  ) : ?Principal {
    var result : ?Principal = null;
    invites.forEach(func(p, rec) {
      if (rec.code == code) {
        result := ?p;
      };
    });
    result;
  };

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /// Return the caller's invite record, creating one if absent.
  public func getOrCreateRecord(
    invites : Map.Map<Principal, ITypes.InviteRecord>,
    caller  : Principal,
  ) : ITypes.InviteRecord {
    switch (invites.get(caller)) {
      case (?rec) { rec };
      case null {
        let code = principalToCode(caller);
        let rec : ITypes.InviteRecord = {
          code                               = code;
          owner                              = caller;
          redemptions                        = [];
          referralRewardPaid                 = false;
          referredUsersFirstPaymentPrincipal = [];
          paidRewards                        = [];
        };
        invites.add(caller, rec);
        rec;
      };
    };
  };

  /// Validate that a code exists (belongs to some user).
  public func validateCode(
    invites : Map.Map<Principal, ITypes.InviteRecord>,
    code    : Text,
  ) : Bool {
    switch (findOwner(invites, code)) {
      case (?_) { true };
      case null { false };
    };
  };

  /// Record a redemption. Idempotent — repeated calls from the same invitee are no-ops.
  /// Returns false if the code is invalid or the invitee tries to redeem their own code.
  public func redeemCode(
    invites : Map.Map<Principal, ITypes.InviteRecord>,
    code    : Text,
    invitee : Principal,
  ) : Bool {
    switch (findOwner(invites, code)) {
      case null { false };
      case (?owner) {
        if (Principal.equal(owner, invitee)) {
          // Cannot redeem your own invite code
          return false;
        };
        let rec = switch (invites.get(owner)) {
          case (?r) { r };
          case null { return false };
        };
        // Idempotency: skip if already redeemed
        let alreadyRedeemed = rec.redemptions.any(
          func(r : ITypes.Redemption) : Bool { Principal.equal(r.invitee, invitee) },
        );
        if (alreadyRedeemed) { return true };
        let newRedemption : ITypes.Redemption = {
          invitee   = invitee;
          timestamp = Time.now();
        };
        let updated : ITypes.InviteRecord = {
          rec with
          redemptions = rec.redemptions.concat([newRedemption]);
        };
        invites.add(owner, updated);
        true;
      };
    };
  };

  /// Build public stats for the caller's invite code.
  public func getStats(
    invites  : Map.Map<Principal, ITypes.InviteRecord>,
    profiles : Map.Map<Principal, PTypes.UserProfile>,
    caller   : Principal,
  ) : ITypes.InviteStats {
    let rec = getOrCreateRecord(invites, caller);
    let usernames = rec.redemptions.map(
      func(r : ITypes.Redemption) : Text {
        switch (profiles.get(r.invitee)) {
          case (?p) { p.username };
          case null { r.invitee.toText() };
        };
      },
    );
    {
      code              = rec.code;
      redemptionCount   = rec.redemptions.size();
      redeemerUsernames = usernames;
    };
  };
};
