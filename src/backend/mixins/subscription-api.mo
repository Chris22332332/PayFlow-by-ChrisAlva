import Map           "mo:core/Map";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import OutCall       "mo:caffeineai-http-outcalls/outcall";
import AccessControl "mo:caffeineai-authorization/access-control";
import STypes        "../types/subscription";
import SubLib        "../lib/subscription";

mixin (
  accessControlState : AccessControl.AccessControlState,
  subscriptions      : Map.Map<Principal, STypes.Subscription>,
  stripeConfig       : { var secretKey : Text },
  transform          : OutCall.Transform,
) {
  /// Return the caller's active subscription record, or null if none.
  public query ({ caller }) func getSubscription() : async ?STypes.Subscription {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SubLib.getSubscription(subscriptions, caller);
  };

  /// Create a Stripe subscription checkout URL; caller completes payment in the browser.
  public shared ({ caller }) func createSubscriptionCheckout(
    tier     : STypes.SubscriptionTier,
    interval : STypes.BillingInterval,
  ) : async { #ok : Text; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (stripeConfig.secretKey == "") {
      Runtime.trap("Stripe is not configured");
    };
    await* SubLib.createCheckoutUrl(stripeConfig.secretKey, transform, caller, tier, interval);
  };

  /// Cancel the caller's subscription at end of current billing period.
  public shared ({ caller }) func cancelSubscription() : async { #ok : Bool; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SubLib.cancelSubscription(subscriptions, caller);
  };

  /// Return only the status variant for the caller's subscription.
  public query ({ caller }) func getSubscriptionStatus() : async STypes.SubscriptionStatus {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SubLib.getStatus(subscriptions, caller);
  };

  /// Upsert a subscription (called after Stripe webhook/session poll confirmation).
  public shared ({ caller }) func upsertSubscription(sub : STypes.Subscription) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin required");
    };
    SubLib.upsertSubscription(subscriptions, caller, sub);
  };
};
