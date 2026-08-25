import Map                  "mo:core/Map";
import List                 "mo:core/List";
import Principal            "mo:core/Principal";
import Runtime              "mo:core/Runtime";
import AccessControl        "mo:caffeineai-authorization/access-control";
import MixinAuthorization   "mo:caffeineai-authorization/MixinAuthorization";
import Stripe               "mo:caffeineai-stripe/stripe";
import OutCall              "mo:caffeineai-http-outcalls/outcall";
import Common               "types/common";
import PTypes               "types/profile";
import PMTypes              "types/payment";
import WTypes               "types/wallet";
import STypes               "types/settings";
import ITypes               "types/invite";
import PhoneTypes           "types/phone";
import SubTypes             "types/subscription";
import ATypes               "types/analytics";
import NTypes               "types/notifications";
import SaveTypes            "types/savings";
import CCTypes              "types/card-controls";
import SocTypes             "types/social";
import CTypes               "types/contacts";
import TxMeta               "types/tx-metadata";
import ProfileMixin         "mixins/profile-api";
import PaymentMixin         "mixins/payment-api";
import WalletMixin          "mixins/wallet-api";
import SettingsMixin        "mixins/settings-api";
import CurrencyMixin        "mixins/currency-api";
import StripeMixin          "mixins/stripe-api";
import InviteMixin          "mixins/invite-api";
import PhoneMixin           "mixins/phone-api";
import SubscriptionMixin    "mixins/subscription-api";
import AutoPayLib           "lib/autopay";
import AutoPayMixin         "mixins/autopay-api";
import AnalyticsMixin       "mixins/analytics-api";
import NotificationsMixin   "mixins/notifications-api";
import SavingsMixin         "mixins/savings-api";
import CardControlsMixin    "mixins/card-controls-api";
import SocialMixin          "mixins/social-api";
import ContactsMixin        "mixins/contacts-api";
import TxMetaMixin          "mixins/tx-metadata-api";



