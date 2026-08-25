import Common "common";

module {
  public type PaymentMethodType = {
    #card;
    #bank;
  };

  public type VerificationStatus = {
    #Unverified;
    #Pending;
    #Verified;
    #Failed;
  };

  /// Tokenized payment method reference (no raw card data stored)
  public type PaymentMethod = {
    id                      : Nat;
    token                   : Text;    // Stripe card/bank token
    last4                   : Text;
    expiry                  : Text;    // "MM/YY" for cards, empty for banks
    pmType                  : PaymentMethodType;
    isDefault               : Bool;
    displayLabel            : Text;    // e.g. "Visa •••• 4242"
    stripe_payment_method_id : ?Text;
    verification_status     : VerificationStatus;
    account_holder_name     : ?Text;
  };

  /// Stripe SetupIntent for saving a payment method
  public type StripeSetupIntent = {
    client_secret     : Text;
    payment_method_id : ?Text;
  };

  /// Result of a Stripe charge/payment
  public type StripePaymentResult = {
    success        : Bool;
    charge_id      : ?Text;
    error_message  : ?Text;
    amount_charged : Common.Amount;
    currency       : Common.Currency;
  };
};
