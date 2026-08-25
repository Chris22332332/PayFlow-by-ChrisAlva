import Map     "mo:core/Map";
import Principal "mo:core/Principal";
import Common  "../types/common";
import TxMeta  "../types/tx-metadata";

module {
  public type TxMetadata = TxMeta.TxMetadata;

  public func getOrDefault(
    store  : Map.Map<Principal, Map.Map<Common.TxId, TxMetadata>>,
    user   : Principal,
    txId   : Common.TxId,
  ) : TxMetadata {
    switch (store.get(user)) {
      case null { { txId; tags = []; note = null } };
      case (?m) {
        switch (m.get(txId)) {
          case (?meta) meta;
          case null    { { txId; tags = []; note = null } };
        };
      };
    };
  };

  func userMap(
    store : Map.Map<Principal, Map.Map<Common.TxId, TxMetadata>>,
    user  : Principal,
  ) : Map.Map<Common.TxId, TxMetadata> {
    switch (store.get(user)) {
      case (?m) m;
      case null {
        let m = Map.empty<Common.TxId, TxMetadata>();
        store.add(user, m);
        m;
      };
    };
  };

  public func setTags(
    store  : Map.Map<Principal, Map.Map<Common.TxId, TxMetadata>>,
    user   : Principal,
    txId   : Common.TxId,
    tags   : [Text],
  ) {
    let m    = userMap(store, user);
    let prev = getOrDefault(store, user, txId);
    m.add(txId, { prev with tags });
  };

  public func setNote(
    store  : Map.Map<Principal, Map.Map<Common.TxId, TxMetadata>>,
    user   : Principal,
    txId   : Common.TxId,
    note   : Text,
  ) {
    let m    = userMap(store, user);
    let prev = getOrDefault(store, user, txId);
    m.add(txId, { prev with note = ?note });
  };
};
