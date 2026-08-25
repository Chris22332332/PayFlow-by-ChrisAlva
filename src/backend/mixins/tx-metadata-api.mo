import Map           "mo:core/Map";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common        "../types/common";
import TxMeta        "../types/tx-metadata";
import TxMetaLib     "../lib/tx-metadata";

mixin (
  accessControlState : AccessControl.AccessControlState,
  txMetaStore        : Map.Map<Principal, Map.Map<Common.TxId, TxMeta.TxMetadata>>,
) {
  /// Set tags on a transaction.
  public shared ({ caller }) func setTransactionTags(txId : Common.TxId, tags : [Text]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    TxMetaLib.setTags(txMetaStore, caller, txId, tags);
  };

  /// Set a note on a transaction.
  public shared ({ caller }) func setTransactionNote(txId : Common.TxId, note : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    TxMetaLib.setNote(txMetaStore, caller, txId, note);
  };

  /// Get metadata for a transaction.
  public query ({ caller }) func getTransactionMetadata(txId : Common.TxId) : async TxMeta.TxMetadata {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    TxMetaLib.getOrDefault(txMetaStore, caller, txId);
  };
};