actor {
  // -- Authorization --
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // -- Profile domain --
  let profiles : Map.Map<Principal, PTypes.UserProfile> = Map.empty();
  include ProfileMixin(accessControlState, profiles);

  // -- Payment methods domain --
  let paymentMethods : Map.Map<Principal, List.List<PMTypes.PaymentMethod>> = Map.empty();
  let nextPmId : Common.Counter = { var value = 0 };
  include PaymentMixin(accessControlState, paymentMethods, nextPmId);

  // -- Invite domain (declared early so WalletMixin can reference it) --
  let invites : Map.Map<Principal, ITypes.InviteRecord> = Map.empty();

  // -- Wallet domain --
  let balances   : Map.Map<Principal, Common.Amount>                     = Map.empty();
  let ledger     : Map.Map<Principal, List.List<WTypes.Transaction>>     = Map.empty();
  let requests   : Map.Map<Principal, List.List<WTypes.MoneyRequest>>    = Map.empty();
  let nextTxId   : Common.Counter = { var value = 0 };
  include WalletMixin(accessControlState, balances, ledger, requests, nextTxId, invites);

  // -- Multi-currency balances --
  let mcBalances  : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>> = Map.empty();
  let fxRateCache : Map.Map<Text, Common.FxRate>                                = Map.empty();
  include CurrencyMixin(accessControlState, mcBalances, fxRateCache);

  // -- Stripe configuration state --
  let stripeConfig : { var secretKey : Text } = { var secretKey = "" };

  // -- Stripe: required transform function for HTTP outcalls --
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // -- Stripe: configuration management (admin only) --
  public shared ({ caller }) func setStripeConfiguration(secretKey : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: admin required");
    };
    stripeConfig.secretKey := secretKey;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: admin required");
    };
    stripeConfig.secretKey != "";
  };

  // -- Stripe: checkout session (standard Stripe checkout flow) --
  public shared ({ caller }) func createCheckoutSession(
    items      : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl  : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (stripeConfig.secretKey == "") {
      Runtime.trap("Stripe is not configured");
    };
    let config : Stripe.StripeConfiguration = {
      secretKey        = stripeConfig.secretKey;
      allowedCountries = [];
    };
    await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
  };

  // -- Stripe: get checkout session status --
  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (stripeConfig.secretKey == "") {
      Runtime.trap("Stripe is not configured");
    };
    let config : Stripe.StripeConfiguration = {
      secretKey        = stripeConfig.secretKey;
      allowedCountries = [];
    };
    await Stripe.getSessionStatus(config, sessionId, transform);
  };

  // -- Stripe payments domain --
  include StripeMixin(accessControlState, paymentMethods, nextPmId, mcBalances, ledger, nextTxId, stripeConfig, transform);

  // -- Settings domain --
  let settingsStore : Map.Map<Principal, STypes.UserSettings>                   = Map.empty();
  let sessionStore  : Map.Map<Principal, List.List<STypes.DeviceSession>>       = Map.empty();
  include SettingsMixin(accessControlState, settingsStore, sessionStore);

  // -- Invite domain (state declared earlier, wiring here) --
  include InviteMixin(accessControlState, invites, profiles);

  // -- Phone verification domain --
  let phoneVerifications : Map.Map<Principal, PhoneTypes.PhoneVerification> = Map.empty();
  let twilioConfig : { var accountSid : Text; var authToken : Text; var fromNumber : Text } = {
    var accountSid  = "";
    var authToken   = "";
    var fromNumber  = "";
  };
  include PhoneMixin(accessControlState, phoneVerifications, twilioConfig, transform);

  // -- Twilio: configuration management (admin only) --
  public shared ({ caller }) func setTwilioConfig(
    accountSid : Text,
    authToken  : Text,
    fromNumber : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: admin required");
    };
    twilioConfig.accountSid  := accountSid;
    twilioConfig.authToken   := authToken;
    twilioConfig.fromNumber  := fromNumber;
  };

  public query ({ caller }) func isTwilioConfigured() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: admin required");
    };
    twilioConfig.accountSid != "";
  };

  // -- Subscription domain --
  let subscriptions : Map.Map<Principal, SubTypes.Subscription> = Map.empty();
  include SubscriptionMixin(accessControlState, subscriptions, stripeConfig, transform);

  // -- AutoPay domain --
  let autoPayConfigs : Map.Map<Principal, AutoPayLib.AutoPayConfig> = Map.empty();
  include AutoPayMixin(accessControlState, autoPayConfigs, paymentMethods, mcBalances, ledger, nextTxId, stripeConfig, transform);

  // -- Analytics domain --
  let spendCategories : Map.Map<Principal, Map.Map<Common.TxId, ATypes.SpendingCategory>> = Map.empty();
  let budgets         : Map.Map<Principal, List.List<ATypes.BudgetSetting>>               = Map.empty();
  include AnalyticsMixin(accessControlState, ledger, spendCategories, budgets);

  // -- Notifications domain --
  let notifStore  : Map.Map<Principal, List.List<NTypes.Notification>> = Map.empty();
  let nextNotifId : Common.Counter = { var value = 0 };
  include NotificationsMixin(accessControlState, notifStore, nextNotifId);

  // -- Savings domain --
  let savingsStore : Map.Map<Principal, List.List<SaveTypes.SavingsGoal>> = Map.empty();
  let nextGoalId   : Common.Counter = { var value = 0 };
  include SavingsMixin(accessControlState, savingsStore, nextGoalId, balances, ledger, nextTxId);

  // -- Card controls domain --
  let cardControls : Map.Map<Text, CCTypes.CardControl> = Map.empty();
  include CardControlsMixin(accessControlState, cardControls);

  // -- Social activity domain --
  let activityFeed : List.List<SocTypes.ActivityItem> = List.empty();
  let nextActId    : Common.Counter = { var value = 0 };
  include SocialMixin(accessControlState, activityFeed, nextActId);

  // -- Contacts domain --
  let contactsStore : Map.Map<Principal, List.List<CTypes.TrustedContact>> = Map.empty();
  let nextContactId : Common.Counter = { var value = 0 };
  include ContactsMixin(accessControlState, contactsStore, nextContactId);

  // -- Transaction metadata domain --
  let txMetaStore : Map.Map<Principal, Map.Map<Common.TxId, TxMeta.TxMetadata>> = Map.empty();
  include TxMetaMixin(accessControlState, txMetaStore);
};
