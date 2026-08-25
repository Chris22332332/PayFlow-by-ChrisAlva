import Map      "mo:core/Map";
import Time     "mo:core/Time";
import Int      "mo:core/Int";
import Runtime  "mo:core/Runtime";
import Outcall  "mo:caffeineai-http-outcalls/outcall";
import Common   "../types/common";

module {

  // ── Helpers ────────────────────────────────────────────────────────────────

  /// Convert a Currency variant to its ISO-4217 string for API calls.
  func currencyCode(c : Common.Currency) : Text {
    switch c {
      case (#USD) "USD";
      case (#EUR) "EUR";
      case (#GBP) "GBP";
      case (#CAD) "CAD";
      case (#AUD) "AUD";
      case (#JPY) "JPY";
    };
  };

  /// Build the cache key for an FX pair.
  func cacheKey(from : Common.Currency, to : Common.Currency) : Text {
    currencyCode(from) # "_" # currencyCode(to)
  };

  /// Parse a Float from text digits (e.g. "0.9201").
  /// Supports optional leading sign, integer part, and optional decimal part.
  func parseFloatText(t : Text) : Float {
    // Split on '.'
    let parts = t.split(#char '.');
    let intText = switch (parts.next()) {
      case null Runtime.trap("FX parse: empty number");
      case (?s) s;
    };
    let fracText = switch (parts.next()) {
      case null "0";
      case (?s) s;
    };
    let intVal : Float = switch (intText.toNat()) {
      case null Runtime.trap("FX parse: bad integer part: " # intText);
      case (?n) n.toFloat();
    };
    let fracVal : Float = switch (fracText.toNat()) {
      case null 0.0;
      case (?n) n.toFloat();
    };
    // Scale by 10^(length of fracText) to get the decimal value
    var scale : Float = 1.0;
    var i = 0;
    while (i < fracText.size()) {
      scale := scale * 10.0;
      i += 1;
    };
    intVal + (fracVal / scale)
  };

  /// Extract the numeric rate from a frankfurter.app response body.
  /// Response format: {"amount":1.0,"base":"USD","date":"2024-01-01","rates":{"EUR":0.9201}}
  /// Strategy: split on `"rates":{` to get the tail, then take everything
  /// between the first `:` and first `}` in that tail.
  func parseRate(body : Text) : Float {
    let marker = "\"rates\":{";
    // Split the body on the marker — first token is before, second is after
    let iter = body.split(#text marker);
    ignore iter.next(); // discard the part before "rates":{
    let tail = switch (iter.next()) {
      case null Runtime.trap("FX parse: 'rates' object not found in response");
      case (?t) t;
    };
    // tail = `"EUR":0.9201}...`
    // Find the colon after the currency key
    let colonIter = tail.split(#char ':');
    ignore colonIter.next(); // discard the key ("EUR" part)
    let valueAndRest = switch (colonIter.next()) {
      case null Runtime.trap("FX parse: no colon after currency key");
      case (?v) v;
    };
    // valueAndRest = `0.9201}...`
    // Take everything up to the first `}`
    let numText = switch (valueAndRest.split(#char '}').next()) {
      case null Runtime.trap("FX parse: no closing brace after rate");
      case (?n) n;
    };
    let trimmed = numText.trim(#predicate (func(c : Char) : Bool {
      c == ' ' or c == '\t' or c == '\r' or c == '\n'
    }));
    if (trimmed.isEmpty()) Runtime.trap("FX parse: empty rate value");
    parseFloatText(trimmed)
  };

  // ── Public API ─────────────────────────────────────────────────────────────

  /// Return all non-zero (Currency, Amount) balances for `caller`.
  public func getMultiCurrencyBalances(
    mcBalances : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
    caller     : Principal,
  ) : [(Common.Currency, Common.Amount)] {
    switch (mcBalances.get(caller)) {
      case null [];
      case (?userMap) {
        userMap.entries().filter(func((_c, amt) : (Common.Currency, Common.Amount)) : Bool {
          amt > 0
        }).toArray()
      };
    };
  };

  /// Return a cached or freshly-fetched FX rate for `from` → `to`.
  /// Uses frankfurter.app (ECB-sourced, open, no API key required).
  /// Cache TTL: 5 minutes (300_000_000_000 nanoseconds).
  public func getExchangeRate(
    fxRateCache : Map.Map<Text, Common.FxRate>,
    from        : Common.Currency,
    to          : Common.Currency,
    transform   : Outcall.Transform,
  ) : async Common.FxRate {
    let key = cacheKey(from, to);
    let now = Time.now();
    let fiveMinNs : Int = 300_000_000_000;

    // Return cached entry if still fresh
    switch (fxRateCache.get(key)) {
      case (?cached) {
        if (now - cached.fetched_at < fiveMinNs) {
          return cached;
        };
      };
      case null {};
    };

    // Same-currency shortcut: rate is always 1.0
    if (from == to) {
      let rate : Common.FxRate = {
        from_currency = from;
        to_currency   = to;
        rate          = 1.0;
        fetched_at    = now;
      };
      fxRateCache.add(key, rate);
      return rate;
    };

    // Fetch live rate from frankfurter.app
    let url = "https://api.frankfurter.app/latest?amount=1&from=" # currencyCode(from) # "&to=" # currencyCode(to);
    let body = await Outcall.httpGetRequest(url, [], transform);
    let parsedRate = parseRate(body);

    let fresh : Common.FxRate = {
      from_currency = from;
      to_currency   = to;
      rate          = parsedRate;
      fetched_at    = now;
    };
    fxRateCache.add(key, fresh);
    fresh
  };

  /// Convert `amount` from `from` to `to` using the latest FX rate.
  public func convertCurrency(
    fxRateCache : Map.Map<Text, Common.FxRate>,
    amount      : Common.Amount,
    from        : Common.Currency,
    to          : Common.Currency,
    transform   : Outcall.Transform,
  ) : async Common.CurrencyAmount {
    let fxRate = await getExchangeRate(fxRateCache, from, to, transform);
    let converted = Int.abs((amount.toFloat() * fxRate.rate).toInt());
    { currency = to; amount = converted }
  };

  /// Credit `currency` balance for `user` by `amount`.
  public func creditBalance(
    mcBalances : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
    user       : Principal,
    currency   : Common.Currency,
    amount     : Common.Amount,
  ) : () {
    let userMap = switch (mcBalances.get(user)) {
      case (?m) m;
      case null {
        let m : Map.Map<Common.Currency, Common.Amount> = Map.empty();
        mcBalances.add(user, m);
        m
      };
    };
    let current = switch (userMap.get(Common.compareCurrency, currency)) {
      case (?bal) bal;
      case null 0;
    };
    userMap.add(Common.compareCurrency, currency, current + amount);
  };

  /// Debit `currency` balance for `user` by `amount`. Traps if insufficient.
  public func debitBalance(
    mcBalances : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
    user       : Principal,
    currency   : Common.Currency,
    amount     : Common.Amount,
  ) : () {
    let userMap = switch (mcBalances.get(user)) {
      case (?m) m;
      case null Runtime.trap("Insufficient funds: no balance for user");
    };
    let current = switch (userMap.get(Common.compareCurrency, currency)) {
      case (?bal) bal;
      case null Runtime.trap("Insufficient funds: no balance for this currency");
    };
    if (current < amount) {
      Runtime.trap("Insufficient funds: balance " # current.toText() # " < " # amount.toText());
    };
    userMap.add(Common.compareCurrency, currency, current - amount);
  };

  /// Return the display symbol for a currency.
  public func currencySymbol(c : Common.Currency) : Text {
    switch c {
      case (#USD) "$";
      case (#EUR) "€";
      case (#GBP) "£";
      case (#CAD) "CA$";
      case (#AUD) "A$";
      case (#JPY) "¥";
    };
  };
};
