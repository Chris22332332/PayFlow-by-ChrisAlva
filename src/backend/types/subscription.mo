module {
  public type SubscriptionTier = {
    #free;
    #plus;
    #pro;
    #business;
    #enterprise;
  };

  public type BillingInterval = {
    #monthly;
    #annual;
  };

  public type SubscriptionStatus = {
    #active;
    #cancelled;
    #expired;
    #trialing;
  };

  /// Full subscription record stored per user
  public type Subscription = {
    tier                 : SubscriptionTier;
    interval             : BillingInterval;
    stripeSubscriptionId : ?Text;
    status               : SubscriptionStatus;
    currentPeriodEnd     : Int;
  };
};
