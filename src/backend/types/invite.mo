module {
  /// Redemption record: who redeemed and when
  public type Redemption = {
    invitee   : Principal;
    timestamp : Int;
  };

  /// Record of a paid referral reward
  public type ReferralRewardRecord = {
    inviteCode : Text;
    amount     : Nat;
    paidAt     : Int;
  };

  /// Per-user invite record stored in stable state
  public type InviteRecord = {
    code                              : Text;
    owner                             : Principal;
    redemptions                       : [Redemption];
    /// Whether the referral reward has been paid for each referred user's first payment
    referralRewardPaid                : Bool;
    /// Principals of referred users who have already sent their first payment
    referredUsersFirstPaymentPrincipal : [Principal];
    /// History of paid reward records
    paidRewards                       : [ReferralRewardRecord];
  };

  /// Public stats returned to the caller
  public type InviteStats = {
    code              : Text;
    redemptionCount   : Nat;
    redeemerUsernames : [Text];
  };

  /// Summary of all referral rewards for a user
  public type ReferralRewardSummary = {
    totalEarned    : Nat;
    pendingRewards : Nat;
    paidRewards    : [ReferralRewardRecord];
  };
};
