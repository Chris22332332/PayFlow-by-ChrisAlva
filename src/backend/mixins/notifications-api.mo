import Map             "mo:core/Map";
import List            "mo:core/List";
import Principal       "mo:core/Principal";
import Runtime         "mo:core/Runtime";
import AccessControl   "mo:caffeineai-authorization/access-control";
import Common          "../types/common";
import NTypes          "../types/notifications";
import NotificationsLib "../lib/notifications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  notifStore         : Map.Map<Principal, List.List<NTypes.Notification>>,
  nextNotifId        : Common.Counter,
) {
  /// Get all notifications for the caller.
  public query ({ caller }) func getNotifications() : async [NTypes.Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    NotificationsLib.getNotifications(notifStore, caller);
  };

  /// Mark a specific notification as read.
  public shared ({ caller }) func markNotificationRead(id : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    NotificationsLib.markRead(notifStore, caller, id);
  };

  /// Mark all notifications as read.
  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    NotificationsLib.markAllRead(notifStore, caller);
  };
};
