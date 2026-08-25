import Map    "mo:core/Map";
import List   "mo:core/List";
import Time   "mo:core/Time";
import Int    "mo:core/Int";
import STypes "../types/settings";

module {
  /// Default settings applied for every new user.
  func defaultSettings() : STypes.UserSettings {
    {
      notification_email_receipts = true;
      notification_p2p_requests   = true;
      notification_payment_alerts = true;
      notification_promotions     = true;
      daily_limit                 = 50_000;   // $500.00 in cents
      monthly_limit               = 500_000;  // $5,000.00
      per_tx_limit                = 10_000;   // $100.00
      primary_currency            = #USD;
      decimal_places              = 2;
      number_format               = #Comma;
      data_sharing                = false;
      tx_history_visibility       = #Private;
    };
  };

  /// Return the stored settings for a user, or default values if none exist.
  public func getSettings(
    settingsStore : Map.Map<Principal, STypes.UserSettings>,
    caller        : Principal,
  ) : STypes.UserSettings {
    switch (settingsStore.get(caller)) {
      case (?s) s;
      case null defaultSettings();
    };
  };

  /// Persist updated settings for a user.
  public func updateSettings(
    settingsStore : Map.Map<Principal, STypes.UserSettings>,
    caller        : Principal,
    updated       : STypes.UserSettings,
  ) : () {
    settingsStore.add(caller, updated);
  };

  /// Build a synthetic "current session" entry for a newly registered user.
  public func makeInitialSession() : STypes.DeviceSession {
    {
      session_id  = "sess-" # Time.now().toText();
      device_name = "Web Browser";
      os          = "Unknown OS";
      ip_address  = "127.0.0.1";
      last_active = Time.now();
      is_current  = true;
    };
  };

  /// Return all active sessions for a user, always ensuring a current session exists.
  public func getSessions(
    sessionStore : Map.Map<Principal, List.List<STypes.DeviceSession>>,
    caller       : Principal,
  ) : [STypes.DeviceSession] {
    switch (sessionStore.get(caller)) {
      case (?list) {
        // Ensure there is at least one is_current session; if not, synthesise one.
        let hasCurrent = switch (list.find(func(s : STypes.DeviceSession) : Bool { s.is_current })) {
          case (?_) true;
          case null false;
        };
        if (hasCurrent) {
          list.toArray();
        } else {
          let current = makeInitialSession();
          list.add(current);
          list.toArray();
        };
      };
      case null {
        // First visit — create a demo set of sessions including the current one.
        let sessions = List.empty<STypes.DeviceSession>();
        let now = Time.now();
        sessions.add({
          session_id  = "sess-current";
          device_name = "Chrome on Desktop";
          os          = "macOS";
          ip_address  = "203.0.113.42";
          last_active = now;
          is_current  = true;
        });
        sessions.add({
          session_id  = "sess-mobile-1";
          device_name = "iPhone 15";
          os          = "iOS";
          ip_address  = "198.51.100.7";
          last_active = now - 3_600_000_000_000;   // 1 hour ago
          is_current  = false;
        });
        sessions.add({
          session_id  = "sess-desktop-2";
          device_name = "Edge on Laptop";
          os          = "Windows";
          ip_address  = "192.0.2.155";
          last_active = now - 86_400_000_000_000;  // 1 day ago
          is_current  = false;
        });
        sessionStore.add(caller, sessions);
        sessions.toArray();
      };
    };
  };

  /// Revoke a single session by session_id.
  public func revokeSession(
    sessionStore : Map.Map<Principal, List.List<STypes.DeviceSession>>,
    caller       : Principal,
    sessionId    : Text,
  ) : () {
    switch (sessionStore.get(caller)) {
      case (?list) {
        let kept = list.filter(func(s : STypes.DeviceSession) : Bool {
          s.session_id != sessionId or s.is_current
        });
        sessionStore.add(caller, kept);
      };
      case null {};
    };
  };

  /// Revoke all sessions except the current one.
  public func revokeAllSessions(
    sessionStore : Map.Map<Principal, List.List<STypes.DeviceSession>>,
    caller       : Principal,
  ) : () {
    switch (sessionStore.get(caller)) {
      case (?list) {
        let kept = list.filter(func(s : STypes.DeviceSession) : Bool { s.is_current });
        sessionStore.add(caller, kept);
      };
      case null {};
    };
  };

  /// Auto-create an initial session entry when a profile is first created.
  public func initSessionForUser(
    sessionStore : Map.Map<Principal, List.List<STypes.DeviceSession>>,
    user         : Principal,
  ) : () {
    // Only initialise once — don't overwrite existing sessions.
    switch (sessionStore.get(user)) {
      case (?_) {};
      case null {
        let sessions = List.empty<STypes.DeviceSession>();
        sessions.add(makeInitialSession());
        sessionStore.add(user, sessions);
      };
    };
  };
};
