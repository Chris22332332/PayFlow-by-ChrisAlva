import Map           "mo:core/Map";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ITypes        "../types/invite";
import PTypes        "../types/profile";
import InviteLib     "../lib/invite";
import ReferralLib   "../lib/referral";

mixin (
  accessControlState : AccessControl.AccessControlState,
  invites            : Map.Map<Principal, ITypes.InviteRecord>,
  profiles           : Map.Map<Principal, PTypes.UserProfile>,
) {
  /// Return the caller's invite code, creating one if it doesn't exist yet.
  public shared ({ caller }) func getInviteCode() : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    InviteLib.getOrCreateRecord(invites, caller).code;
  };

  /// Create (or return existing) invite code for the caller.
  public shared ({ caller }) func createInviteCode() : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    InviteLib.getOrCreateRecord(invites, caller).code;
  };

  /// Check whether a given invite code is valid (exists in the system).
  public query func validateInviteCode(code : Text) : async Bool {
    InviteLib.validateCode(invites, code);
  };

  /// Record that the caller redeemed an invite code.
  public shared ({ caller }) func redeemInviteCode(code : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    InviteLib.redeemCode(invites, code, caller);
  };

  /// Return invite statistics for the caller: code, redemption count, and usernames.
  public query ({ caller }) func getInviteStats() : async ITypes.InviteStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    InviteLib.getStats(invites, profiles, caller);
  };

  /// Return the caller's referral reward summary: total earned, pending, and paid history.
  public query ({ caller }) func getReferralRewards() : async ITypes.ReferralRewardSummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ReferralLib.getRewardSummary(invites, caller);
  };
};
