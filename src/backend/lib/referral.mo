import Map       "mo:core/Map";
import List      "mo:core/List";
import Principal "mo:core/Principal";
import Common    "../types/common";
import ITypes    "../types/invite";
import WTypes    "../types/wallet";
import WalletLib "wallet";

module {
  let referralRewardAmount : Nat = 500; // $5.00 in cents

  /// Check whether `sender` was referred; if so, and they have not triggered a reward yet,
  /// credit $5 to the inviter's USD balance and record the reward.
  public func triggerReferralReward(
    invites   : Map.Map<Principal, ITypes.InviteRecord>,
    balances  : Map.Map<Principal, Common.Amount>,
    ledger    : Map.Map<Principal, List.List<WTypes.Transaction>>,
    nextTxId  : Common.Counter,
    sender    : Principal,
    timestamp : Common.Timestamp,
  ) {
    // Find the invite record whose redemptions list contains this sender
    for ((inviterPrincipal, rec) in invites.entries()) {
      let senderRedeemed = rec.redemptions.any(
        func(r : ITypes.Redemption) : Bool { Principal.equal(r.invitee, sender) }
      );
      if (senderRedeemed) {
        // Check if we already paid a reward for this sender
        let alreadyPaid = rec.referredUsersFirstPaymentPrincipal.any(
          func(p : Principal) : Bool { Principal.equal(p, sender) }
        );
        if (not alreadyPaid) {
          // Credit the inviter's USD balance
          WalletLib.credit(balances, inviterPrincipal, referralRewardAmount);

          // Record a transaction for the inviter
          let txId = nextTxId.value;
          nextTxId.value += 1;
          let rewardTx : WTypes.Transaction = {
            id                = txId;
            txType            = #received;
            amount            = referralRewardAmount;
            base_amount       = referralRewardAmount;
            currency          = #USD;
            tax_rate          = 0;
            tax_amount        = 0;
            original_currency = null;
            original_amount   = null;
            counterparty      = null;
            note              = "Referral reward";
            timestamp;
            status            = #completed;
            requestId         = null;
          };
          WalletLib.recordTx(ledger, inviterPrincipal, rewardTx);

          // Update the invite record
          let newReward : ITypes.ReferralRewardRecord = {
            inviteCode = rec.code;
            amount     = referralRewardAmount;
            paidAt     = timestamp;
          };
          let updatedPrincipals = rec.referredUsersFirstPaymentPrincipal.concat([sender]);
          let updatedRewards    = rec.paidRewards.concat([newReward]);
          // Check if all redeemers have now paid
          let allPaid = rec.redemptions.size() > 0 and
            rec.redemptions.all(func(r : ITypes.Redemption) : Bool {
              updatedPrincipals.any(func(p : Principal) : Bool { Principal.equal(p, r.invitee) })
            });
          let updated : ITypes.InviteRecord = {
            rec with
            referredUsersFirstPaymentPrincipal = updatedPrincipals;
            paidRewards                        = updatedRewards;
            referralRewardPaid                 = allPaid;
          };
          invites.add(inviterPrincipal, updated);
        };
        // Only one invite record per sender; stop iterating.
        return;
      };
    };
  };

  /// Aggregate paid rewards from the caller's invite record into a summary.
  public func getRewardSummary(
    invites : Map.Map<Principal, ITypes.InviteRecord>,
    caller  : Principal,
  ) : ITypes.ReferralRewardSummary {
    switch (invites.get(caller)) {
      case null {
        { totalEarned = 0; pendingRewards = 0; paidRewards = [] };
      };
      case (?rec) {
        let totalEarned = rec.paidRewards.foldLeft(0, func(acc : Nat, r : ITypes.ReferralRewardRecord) : Nat {
          acc + r.amount
        });
        // Pending = redemptions that have NOT yet sent a first payment
        let pendingCount = rec.redemptions.filter(func(r : ITypes.Redemption) : Bool {
          not rec.referredUsersFirstPaymentPrincipal.any(
            func(p : Principal) : Bool { Principal.equal(p, r.invitee) }
          )
        }).size();
        {
          totalEarned;
          pendingRewards = pendingCount * referralRewardAmount;
          paidRewards    = rec.paidRewards;
        };
      };
    };
  };
};
