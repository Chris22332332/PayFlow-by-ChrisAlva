import Common "common";

module {
  public type TxType = {
    #sent;
    #received;
    #request;
    #deposit;
    #withdrawal;
  };

  public type TxStatus = {
    #pending;
    #completed;
    #rejected;
    #cancelled;
  };

  /// A single ledger entry representing a wallet transaction
  public type Transaction = {
    id                : Common.TxId;
    txType            : TxType;
    amount            : Common.Amount;       // net amount in base_currency (smallest unit)
    base_amount       : Common.Amount;       // amount before tax
    currency          : Common.Currency;
    tax_rate          : Nat;                 // in basis points (e.g. 750 = 7.50%)
    tax_amount        : Common.Amount;       // tax portion in smallest unit
    original_currency : ?Common.Currency;   // set when cross-currency conversion occurred
    original_amount   : ?Common.Amount;     // amount in the original currency
    counterparty      : ?Principal;          // null for deposit/withdrawal
    note              : Text;
    timestamp         : Common.Timestamp;
    status            : TxStatus;
    requestId         : ?Common.TxId;       // links accepted/rejected request back to original
  };

  /// A money request (send or receive) between two users
  public type MoneyRequest = {
    id        : Common.TxId;
    requester : Principal;
    payer     : Principal;
    amount    : Common.Amount;
    currency  : Common.Currency;
    note      : Text;
    timestamp : Common.Timestamp;
    status    : TxStatus;
  };
};
