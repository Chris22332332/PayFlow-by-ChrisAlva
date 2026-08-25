module {
  /// Pending or verified phone record for a user
  public type PhoneVerification = {
    phone     : Text;
    code      : Text;
    expiresAt : Int;
    verified  : Bool;
  };
};
