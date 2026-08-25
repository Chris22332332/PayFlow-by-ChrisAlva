import Map           "mo:core/Map";
import List          "mo:core/List";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import OutCall       "mo:caffeineai-http-outcalls/outcall";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common        "../types/common";
import PMTypes       "../types/payment";
import WTypes        "../types/wallet";
import AutoPayLib    "../lib/autopay";

mixin (
  accessControlState : AccessControl.AccessControlState,
  autoPayConfigs     : Map.Map<Principal, AutoPayLib.AutoPayConfig>,
  paymentMethods     : Map.Map<Principal, List.List<PMTypes.PaymentMethod>>,
  mcBalances         : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
  ledger             : Map.Map<Principal, List.List<WTypes.Transaction>>,
  nextTxId           : Common.Counter,
  stripeConfig       : { var secretKey : Text },
  transform          : OutCall.Transform,
) {
  /// Return the caller's autopay configuration.
  public query ({ caller }) func getAutoPayConfig() : async AutoPayLib.AutoPayConfig {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AutoPayLib.getConfig(autoPayConfigs, caller);
  };

  /// Update the caller's autopay configuration.
  public shared ({ caller }) func updateAutoPayConfig(config : AutoPayLib.AutoPayConfig) : async { #ok : Bool; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AutoPayLib.updateConfig(autoPayConfigs, caller, config);
  };

  /// Initiate a payout to the user's default bank account for the given received transaction.
  public shared ({ caller }) func autoDepositOnReceive(txId : Common.TxId) : async { #ok : Text; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (stripeConfig.secretKey == "") {
      Runtime.trap("Stripe is not configured");
    };
    await* AutoPayLib.autoDeposit(
      stripeConfig.secretKey,
      transform,
      autoPayConfigs,
      paymentMethods,
      mcBalances,
      ledger,
      nextTxId,
      caller,
      txId,
    );
  };
};
