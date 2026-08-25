import Map            "mo:core/Map";
import List           "mo:core/List";
import Principal      "mo:core/Principal";
import Runtime        "mo:core/Runtime";
import Int            "mo:core/Int";
import OutCall        "mo:caffeineai-http-outcalls/outcall";
import AccessControl  "mo:caffeineai-authorization/access-control";
import Common         "../types/common";
import PMTypes        "../types/payment";
import WTypes         "../types/wallet";
import StripeLib      "../lib/stripe";
import WalletLib      "../lib/wallet";

mixin (
  accessControlState : AccessControl.AccessControlState,
  paymentMethods     : Map.Map<Principal, List.List<PMTypes.PaymentMethod>>,
  nextPmId           : Common.Counter,
  mcBalances         : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
  ledger             : Map.Map<Principal, List.List<WTypes.Transaction>>,
  nextTxId           : Common.Counter,
  stripeConfig       : { var secretKey : Text },
  transform          : OutCall.Transform,
) {
  /// Create a Stripe SetupIntent; the client uses the returned client_secret
  /// to collect card details via Stripe.js without raw numbers touching the canister.
  public shared ({ caller }) func createStripeSetupIntent() : async PMTypes.StripeSetupIntent {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (stripeConfig.secretKey == "") {
      Runtime.trap("Stripe is not configured");
    };
    await StripeLib.createSetupIntent(stripeConfig.secretKey, transform);
  };

  /// Called after the client completes a SetupIntent flow to attach the
  /// Stripe payment method to the user's account.
  public shared ({ caller }) func confirmStripePaymentMethod(
    stripePaymentMethodId : Text,
    displayLabel          : Text,
    pmType                : PMTypes.PaymentMethodType,
    last4                 : Text,
    expiry                : Text,
    holderName            : ?Text,
  ) : async PMTypes.PaymentMethod {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    StripeLib.confirmPaymentMethod(
      paymentMethods,
      nextPmId,
      caller,
      stripePaymentMethodId,
      displayLabel,
      pmType,
      last4,
      expiry,
      holderName,
    );
  };

  /// Charge a previously confirmed card to deposit funds into the user's wallet.
  /// Tax is calculated based on currency locale and included in the total charged.
  public shared ({ caller }) func chargeCard(
    stripePaymentMethodId : Text,
    amount                : Common.Amount,
    currency              : Common.Currency,
  ) : async PMTypes.StripePaymentResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (stripeConfig.secretKey == "") {
      Runtime.trap("Stripe is not configured");
    };
    let taxRateBp  = StripeLib.taxRateForCurrency(currency);
    let taxAmount  = StripeLib.calcTax(amount, taxRateBp);
    let totalAmount = amount + taxAmount;

    await StripeLib.chargeCard(
      stripeConfig.secretKey,
      transform,
      caller,
      stripePaymentMethodId,
      totalAmount,
      currency,
      mcBalances,
      ledger,
      nextTxId,
      amount,
      taxRateBp,
      taxAmount,
    );
  };

  /// Initiate a withdrawal to a linked bank account. No tax applied on withdrawal.
  public shared ({ caller }) func initiateWithdrawal(
    stripePaymentMethodId : Text,
    amount                : Common.Amount,
    currency              : Common.Currency,
  ) : async PMTypes.StripePaymentResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (stripeConfig.secretKey == "") {
      Runtime.trap("Stripe is not configured");
    };
    await StripeLib.initiateWithdrawal(
      stripeConfig.secretKey,
      transform,
      caller,
      stripePaymentMethodId,
      amount,
      currency,
      mcBalances,
      ledger,
      nextTxId,
    );
  };

  /// Export the calling user's transaction history as a CSV string.
  /// Columns: date, type, counterparty, base_amount, currency, tax_rate, tax_amount, total_amount, status, reference_id
  public shared ({ caller }) func exportTransactionsCsv() : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let txs = WalletLib.getHistory(ledger, caller, null);
    let header = "date,type,counterparty,base_amount,currency,tax_rate_bp,tax_amount,total_amount,status,reference_id\n";
    let rows = txs.map(func(tx : WTypes.Transaction) : Text {
      let dateSeconds = Int.abs(tx.timestamp) / 1_000_000_000;
      let dateStr = dateSeconds.toText();
      let txTypeStr = switch (tx.txType) {
        case (#sent)       "sent";
        case (#received)   "received";
        case (#request)    "request";
        case (#deposit)    "deposit";
        case (#withdrawal) "withdrawal";
      };
      let counterpartyStr = switch (tx.counterparty) {
        case (?p) p.toText();
        case (null) "";
      };
      let currStr = switch (tx.currency) {
        case (#USD) "USD";
        case (#EUR) "EUR";
        case (#GBP) "GBP";
        case (#CAD) "CAD";
        case (#AUD) "AUD";
        case (#JPY) "JPY";
      };
      let statusStr = switch (tx.status) {
        case (#pending)   "pending";
        case (#completed) "completed";
        case (#rejected)  "rejected";
        case (#cancelled) "cancelled";
      };
      let refId = switch (tx.requestId) {
        case (?id) id.toText();
        case (null) "";
      };
      dateStr # "," # txTypeStr # "," # counterpartyStr # "," #
      tx.base_amount.toText() # "," # currStr # "," #
      tx.tax_rate.toText() # "," # tx.tax_amount.toText() # "," #
      tx.amount.toText() # "," # statusStr # "," # refId # "\n";
    });
    header # rows.values().join("");
  };
};
