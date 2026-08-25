import Map           "mo:core/Map";
import List          "mo:core/List";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common        "../types/common";
import ATypes        "../types/analytics";
import WTypes        "../types/wallet";
import AnalyticsLib  "../lib/analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  ledger             : Map.Map<Principal, List.List<WTypes.Transaction>>,
  spendCategories    : Map.Map<Principal, Map.Map<Common.TxId, ATypes.SpendingCategory>>,
  budgets            : Map.Map<Principal, List.List<ATypes.BudgetSetting>>,
) {
  /// Get spending analytics for the caller for a given month/year.
  public query ({ caller }) func getSpendingAnalytics(month : Nat, year : Nat) : async ATypes.AnalyticsSummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AnalyticsLib.computeAnalytics(ledger, spendCategories, caller, month, year);
  };

  /// Manually tag a transaction with a spending category.
  public shared ({ caller }) func setTransactionCategory(txId : Common.TxId, category : ATypes.SpendingCategory) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AnalyticsLib.setCategory(spendCategories, caller, txId, category);
  };

  /// Set a monthly budget limit for a spending category.
  public shared ({ caller }) func setBudget(
    category       : ATypes.SpendingCategory,
    limitCents     : Nat,
    alertThreshold : Nat,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AnalyticsLib.setBudget(budgets, caller, category, limitCents, alertThreshold);
  };

  /// Get all budget settings for the caller.
  public query ({ caller }) func getBudgets() : async [ATypes.BudgetSetting] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AnalyticsLib.getBudgets(budgets, caller);
  };
};
