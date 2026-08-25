import Map            "mo:core/Map";
import List           "mo:core/List";
import Runtime        "mo:core/Runtime";
import AccessControl  "mo:caffeineai-authorization/access-control";
import STypes         "../types/settings";
import SettingsLib    "../lib/settings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  settingsStore      : Map.Map<Principal, STypes.UserSettings>,
  sessionStore       : Map.Map<Principal, List.List<STypes.DeviceSession>>,
) {
  /// Retrieve the calling user's settings (returns defaults if not yet set).
  public shared ({ caller }) func getUserSettings() : async STypes.UserSettings {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SettingsLib.getSettings(settingsStore, caller);
  };

  /// Persist updated settings for the calling user.
  public shared ({ caller }) func updateUserSettings(updated : STypes.UserSettings) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SettingsLib.updateSettings(settingsStore, caller, updated);
  };

  /// List all active device sessions for the calling user.
  public shared ({ caller }) func getDeviceSessions() : async [STypes.DeviceSession] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SettingsLib.getSessions(sessionStore, caller);
  };

  /// Revoke a single device session by session_id.
  public shared ({ caller }) func revokeDeviceSession(sessionId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SettingsLib.revokeSession(sessionStore, caller, sessionId);
  };

  /// Revoke all device sessions for the calling user (keeps current session).
  public shared ({ caller }) func revokeAllSessions() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SettingsLib.revokeAllSessions(sessionStore, caller);
  };
};
