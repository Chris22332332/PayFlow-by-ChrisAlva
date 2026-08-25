module {
  public type CardControl = {
    paymentMethodId      : Text;
    isFrozen             : Bool;
    onlineEnabled        : Bool;
    internationalEnabled : Bool;
    maxTransactionLimit  : ?Nat;
    hasVirtualCard       : Bool;
    virtualCardLast4     : ?Text;
    virtualCardExpiry    : ?Text;
  };
};
