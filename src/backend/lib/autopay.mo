import Map       "mo:core/Map";
import List      "mo:core/List";
import Principal "mo:core/Principal";
import OutCall   "mo:caffeineai-http-outcalls/outcall";
import Common    "../types/common";
import PMTypes   "../types/payment";
import WTypes    "../types/wallet";
import StripeLib "stripe";

module {
  /// Per-user automatic payment configuration.
  public type AutoPayConfig = {
    autoChargeOnSend      : Bool;
    autoDepositOnReceive  : Bool;
    defaultPayoutMethodId : ?Text;
  };

  let defaultConfig : AutoPayConfig = {
    autoChargeOnSend      = false;
    autoDepositOnReceive  = false;
    defaultPayoutMethodId = null;
  };

  /// Retrieve autopay config for a user (defaults to all-off).
  public func getConfig(
    autoPayConfigs : Map.Map<Principal, AutoPayConfig>,
    user           : Principal,
  ) : AutoPayConfig {
    switch (autoPayConfigs.get(user)) {
      case (?cfg) cfg;
      case null   defaultConfig;
    };
  };

  /// Persist updated autopay config for the caller.
  public func updateConfig(
    autoPayConfigs : Map.Map<Principal, AutoPayConfig>,
    caller         : Principal,
    config         : AutoPayConfig,
  ) : { #ok : Bool; #err : Text } {
    autoPayConfigs.add(caller, config);
    #ok(true);
  };

  /// When a receive event occurs, push funds to the user's default payout method via Stripe.
  public func autoDeposit(
    stripeSecretKey : Text,
    transform       : OutCall.Transform,
    autoPayConfigs  : Map.Map<Principal, AutoPayConfig>,
    paymentMethods  : Map.Map<Principal, List.List<PMTypes.PaymentMethod>>,
    mcBalances      : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
    ledger          : Map.Map<Principal, List.List<WTypes.Transaction>>,
    nextTxId        : Common.Counter,
    user            : Principal,
    txId            : Common.TxId,
  ) : async* { #ok : Text; #err : Text } {
    let cfg = getConfig(autoPayConfigs, user);
    if (not cfg.autoDepositOnReceive) {
      return #err("Auto-deposit is not enabled");
    };

    // Resolve the default payout method
    let payoutMethodId : Text = switch (cfg.defaultPayoutMethodId) {
      case (?id) id;
      case null {
        // Fall back to the user's default payment method (bank account preferred)
        switch (paymentMethods.get(user)) {
          case null    { return #err("No payout method configured") };
          case (?list) {
            // Find default bank method, then any default, then first method
            let defaultBank = list.find(func(pm : PMTypes.PaymentMethod) : Bool {
              pm.isDefault and pm.pmType == #bank
            });
            let defaultAny = list.find(func(pm : PMTypes.PaymentMethod) : Bool {
              pm.isDefault
            });
            let first = list.find(func(_ : PMTypes.PaymentMethod) : Bool { true });
            switch (defaultBank) {
              case (?pm) {
                switch (pm.stripe_payment_method_id) {
                  case (?sid) sid;
                  case null pm.token;
                };
              };
              case null {
                switch (defaultAny) {
                  case (?pm) {
                    switch (pm.stripe_payment_method_id) {
                      case (?sid) sid;
                      case null pm.token;
                    };
                  };
                  case null {
                    switch (first) {
                      case (?pm) {
                        switch (pm.stripe_payment_method_id) {
                          case (?sid) sid;
                          case null pm.token;
                        };
                      };
                      case null { return #err("No payment methods found") };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };

    // Find the received transaction to determine amount and currency
    let (amount, currency) : (Common.Amount, Common.Currency) = switch (ledger.get(user)) {
      case null    { return #err("No transaction found") };
      case (?list) {
        switch (list.find(func(tx : WTypes.Transaction) : Bool { tx.id == txId })) {
          case null    { return #err("Transaction not found: " # txId.toText()) };
          case (?tx)  { (tx.amount, tx.currency) };
        };
      };
    };

    let result = await StripeLib.initiateWithdrawal(
      stripeSecretKey,
      transform,
      user,
      payoutMethodId,
      amount,
      currency,
      mcBalances,
      ledger,
      nextTxId,
    );

    switch (result.charge_id) {
      case (?id) #ok(id);
      case null  #err(switch (result.error_message) {
        case (?m) m;
        case null "Payout failed";
      });
    };
  };
};
