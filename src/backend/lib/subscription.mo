import Map       "mo:core/Map";
import List      "mo:core/List";
import Time      "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime   "mo:core/Runtime";
import OutCall   "mo:caffeineai-http-outcalls/outcall";
import STypes    "../types/subscription";

module {
  public type Subscription       = STypes.Subscription;
  public type SubscriptionTier   = STypes.SubscriptionTier;
  public type BillingInterval    = STypes.BillingInterval;
  public type SubscriptionStatus = STypes.SubscriptionStatus;

  // ── Price IDs ──────────────────────────────────────────────────────────────
  //   plus_monthly  = $4.99 / mo
  //   plus_annual   = $49.99 / yr
  //   pro_monthly   = $9.99 / mo
  //   pro_annual    = $99.99 / yr
  //   business_monthly = $19.99 / mo
  //   business_annual  = $199.99 / yr
  //
  // These are Stripe Price IDs (created in the Stripe Dashboard or via the API).
  // We use price lookup keys prefixed with "payflow_" so operators can replace them
  // without code changes by setting these in the Stripe Dashboard.

  func priceId(tier : SubscriptionTier, interval : BillingInterval) : Text {
    switch (tier, interval) {
      case (#plus,     #monthly) "payflow_plus_monthly";
      case (#plus,     #annual)  "payflow_plus_annual";
      case (#pro,      #monthly) "payflow_pro_monthly";
      case (#pro,      #annual)  "payflow_pro_annual";
      case (#business, #monthly) "payflow_business_monthly";
      case (#business, #annual)  "payflow_business_annual";
      // enterprise — negotiated; use same key, operator maps it in Stripe
      case (#enterprise, #monthly) "payflow_enterprise_monthly";
      case (#enterprise, #annual)  "payflow_enterprise_annual";
      case (#free, _) Runtime.trap("Free tier has no price ID");
    };
  };

  func urlEncode(t : Text) : Text {
    t.replace(#char ' ', "%20")
     .replace(#char '&', "%26")
     .replace(#char '=', "%3D")
     .replace(#char '/', "%2F")
     .replace(#char ':', "%3A");
  };

  func authHeaders(secretKey : Text) : [OutCall.Header] {
    [
      { name = "Authorization"; value = "Bearer " # secretKey },
      { name = "Content-Type";  value = "application/x-www-form-urlencoded" },
    ];
  };

  func extractJsonString(json : Text, field : Text) : ?Text {
    let key = "\"" # field # "\":\"";
    if (json.contains(#text key)) {
      let parts = json.split(#text key);
      switch (parts.next()) {
        case null null;
        case (?_) {
          switch (parts.next()) {
            case (?after) {
              switch (after.split(#text "\"").next()) {
                case (?v) if (v.size() > 0) ?v else null;
                case null null;
              };
            };
            case null null;
          };
        };
      };
    } else null;
  };

  // ── Public functions ───────────────────────────────────────────────────────

  /// Return the current subscription for a user, or null if none.
  public func getSubscription(
    subscriptions : Map.Map<Principal, Subscription>,
    user          : Principal,
  ) : ?Subscription {
    subscriptions.get(user);
  };

  /// Create a Stripe Subscription Checkout Session and return the session URL.
  public func createCheckoutUrl(
    stripeSecretKey : Text,
    transform       : OutCall.Transform,
    caller          : Principal,
    tier            : SubscriptionTier,
    interval        : BillingInterval,
  ) : async* { #ok : Text; #err : Text } {
    let pid = priceId(tier, interval);
    let params = List.empty<Text>();
    params.add("mode=subscription");
    params.add("line_items[0][price_lookup_key]=" # urlEncode(pid));
    params.add("line_items[0][quantity]=1");
    params.add("client_reference_id=" # urlEncode(caller.toText()));
    params.add("success_url=" # urlEncode("https://payflow.app/subscription/success?session_id={CHECKOUT_SESSION_ID}"));
    params.add("cancel_url="  # urlEncode("https://payflow.app/subscription/cancel"));

    let body = params.values().join("&");
    let resp = try {
      await OutCall.httpPostRequest(
        "https://api.stripe.com/v1/checkout/sessions",
        authHeaders(stripeSecretKey),
        body,
        transform,
      );
    } catch (err) {
      return #err("Stripe checkout session failed: " # err.message());
    };

    if (resp.contains(#text "\"error\"")) {
      return #err("Stripe error creating checkout session");
    };

    switch (extractJsonString(resp, "url")) {
      case (?url) #ok(url);
      case null   #err("Missing URL in Stripe response");
    };
  };

  /// Mark the caller's subscription as cancelled (effective end-of-period).
  public func cancelSubscription(
    subscriptions : Map.Map<Principal, Subscription>,
    caller        : Principal,
  ) : { #ok : Bool; #err : Text } {
    switch (subscriptions.get(caller)) {
      case null    { #err("No active subscription found") };
      case (?sub) {
        let updated : Subscription = { sub with status = #cancelled };
        subscriptions.add(caller, updated);
        #ok(true);
      };
    };
  };

  /// Return current subscription status; auto-expire if past currentPeriodEnd.
  public func getStatus(
    subscriptions : Map.Map<Principal, Subscription>,
    user          : Principal,
  ) : SubscriptionStatus {
    switch (subscriptions.get(user)) {
      case null    { #expired };
      case (?sub) {
        if (sub.status == #cancelled or sub.status == #expired) {
          sub.status;
        } else if (Time.now() > sub.currentPeriodEnd) {
          // Auto-expire
          let updated : Subscription = { sub with status = #expired };
          subscriptions.add(user, updated);
          #expired;
        } else {
          sub.status;
        };
      };
    };
  };

  /// Store or replace a subscription record for a user.
  public func upsertSubscription(
    subscriptions : Map.Map<Principal, Subscription>,
    user          : Principal,
    sub           : Subscription,
  ) {
    subscriptions.add(user, sub);
  };
};
