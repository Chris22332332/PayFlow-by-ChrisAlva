import Map     "mo:core/Map";
import List    "mo:core/List";
import Time    "mo:core/Time";
import Runtime "mo:core/Runtime";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Common  "../types/common";
import PMTypes "../types/payment";
import WTypes  "../types/wallet";
import WalletLib "../lib/wallet";

module {
  // ── Tax rates by locale (basis points: 2000 = 20%) ──────────────────────
  public func taxRateForCurrency(currency : Common.Currency) : Nat {
    switch (currency) {
      case (#USD) 0;
      case (#EUR) 2000; // 20% EU VAT
      case (#GBP) 2000; // 20% UK VAT
      case (#CAD) 1300; // 13% CA HST
      case (#AUD) 1000; // 10% AU GST
      case (#JPY) 1000; // 10% JP consumption tax
    };
  };

  /// Calculate tax amount from base amount and rate in basis points
  public func calcTax(baseAmount : Common.Amount, taxRateBp : Nat) : Common.Amount {
    (baseAmount * taxRateBp) / 10000;
  };

  // ── Currency label for Stripe ────────────────────────────────────────────
  public func currencyCode(c : Common.Currency) : Text {
    switch (c) {
      case (#USD) "usd";
      case (#EUR) "eur";
      case (#GBP) "gbp";
      case (#CAD) "cad";
      case (#AUD) "aud";
      case (#JPY) "jpy";
    };
  };

  // ── Minimal JSON field extractor (string value) ─────────────────────────
  func extractJsonString(json : Text, field : Text) : ?Text {
    let key = "\"" # field # "\":\"";
    if (json.contains(#text key)) {
      let parts = json.split(#text key);
      switch (parts.next()) {
        case (null) null;
        case (?_) {
          switch (parts.next()) {
            case (?after) {
              switch (after.split(#text "\"").next()) {
                case (?v) if (v.size() > 0) ?v else null;
                case (null) null;
              };
            };
            case (null) null;
          };
        };
      };
    } else {
      null;
    };
  };

  /// Extract a JSON string field that may have a space after colon
  func extractJsonStringLoose(json : Text, field : Text) : ?Text {
    switch (extractJsonString(json, field)) {
      case (?v) ?v;
      case (null) {
        let keySpace = "\"" # field # "\": \"";
        if (json.contains(#text keySpace)) {
          let parts = json.split(#text keySpace);
          switch (parts.next()) {
            case (null) null;
            case (?_) {
              switch (parts.next()) {
                case (?after) {
                  switch (after.split(#text "\"").next()) {
                    case (?v) if (v.size() > 0) ?v else null;
                    case (null) null;
                  };
                };
                case (null) null;
              };
            };
          };
        } else {
          null;
        };
      };
    };
  };

  func urlEncode(t : Text) : Text {
    t.replace(#char ' ', "%20").replace(#char '&', "%26").replace(#char '=', "%3D");
  };

  // ── Auth headers ─────────────────────────────────────────────────────────
  func authHeaders(secretKey : Text) : [OutCall.Header] {
    [
      { name = "Authorization"; value = "Bearer " # secretKey },
      { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
    ];
  };

  // ── Create a Stripe SetupIntent ───────────────────────────────────────────
  /// Calls POST /v1/setup_intents and returns the client_secret.
  public func createSetupIntent(
    secretKey : Text,
    transform : OutCall.Transform,
  ) : async PMTypes.StripeSetupIntent {
    let body = "usage=off_session";
    let resp = try {
      await OutCall.httpPostRequest(
        "https://api.stripe.com/v1/setup_intents",
        authHeaders(secretKey),
        body,
        transform,
      );
    } catch (err) {
      Runtime.trap("Stripe SetupIntent failed: " # err.message());
    };
    let clientSecret = switch (extractJsonStringLoose(resp, "client_secret")) {
      case (?v) v;
      case (null) Runtime.trap("Stripe SetupIntent: missing client_secret in response");
    };
    let pmId = extractJsonStringLoose(resp, "payment_method");
    { client_secret = clientSecret; payment_method_id = pmId };
  };

  // ── Confirm / attach a Stripe payment method ─────────────────────────────
  /// Records the Stripe payment_method_id against the user's PaymentMethod list.
  public func confirmPaymentMethod(
    paymentMethods        : Map.Map<Principal, List.List<PMTypes.PaymentMethod>>,
    nextPmId              : Common.Counter,
    caller                : Principal,
    stripePaymentMethodId : Text,
    displayLabel          : Text,
    pmType                : PMTypes.PaymentMethodType,
    last4                 : Text,
    expiry                : Text,
    holderName            : ?Text,
  ) : PMTypes.PaymentMethod {
    let newPm : PMTypes.PaymentMethod = {
      id                       = nextPmId.value;
      token                    = stripePaymentMethodId;
      last4;
      expiry;
      pmType;
      isDefault                = false;
      displayLabel;
      stripe_payment_method_id = ?stripePaymentMethodId;
      verification_status      = #Verified;
      account_holder_name      = holderName;
    };
    nextPmId.value += 1;

    let list = switch (paymentMethods.get(caller)) {
      case (?l) l;
      case (null) {
        let l = List.empty<PMTypes.PaymentMethod>();
        paymentMethods.add(caller, l);
        l;
      };
    };
    // Make it default if it's the first method
    let isFirst = list.size() == 0;
    let finalPm : PMTypes.PaymentMethod = { newPm with isDefault = isFirst };
    list.add(finalPm);
    finalPm;
  };

  // ── Charge a card via Stripe PaymentIntents ───────────────────────────────
  /// totalAmount = base_amount + tax_amount; charges the full amount.
  public func chargeCard(
    secretKey             : Text,
    transform             : OutCall.Transform,
    caller                : Principal,
    stripePaymentMethodId : Text,
    totalAmount           : Common.Amount,
    currency              : Common.Currency,
    mcBalances            : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
    ledger                : Map.Map<Principal, List.List<WTypes.Transaction>>,
    nextTxId              : Common.Counter,
    baseAmount            : Common.Amount,
    taxRateBp             : Nat,
    taxAmount             : Common.Amount,
  ) : async PMTypes.StripePaymentResult {
    let params = List.empty<Text>();
    params.add("amount=" # totalAmount.toText());
    params.add("currency=" # currencyCode(currency));
    params.add("payment_method=" # urlEncode(stripePaymentMethodId));
    params.add("confirm=true");
    params.add("off_session=true");
    params.add("description=" # urlEncode("PayFlow deposit"));

    let body = params.values().join("&");
    let resp = try {
      await OutCall.httpPostRequest(
        "https://api.stripe.com/v1/payment_intents",
        authHeaders(secretKey),
        body,
        transform,
      );
    } catch (err) {
      return {
        success        = false;
        charge_id      = null;
        error_message  = ?("Stripe charge failed: " # err.message());
        amount_charged = 0;
        currency;
      };
    };

    if (resp.contains(#text "\"error\"")) {
      let errMsg = switch (extractJsonStringLoose(resp, "message")) {
        case (?m) m;
        case (null) "Unknown Stripe error";
      };
      return {
        success        = false;
        charge_id      = null;
        error_message  = ?errMsg;
        amount_charged = 0;
        currency;
      };
    };

    let chargeId = extractJsonStringLoose(resp, "id");
    // Credit the user's multi-currency balance
    let userBalances = switch (mcBalances.get(caller)) {
      case (?m) m;
      case (null) {
        let m = Map.empty<Common.Currency, Common.Amount>();
        mcBalances.add(caller, m);
        m;
      };
    };
    let existing = switch (userBalances.get(Common.compareCurrency, currency)) {
      case (?b) b;
      case (null) 0;
    };
    userBalances.add(Common.compareCurrency, currency, existing + baseAmount);

    let txId = nextTxId.value;
    nextTxId.value += 1;
    let now = Time.now();
    let tx : WTypes.Transaction = {
      id                = txId;
      txType            = #deposit;
      amount            = totalAmount;
      base_amount       = baseAmount;
      currency;
      tax_rate          = taxRateBp;
      tax_amount        = taxAmount;
      original_currency = null;
      original_amount   = null;
      counterparty      = null;
      note              = "Stripe deposit";
      timestamp         = now;
      status            = #completed;
      requestId         = null;
    };
    WalletLib.recordTx(ledger, caller, tx);

    {
      success        = true;
      charge_id      = chargeId;
      error_message  = null;
      amount_charged = totalAmount;
      currency;
    };
  };

  // ── Initiate a withdrawal via Stripe Payouts ─────────────────────────────
  public func initiateWithdrawal(
    secretKey             : Text,
    transform             : OutCall.Transform,
    caller                : Principal,
    stripePaymentMethodId : Text,
    amount                : Common.Amount,
    currency              : Common.Currency,
    mcBalances            : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
    ledger                : Map.Map<Principal, List.List<WTypes.Transaction>>,
    nextTxId              : Common.Counter,
  ) : async PMTypes.StripePaymentResult {
    // Debit multi-currency balance first
    let userBalances = switch (mcBalances.get(caller)) {
      case (?m) m;
      case (null) Runtime.trap("No balance found");
    };
    let currentBal = switch (userBalances.get(Common.compareCurrency, currency)) {
      case (?b) b;
      case (null) 0;
    };
    if (currentBal < amount) {
      Runtime.trap("Insufficient funds for withdrawal");
    };
    userBalances.add(Common.compareCurrency, currency, currentBal - amount);

    let params = List.empty<Text>();
    params.add("amount=" # amount.toText());
    params.add("currency=" # currencyCode(currency));
    params.add("destination=" # urlEncode(stripePaymentMethodId));
    params.add("description=" # urlEncode("PayFlow withdrawal"));

    let body = params.values().join("&");
    let resp = try {
      await OutCall.httpPostRequest(
        "https://api.stripe.com/v1/payouts",
        authHeaders(secretKey),
        body,
        transform,
      );
    } catch (err) {
      // Rollback balance on failure
      userBalances.add(Common.compareCurrency, currency, currentBal);
      return {
        success        = false;
        charge_id      = null;
        error_message  = ?("Stripe withdrawal failed: " # err.message());
        amount_charged = 0;
        currency;
      };
    };

    if (resp.contains(#text "\"error\"")) {
      // Rollback balance
      userBalances.add(Common.compareCurrency, currency, currentBal);
      let errMsg = switch (extractJsonStringLoose(resp, "message")) {
        case (?m) m;
        case (null) "Unknown Stripe error";
      };
      return {
        success        = false;
        charge_id      = null;
        error_message  = ?errMsg;
        amount_charged = 0;
        currency;
      };
    };

    let payoutId = extractJsonStringLoose(resp, "id");
    let txId = nextTxId.value;
    nextTxId.value += 1;
    let now = Time.now();
    let tx : WTypes.Transaction = {
      id                = txId;
      txType            = #withdrawal;
      amount;
      base_amount       = amount;
      currency;
      tax_rate          = 0;
      tax_amount        = 0;
      original_currency = null;
      original_amount   = null;
      counterparty      = null;
      note              = "Stripe withdrawal";
      timestamp         = now;
      status            = #completed;
      requestId         = null;
    };
    WalletLib.recordTx(ledger, caller, tx);

    {
      success        = true;
      charge_id      = payoutId;
      error_message  = null;
      amount_charged = amount;
      currency;
    };
  };
};
