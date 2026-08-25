import Common "common";

module {
  public type TxMetadata = {
    txId : Common.TxId;
    tags : [Text];
    note : ?Text;
  };
};
