module {
  /// Public user profile stored in the backend
  public type UserProfile = {
    displayName : Text;
    email       : Text;
    phone       : Text;
    username    : Text;
    /// Immutable 8-char alphanumeric public user ID (auto-generated on first save)
    userId      : Text;
    /// Optional short bio shown on the user's profile
    bio         : ?Text;
    /// Object-storage URL for the user's profile photo
    photoUrl    : ?Text;
  };
};
