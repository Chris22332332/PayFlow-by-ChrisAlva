import Map           "mo:core/Map";
import List          "mo:core/List";
import Time          "mo:core/Time";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common        "../types/common";
import ITypes        "../types/invite";
import WTypes        "../types/wallet";
import WalletLib     "../lib/wallet";
import ReferralLib   "../lib/referral";

mixin (
  accessControlState : AccessControl.AccessControlState,
  balances           : Map.Map<Principal, Common.Amount>,
  ledger             : Map.Map<Principal, List.List<WTypes.Transaction>>,
  requests           : Map.Map<Principal, List.List<WTypes.MoneyRequest>>,
  nextTxId           : Common.Counter,
  invites            : Map.Map<Principal, ITypes.InviteRecord>,
) {
  /// Get the caller's current wallet balance.
  public query ({ caller }) func getBalance() : async Common.Amount {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    WalletLib.getBalance(balances, caller);
  };

  /// Add funds to the caller's wallet (simulates payment method debit).
  public shared ({ caller }) func addFunds(amount : Common.Amount) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (amount == 0) { Runtime.trap("Amount must be greater than zero") };
    WalletLib.credit(balances, caller, amount);
    let tx : WTypes.Transaction = {
      id                = nextTxId.value;
      txType            = #deposit;
      amount;
      base_amount       = amount;
      currency          = #USD;
      tax_rate          = 0;
      tax_amount        = 0;
      original_currency = null;
      original_amount   = null;
      counterparty      = null;
      note              = "Funds added";
      timestamp         = Time.now();
      status            = #completed;
      requestId         = null;
    };
    WalletLib.recordTx(ledger, caller, tx);
    nextTxId.value += 1;
  };

  /// Withdraw funds to a linked bank account (simulates bank transfer).
  public shared ({ caller }) func withdrawFunds(amount : Common.Amount) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (amount == 0) { Runtime.trap("Amount must be greater than zero") };
    WalletLib.debit(balances, caller, amount);
    let tx : WTypes.Transaction = {
      id                = nextTxId.value;
      txType            = #withdrawal;
      amount;
      base_amount       = amount;
      currency          = #USD;
      tax_rate          = 0;
      tax_amount        = 0;
      original_currency = null;
      original_amount   = null;
      counterparty      = null;
      note              = "Funds withdrawn";
      timestamp         = Time.now();
      status            = #completed;
      requestId         = null;
    };
    WalletLib.recordTx(ledger, caller, tx);
    nextTxId.value += 1;
  };

  /// Send money to another user. Triggers referral reward if this is the sender's first payment.
  public shared ({ caller }) func sendMoney(
    recipient : Principal,
    amount    : Common.Amount,
    note      : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (amount == 0) { Runtime.trap("Amount must be greater than zero") };
    if (Principal.equal(caller, recipient)) { Runtime.trap("Cannot send money to yourself") };
    let now = Time.now();
    WalletLib.transfer(balances, ledger, caller, recipient, amount, note, nextTxId.value, now);
    nextTxId.value += 2; // transfer records 2 transactions (sent + received)
    // Trigger referral reward for the sender (caller) on their first outgoing payment
    ReferralLib.triggerReferralReward(invites, balances, ledger, nextTxId, caller, now);
  };

  /// Request money from another user.
  public shared ({ caller }) func requestMoney(
    payer  : Principal,
    amount : Common.Amount,
    note   : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (amount == 0) { Runtime.trap("Amount must be greater than zero") };
    if (Principal.equal(caller, payer)) { Runtime.trap("Cannot request money from yourself") };
    WalletLib.createRequest(requests, caller, payer, amount, note, nextTxId.value, Time.now());
    nextTxId.value += 1;
  };

  /// Accept an incoming money request (caller is the payer). Triggers referral reward.
  public shared ({ caller }) func acceptMoneyRequest(requestId : Common.TxId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let now = Time.now();
    WalletLib.acceptRequest(requests, balances, ledger, caller, requestId, nextTxId.value, now);
    nextTxId.value += 2; // accept records 2 transactions
    // Trigger referral reward for the payer (caller) on their first outgoing payment
    ReferralLib.triggerReferralReward(invites, balances, ledger, nextTxId, caller, now);
  };

  /// Reject an incoming money request (caller is the payer).
  public shared ({ caller }) func rejectMoneyRequest(requestId : Common.TxId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    WalletLib.rejectRequest(requests, caller, requestId);
  };

  /// Get transaction history, with optional type filter.
  public query ({ caller }) func getTransactionHistory(filter : ?WTypes.TxType) : async [WTypes.Transaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    WalletLib.getHistory(ledger, caller, filter);
  };

  /// Get pending money requests addressed to the caller (as payer).
  public query ({ caller }) func getPendingRequests() : async [WTypes.MoneyRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (requests.get(caller)) {
      case null { [] };
      case (?list) {
        list.filter(func(r : WTypes.MoneyRequest) : Bool = r.status == #pending).toArray();
      };
    };
  };
};
