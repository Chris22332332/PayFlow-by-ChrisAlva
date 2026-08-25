import Order "mo:core/Order";

module {
  /// Unique identifier for a transaction (auto-incrementing)
  public type TxId = Nat;

  /// Amount in smallest currency unit (e.g. cents)
  public type Amount = Nat;

  /// Timestamp in nanoseconds (Int from Time.now())
  public type Timestamp = Int;

  /// Mutable counter — wrap Nat counters in this to share across mixins
  public type Counter = { var value : Nat };

  /// Supported currencies
  public type Currency = {
    #USD;
    #EUR;
    #GBP;
    #CAD;
    #AUD;
    #JPY;
  };

  /// Compare two Currency values (required for Map/Set keys)
  public func compareCurrency(a : Currency, b : Currency) : Order.Order {
    let rank = func(c : Currency) : Nat {
      switch c {
        case (#AUD) 0;
        case (#CAD) 1;
        case (#EUR) 2;
        case (#GBP) 3;
        case (#JPY) 4;
        case (#USD) 5;
      };
    };
    let ra = rank(a);
    let rb = rank(b);
    if (ra < rb) #less
    else if (ra > rb) #greater
    else #equal
  };

  /// An amount paired with its currency
  public type CurrencyAmount = {
    currency : Currency;
    amount   : Amount;
  };

  /// FX exchange rate between two currencies
  public type FxRate = {
    from_currency : Currency;
    to_currency   : Currency;
    rate          : Float;
    fetched_at    : Timestamp;
  };
};
