import Common "common";

module {
  public type TrustedContact = {
    id           : Nat;
    name         : Text;
    relationship : Text;
    phone        : ?Text;
    email        : ?Text;
    accessLevel  : Text;
    addedAt      : Common.Timestamp;
  };
};
