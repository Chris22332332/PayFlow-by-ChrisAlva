import Map     "mo:core/Map";
import List    "mo:core/List";
import Principal "mo:core/Principal";
import Common  "../types/common";
import ATypes  "../types/analytics";
import WTypes  "../types/wallet";

module {
  public type SpendingCategory = ATypes.SpendingCategory;
  public type BudgetSetting    = ATypes.BudgetSetting;
  public type AnalyticsSummary = ATypes.AnalyticsSummary;

  // -----------------------------------------------------------------------
  // Spending category records (per-user, parallel store to tx ledger)
  // -----------------------------------------------------------------------

  func categoryEqual(a : SpendingCategory, b : SpendingCategory) : Bool {
    switch (a, b) {
      case (#Food, #Food) true;
      case (#Transport, #Transport) true;
      case (#Entertainment, #Entertainment) true;
      case (#Shopping, #Shopping) true;
      case (#Bills, #Bills) true;
      case (#Transfers, #Transfers) true;
      case (#Other, #Other) true;
      case _ false;
    };
  };

  func categoryRank(c : SpendingCategory) : Nat {
    switch c {
      case (#Bills) 0;
      case (#Entertainment) 1;
      case (#Food) 2;
      case (#Other) 3;
      case (#Shopping) 4;
      case (#Transfers) 5;
      case (#Transport) 6;
    };
  };

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /// Get or default the category for a transaction (default: Transfers for sent, Other for rest)
  public func inferCategory(txType : WTypes.TxType) : SpendingCategory {
    switch txType {
      case (#sent) #Transfers;
      case (#received) #Transfers;
      case (#deposit) #Other;
      case (#withdrawal) #Other;
      case (#request) #Transfers;
    };
  };

  // -----------------------------------------------------------------------
  // Category CRUD
  // -----------------------------------------------------------------------

  public func setCategory(
    categories : Map.Map<Principal, Map.Map<Common.TxId, SpendingCategory>>,
    user       : Principal,
    txId       : Common.TxId,
    category   : SpendingCategory,
  ) {
    let userMap = switch (categories.get(user)) {
      case (?m) m;
      case null {
        let m = Map.empty<Common.TxId, SpendingCategory>();
        categories.add(user, m);
        m;
      };
    };
    userMap.add(txId, category);
  };

  public func getCategory(
    categories : Map.Map<Principal, Map.Map<Common.TxId, SpendingCategory>>,
    user       : Principal,
    txId       : Common.TxId,
    defaultCat : SpendingCategory,
  ) : SpendingCategory {
    switch (categories.get(user)) {
      case null defaultCat;
      case (?m) {
        switch (m.get(txId)) {
          case (?cat) cat;
          case null   defaultCat;
        };
      };
    };
  };

  // -----------------------------------------------------------------------
  // Budget CRUD
  // -----------------------------------------------------------------------

  public func setBudget(
    budgets  : Map.Map<Principal, List.List<BudgetSetting>>,
    user     : Principal,
    category : SpendingCategory,
    limitCents : Nat,
    alertThreshold : Nat,
  ) {
    let newSetting : BudgetSetting = { category; limitCents; alertThreshold };
    switch (budgets.get(user)) {
      case null {
        let l = List.empty<BudgetSetting>();
        l.add(newSetting);
        budgets.add(user, l);
      };
      case (?list) {
        // Replace existing entry for same category or add new
        let exists = list.find(func(b : BudgetSetting) : Bool { categoryEqual(b.category, category) }) != null;
        if (exists) {
          list.mapInPlace(func(b : BudgetSetting) : BudgetSetting {
            if (categoryEqual(b.category, category)) newSetting else b
          });
        } else {
          list.add(newSetting);
        };
      };
    };
  };

  public func getBudgets(
    budgets : Map.Map<Principal, List.List<BudgetSetting>>,
    user    : Principal,
  ) : [BudgetSetting] {
    switch (budgets.get(user)) {
      case null [];
      case (?list) list.toArray();
    };
  };

  // -----------------------------------------------------------------------
  // Analytics computation
  // -----------------------------------------------------------------------

  public func computeAnalytics(
    ledger     : Map.Map<Principal, List.List<WTypes.Transaction>>,
    categories : Map.Map<Principal, Map.Map<Common.TxId, SpendingCategory>>,
    user       : Principal,
    month      : Nat,
    year       : Nat,
  ) : AnalyticsSummary {
    let txList = switch (ledger.get(user)) {
      case null { return { totalSpent = 0; byCategory = []; monthOverMonth = 0; avgTransaction = 0; biggestPurchase = 0 } };
      case (?l) l;
    };

    // Helper: nanoseconds in a month boundary
    // Time.now() is Int nanoseconds since epoch
    let nsPerSec  : Int = 1_000_000_000;
    let nsPerDay  : Int = 86_400 * nsPerSec;
    let nsPerYear : Int = 365 * nsPerDay;
    // Approximate month start (days 1..28 for simplicity)
    let monthDays : [Nat] = [31,28,31,30,31,30,31,31,30,31,30,31];
    let mDays = if (month >= 1 and month <= 12) monthDays[month - 1] else 30;
    let prevMDays = if (month >= 2 and month <= 12) monthDays[month - 2]
                   else monthDays[11]; // December if January

    // Epoch approx offset for year
    let yearsSince1970 = year - 1970;
    let yearStartNs : Int = yearsSince1970.toInt() * nsPerYear;
    // Month start (cumulative days)
    var daysBefore : Nat = 0;
    var idx : Nat = 0;
    while (idx < month - 1) {
      daysBefore += monthDays[idx];
      idx += 1;
    };
    let monthStartNs : Int = yearStartNs + daysBefore.toInt() * nsPerDay;
    let monthEndNs   : Int = monthStartNs + mDays.toInt() * nsPerDay;

    // Previous month bounds
    let prevMonthEndNs   : Int = monthStartNs;
    let prevMonthStartNs : Int = prevMonthEndNs - prevMDays.toInt() * nsPerDay;

    // Collect outgoing (spent) transactions for current and previous month
    var currentTotal : Nat = 0;
    var prevTotal    : Nat = 0;
    var txCount      : Nat = 0;
    var biggest      : Nat = 0;

    // Category accumulator: categoryRank -> (total, count)
    let catTotals = List.repeat<Nat>(0, 7);
    let catCounts = List.repeat<Nat>(0, 7);

    txList.forEach(func(tx : WTypes.Transaction) {
      // Only count outgoing for "spent" analytics
      let isSpend = tx.txType == #sent or tx.txType == #withdrawal;
      if (isSpend) {
        let ts = tx.timestamp;
        if (ts >= monthStartNs and ts < monthEndNs) {
          currentTotal += tx.amount;
          txCount      += 1;
          if (tx.amount > biggest) { biggest := tx.amount };
          // Categorize
          let cat = getCategory(categories, user, tx.id, inferCategory(tx.txType));
          let rank = categoryRank(cat);
          catTotals.put(rank, catTotals.at(rank) + tx.amount);
          catCounts.put(rank, catCounts.at(rank) + 1);
        };
        if (ts >= prevMonthStartNs and ts < prevMonthEndNs) {
          prevTotal += tx.amount;
        };
      };
    });

    let allCategories : [SpendingCategory] = [#Bills, #Entertainment, #Food, #Other, #Shopping, #Transfers, #Transport];
    let byCategory = allCategories.filterMap(
      func(cat) {
        let rank  = categoryRank(cat);
        let total = catTotals.at(rank);
        let count = catCounts.at(rank);
        if (total > 0) {
          ?{ category = cat; total; count }
        } else null
      }
    );

    let avg = if (txCount > 0) currentTotal / txCount else 0;
    let mom : Int = currentTotal.toInt() - prevTotal.toInt();

    {
      totalSpent      = currentTotal;
      byCategory;
      monthOverMonth  = mom;
      avgTransaction  = avg;
      biggestPurchase = biggest;
    };
  };
};
