import Common "common";

module {
  public type NotifType = {
    #Payment;
    #Security;
    #Alert;
    #Promo;
    #System;
  };

  public type Notification = {
    id          : Nat;
    notifType   : NotifType;
    title       : Text;
    body        : Text;
    timestamp   : Common.Timestamp;
    isRead      : Bool;
    relatedTxId : ?Common.TxId;
  };
};
