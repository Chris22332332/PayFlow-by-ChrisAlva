import Map          "mo:core/Map";
import List         "mo:core/List";
import Principal    "mo:core/Principal";
import Runtime      "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common       "../types/common";
import STypes       "../types/savings";
import WTypes       "../types/wallet";
import SavingsLib   "../lib/savings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  savingsStore       : Map.Map<Principal, List.List<STypes.SavingsGoal>>,
  nextGoalId         : Common.Counter,
  balances           : Map.Map<Principal, Common.Amount>,
  ledger             : Map.Map<Principal, List.List<WTypes.Transaction>>,
  nextTxId           : Common.Counter,
) {
  /// Create a new savings goal.
  public shared ({ caller }) func createSavingsGoal(
    name         : Text,
    category     : STypes.SavingsCategory,
    targetAmount : Nat,
    targetDate   : ?Common.Timestamp,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SavingsLib.createGoal(savingsStore, nextGoalId, caller, name, category, targetAmount, targetDate);
  };

  /// Get all savings goals for the caller.
  public query ({ caller }) func getSavingsGoals() : async [STypes.SavingsGoal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SavingsLib.getGoals(savingsStore, caller);
  };

  /// Deposit from wallet into a savings goal.
  public shared ({ caller }) func depositToGoal(goalId : Nat, amount : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SavingsLib.deposit(savingsStore, balances, ledger, nextTxId, caller, goalId, amount);
  };

  /// Withdraw from a savings goal back to wallet.
  public shared ({ caller }) func withdrawFromGoal(goalId : Nat, amount : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SavingsLib.withdraw(savingsStore, balances, ledger, nextTxId, caller, goalId, amount);
  };

  /// Set automatic deposit schedule for a savings goal.
  public shared ({ caller }) func setGoalAutoDeposit(goalId : Nat, amount : Nat, interval : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SavingsLib.setAutoDeposit(savingsStore, caller, goalId, amount, interval);
  };

  /// Lock a savings goal to prevent withdrawals.
  public shared ({ caller }) func lockGoal(goalId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SavingsLib.lockGoal(savingsStore, caller, goalId);
  };

  /// Delete a savings goal.
  public shared ({ caller }) func deleteGoal(goalId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SavingsLib.deleteGoal(savingsStore, caller, goalId);
  };
};
