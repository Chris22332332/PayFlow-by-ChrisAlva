import Common "common";

module {
  public type SpendingCategory = {
    #Food;
    #Transport;
    #Entertainment;
    #Shopping;
    #Bills;
    #Transfers;
    #Other;
  };

  public type SpendingRecord = {
    txId      : Common.TxId;
    category  : SpendingCategory;
    amount    : Common.Amount;
    timestamp : Common.Timestamp;
  };

  public type BudgetSetting = {
    category       : SpendingCategory;
    limitCents     : Nat;
    alertThreshold : Nat; // percentage 0-100
  };

  public type CategoryBreakdown = {
    category : SpendingCategory;
    total    : Nat;
    count    : Nat;
  };

  public type AnalyticsSummary = {
    totalSpent      : Nat;
    byCategory      : [CategoryBreakdown];
    monthOverMonth  : Int;    // change in cents vs prev month
    avgTransaction  : Nat;
    biggestPurchase : Nat;
  };
};
