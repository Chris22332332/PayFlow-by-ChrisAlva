import Map     "mo:core/Map";
import List    "mo:core/List";
import Time    "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Common  "../types/common";
import WTypes  "../types/wallet";

module {
  public type Transaction  = WTypes.Transaction;
  public type MoneyRequest = WTypes.MoneyRequest;
  public type TxType       = WTypes.TxType;
  public type TxStatus     = WTypes.TxStatus;

  /// Default currency for legacy single-currency operations
  let defaultCurrency : Common.Currency = #USD;

  /// Get wallet balance for a user (in cents); 0 if no account yet
  public func getBalance(
    balances : Map.Map<Principal, Common.Amount>,
    user     : Principal,
  ) : Common.Amount {
    switch (balances.get(user)) {
      case (?bal) bal;
      case null   0;
    };
  };

  /// Credit a wallet (deposit, received transfer, etc.)
  public func credit(
    balances : Map.Map<Principal, Common.Amount>,
    user     : Principal,
    amount   : Common.Amount,
  ) {
    let current = getBalance(balances, user);
    balances.add(user, current + amount);
  };

  /// Debit a wallet; traps if insufficient funds
  public func debit(
    balances : Map.Map<Principal, Common.Amount>,
    user     : Principal,
    amount   : Common.Amount,
  ) {
    let current = getBalance(balances, user);
    if (current < amount) {
      Runtime.trap("Insufficient funds");
    };
    // Safe subtraction: guarded above
    let newBalance : Nat = current - amount;
    balances.add(user, newBalance);
  };

  /// Record a transaction in the ledger
  public func recordTx(
    ledger : Map.Map<Principal, List.List<Transaction>>,
    owner  : Principal,
    tx     : Transaction,
  ) {
    switch (ledger.get(owner)) {
      case (?list) { list.add(tx) };
      case null {
        let list = List.empty<Transaction>();
        list.add(tx);
        ledger.add(owner, list);
      };
    };
  };

  /// Execute a P2P transfer: debit sender, credit recipient, append to both ledgers
  public func transfer(
    balances  : Map.Map<Principal, Common.Amount>,
    ledger    : Map.Map<Principal, List.List<Transaction>>,
    sender    : Principal,
    recipient : Principal,
    amount    : Common.Amount,
    note      : Text,
    nextId    : Nat,
    now       : Common.Timestamp,
  ) {
    debit(balances, sender, amount);
    credit(balances, recipient, amount);

    let sentTx : Transaction = {
      id                = nextId;
      txType            = #sent;
      amount;
      base_amount       = amount;
      currency          = defaultCurrency;
      tax_rate          = 0;
      tax_amount        = 0;
      original_currency = null;
      original_amount   = null;
      counterparty      = ?recipient;
      note;
      timestamp         = now;
      status            = #completed;
      requestId         = null;
    };
    let receivedTx : Transaction = {
      id                = nextId + 1;
      txType            = #received;
      amount;
      base_amount       = amount;
      currency          = defaultCurrency;
      tax_rate          = 0;
      tax_amount        = 0;
      original_currency = null;
      original_amount   = null;
      counterparty      = ?sender;
      note;
      timestamp         = now;
      status            = #completed;
      requestId         = null;
    };
    recordTx(ledger, sender, sentTx);
    recordTx(ledger, recipient, receivedTx);
  };

  /// Create a money request
  public func createRequest(
    requests  : Map.Map<Principal, List.List<MoneyRequest>>,
    requester : Principal,
    payer     : Principal,
    amount    : Common.Amount,
    note      : Text,
    nextId    : Nat,
    now       : Common.Timestamp,
  ) {
    let req : MoneyRequest = {
      id        = nextId;
      requester;
      payer;
      amount;
      currency  = defaultCurrency;
      note;
      timestamp = now;
      status    = #pending;
    };
    // Store request under the payer's principal so they can look it up
    switch (requests.get(payer)) {
      case (?list) { list.add(req) };
      case null {
        let list = List.empty<MoneyRequest>();
        list.add(req);
        requests.add(payer, list);
      };
    };
  };

  /// Accept a money request: debit payer, credit requester
  public func acceptRequest(
    requests  : Map.Map<Principal, List.List<MoneyRequest>>,
    balances  : Map.Map<Principal, Common.Amount>,
    ledger    : Map.Map<Principal, List.List<Transaction>>,
    payer     : Principal,
    requestId : Common.TxId,
    nextTxId  : Nat,
    now       : Common.Timestamp,
  ) {
    let list = switch (requests.get(payer)) {
      case (?l) l;
      case null { Runtime.trap("No pending requests") };
    };
    let req = switch (list.find(func(r : MoneyRequest) : Bool = r.id == requestId)) {
      case (?r) r;
      case null { Runtime.trap("Request not found") };
    };
    if (req.status != #pending) {
      Runtime.trap("Request is not pending");
    };

    // Mark as completed
    list.mapInPlace(func(r : MoneyRequest) : MoneyRequest {
      if (r.id == requestId) { { r with status = #completed } } else { r };
    });

    // Debit payer, credit requester
    debit(balances, payer, req.amount);
    credit(balances, req.requester, req.amount);

    // Record ledger entries for both parties
    let payerTx : Transaction = {
      id                = nextTxId;
      txType            = #sent;
      amount            = req.amount;
      base_amount       = req.amount;
      currency          = req.currency;
      tax_rate          = 0;
      tax_amount        = 0;
      original_currency = null;
      original_amount   = null;
      counterparty      = ?req.requester;
      note              = req.note;
      timestamp         = now;
      status            = #completed;
      requestId         = ?requestId;
    };
    let requesterTx : Transaction = {
      id                = nextTxId + 1;
      txType            = #received;
      amount            = req.amount;
      base_amount       = req.amount;
      currency          = req.currency;
      tax_rate          = 0;
      tax_amount        = 0;
      original_currency = null;
      original_amount   = null;
      counterparty      = ?payer;
      note              = req.note;
      timestamp         = now;
      status            = #completed;
      requestId         = ?requestId;
    };
    recordTx(ledger, payer, payerTx);
    recordTx(ledger, req.requester, requesterTx);
  };

  /// Reject a money request
  public func rejectRequest(
    requests  : Map.Map<Principal, List.List<MoneyRequest>>,
    payer     : Principal,
    requestId : Common.TxId,
  ) {
    let list = switch (requests.get(payer)) {
      case (?l) l;
      case null { Runtime.trap("No pending requests") };
    };
    switch (list.find(func(r : MoneyRequest) : Bool = r.id == requestId)) {
      case null { Runtime.trap("Request not found") };
      case (?req) {
        if (req.status != #pending) {
          Runtime.trap("Request is not pending");
        };
      };
    };
    list.mapInPlace(func(r : MoneyRequest) : MoneyRequest {
      if (r.id == requestId) { { r with status = #rejected } } else { r };
    });
  };

  /// Return transaction history for a user, optionally filtered by type
  public func getHistory(
    ledger : Map.Map<Principal, List.List<Transaction>>,
    user   : Principal,
    filter : ?TxType,
  ) : [Transaction] {
    switch (ledger.get(user)) {
      case null { [] };
      case (?list) {
        switch (filter) {
          case null { list.toArray() };
          case (?txType) {
            list.filter(func(tx : Transaction) : Bool = tx.txType == txType).toArray();
          };
        };
      };
    };
  };
};
