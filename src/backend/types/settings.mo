import Common "common";

module {
  public type NumberFormat = {
    #Comma;   // 1,234.56
    #Period;  // 1.234,56
  };

  public type TxHistoryVisibility = {
    #Private;
    #FriendsOnly;
    #Public;
  };

  /// Per-user application settings
  public type UserSettings = {
    // Notifications
    notification_email_receipts  : Bool;
    notification_p2p_requests    : Bool;
    notification_payment_alerts  : Bool;
    notification_promotions      : Bool;
    // Spending limits
    daily_limit                  : Common.Amount;
    monthly_limit                : Common.Amount;
    per_tx_limit                 : Common.Amount;
    // Currency & display
    primary_currency             : Common.Currency;
    decimal_places               : Nat;
    number_format                : NumberFormat;
    // Privacy
    data_sharing                 : Bool;
    tx_history_visibility        : TxHistoryVisibility;
  };

  /// An active authenticated device/session
  public type DeviceSession = {
    session_id  : Text;
    device_name : Text;
    os          : Text;
    ip_address  : Text;
    last_active : Common.Timestamp;
    is_current  : Bool;
  };
};
