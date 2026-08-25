import Map         "mo:core/Map";
import List        "mo:core/List";
import Principal   "mo:core/Principal";
import Runtime     "mo:core/Runtime";
import Array       "mo:core/Array";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common      "../types/common";
import SocTypes    "../types/social";
import SocialLib   "../lib/social";

mixin (
  accessControlState : AccessControl.AccessControlState,
  activityFeed       : List.List<SocTypes.ActivityItem>,
  nextActId          : Common.Counter,
) {
  /// Get the public activity feed with pagination.
  public query ({ caller }) func getActivityFeed(limit : Nat, offset : Nat) : async [SocTypes.ActivityItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.getFeed(activityFeed, caller, limit, offset);
  };

  /// Toggle visibility of an activity item owned by the caller.
  public shared ({ caller }) func togglePaymentVisibility(actId : Nat, isPublic : Bool) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.setVisibility(activityFeed, caller, actId, isPublic);
  };

  /// Add an emoji reaction to an activity item.
  public shared ({ caller }) func addReaction(activityId : Nat, emoji : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.addReaction(activityFeed, activityId, emoji, caller);
  };

  /// Remove an emoji reaction from an activity item.
  public shared ({ caller }) func removeReaction(activityId : Nat, emoji : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.removeReaction(activityFeed, activityId, emoji, caller);
  };
};
