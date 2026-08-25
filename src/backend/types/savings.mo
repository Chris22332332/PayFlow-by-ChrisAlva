import Common "common";

module {
  public type SavingsCategory = {
    #Emergency;
    #Vacation;
    #Car;
    #Home;
    #Custom;
  };

  public type SavingsGoal = {
    id                  : Nat;
    name                : Text;
    category            : SavingsCategory;
    targetAmount        : Nat;
    currentAmount       : Nat;
    targetDate          : ?Common.Timestamp;
    autoDepositAmount   : ?Nat;
    autoDepositInterval : ?Text;  // "weekly" | "monthly"
    isLocked            : Bool;
    isCompleted         : Bool;
    createdAt           : Common.Timestamp;
  };
};
