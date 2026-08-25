import Map     "mo:core/Map";
import List    "mo:core/List";
import Time    "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Common  "../types/common";
import STypes  "../types/savings";
import WalletLib "wallet";
import WTypes  "../types/wallet";

module {
  public type SavingsGoal     = STypes.SavingsGoal;
  public type SavingsCategory = STypes.SavingsCategory;

  public func createGoal(
    store      : Map.Map<Principal, List.List<SavingsGoal>>,
    nextGoalId : Common.Counter,
    user       : Principal,
    name       : Text,
    category   : SavingsCategory,
    targetAmount : Nat,
    targetDate : ?Common.Timestamp,
  ) {
    let goal : SavingsGoal = {
      id                  = nextGoalId.value;
      name;
      category;
      targetAmount;
      currentAmount       = 0;
      targetDate;
      autoDepositAmount   = null;
      autoDepositInterval = null;
      isLocked            = false;
      isCompleted         = false;
      createdAt           = Time.now();
    };
    nextGoalId.value += 1;
    switch (store.get(user)) {
      case (?list) { list.add(goal) };
      case null {
        let list = List.empty<SavingsGoal>();
        list.add(goal);
        store.add(user, list);
      };
    };
  };

  public func getGoals(
    store : Map.Map<Principal, List.List<SavingsGoal>>,
    user  : Principal,
  ) : [SavingsGoal] {
    switch (store.get(user)) {
      case null [];
      case (?list) list.toArray();
    };
  };

  func findGoal(
    store  : Map.Map<Principal, List.List<SavingsGoal>>,
    user   : Principal,
    goalId : Nat,
  ) : (List.List<SavingsGoal>, SavingsGoal) {
    let list = switch (store.get(user)) {
      case (?l) l;
      case null { Runtime.trap("No savings goals found") };
    };
    let goal = switch (list.find(func(g : SavingsGoal) : Bool { g.id == goalId })) {
      case (?g) g;
      case null { Runtime.trap("Savings goal not found") };
    };
    (list, goal);
  };

  public func deposit(
    store    : Map.Map<Principal, List.List<SavingsGoal>>,
    balances : Map.Map<Principal, Common.Amount>,
    ledger   : Map.Map<Principal, List.List<WTypes.Transaction>>,
    nextTxId : Common.Counter,
    user     : Principal,
    goalId   : Nat,
    amount   : Nat,
  ) {
    if (amount == 0) { Runtime.trap("Amount must be greater than zero") };
    let (list, goal) = findGoal(store, user, goalId);
    WalletLib.debit(balances, user, amount);
    let newAmount = goal.currentAmount + amount;
    let completed = newAmount >= goal.targetAmount;
    list.mapInPlace(func(g : SavingsGoal) : SavingsGoal {
      if (g.id == goalId) {
        { g with currentAmount = newAmount; isCompleted = completed }
      } else g
    });
    // Record internal tx
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
      note              = "Savings deposit: " # goal.name;
      timestamp         = Time.now();
      status            = #completed;
      requestId         = null;
    };
    WalletLib.recordTx(ledger, user, tx);
    nextTxId.value += 1;
  };

  public func withdraw(
    store    : Map.Map<Principal, List.List<SavingsGoal>>,
    balances : Map.Map<Principal, Common.Amount>,
    ledger   : Map.Map<Principal, List.List<WTypes.Transaction>>,
    nextTxId : Common.Counter,
    user     : Principal,
    goalId   : Nat,
    amount   : Nat,
  ) {
    if (amount == 0) { Runtime.trap("Amount must be greater than zero") };
    let (list, goal) = findGoal(store, user, goalId);
    if (goal.isLocked) { Runtime.trap("Goal is locked") };
    if (goal.currentAmount < amount) { Runtime.trap("Insufficient savings balance") };
    list.mapInPlace(func(g : SavingsGoal) : SavingsGoal {
      if (g.id == goalId) {
        { g with currentAmount = g.currentAmount - amount }
      } else g
    });
    WalletLib.credit(balances, user, amount);
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
      note              = "Savings withdrawal: " # goal.name;
      timestamp         = Time.now();
      status            = #completed;
      requestId         = null;
    };
    WalletLib.recordTx(ledger, user, tx);
    nextTxId.value += 1;
  };

  public func setAutoDeposit(
    store    : Map.Map<Principal, List.List<SavingsGoal>>,
    user     : Principal,
    goalId   : Nat,
    amount   : Nat,
    interval : Text,
  ) {
    let (list, _) = findGoal(store, user, goalId);
    list.mapInPlace(func(g : SavingsGoal) : SavingsGoal {
      if (g.id == goalId) {
        { g with autoDepositAmount = ?amount; autoDepositInterval = ?interval }
      } else g
    });
  };

  public func lockGoal(
    store  : Map.Map<Principal, List.List<SavingsGoal>>,
    user   : Principal,
    goalId : Nat,
  ) {
    let (list, _) = findGoal(store, user, goalId);
    list.mapInPlace(func(g : SavingsGoal) : SavingsGoal {
      if (g.id == goalId) { { g with isLocked = true } } else g
    });
  };

  public func deleteGoal(
    store  : Map.Map<Principal, List.List<SavingsGoal>>,
    user   : Principal,
    goalId : Nat,
  ) {
    let list = switch (store.get(user)) {
      case (?l) l;
      case null { Runtime.trap("No savings goals found") };
    };
    let filtered = list.filter(func(g : SavingsGoal) : Bool { g.id != goalId });
    // Clear and re-add
    list.clear();
    list.append(filtered);
  };
};
