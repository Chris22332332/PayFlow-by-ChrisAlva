import Map           "mo:core/Map";
import List          "mo:core/List";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common        "../types/common";
import PMTypes       "../types/payment";
import PaymentLib    "../lib/payment";

mixin (
  accessControlState : AccessControl.AccessControlState,
  paymentMethods     : Map.Map<Principal, List.List<PMTypes.PaymentMethod>>,
  nextPmId           : Common.Counter,
) {
  /// Add a tokenized payment method
  public shared ({ caller }) func addPaymentMethod(
    token        : Text,
    last4        : Text,
    expiry       : Text,
    pmType       : PMTypes.PaymentMethodType,
    displayLabel : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PaymentLib.addMethod(paymentMethods, caller, token, last4, expiry, pmType, displayLabel, nextPmId.value);
    nextPmId.value += 1;
  };

  /// Remove a payment method by id
  public shared ({ caller }) func removePaymentMethod(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PaymentLib.removeMethod(paymentMethods, caller, id);
  };

  /// Set the default payment method
  public shared ({ caller }) func setDefaultPaymentMethod(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PaymentLib.setDefault(paymentMethods, caller, id);
  };

  /// List all payment methods for the caller
  public query ({ caller }) func listPaymentMethods() : async [PMTypes.PaymentMethod] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PaymentLib.listMethods(paymentMethods, caller);
  };
};
