import Map     "mo:core/Map";
import Text    "mo:core/Text";
import CCTypes "../types/card-controls";

module {
  public type CardControl = CCTypes.CardControl;

  func defaultControl(pmId : Text) : CardControl {
    {
      paymentMethodId      = pmId;
      isFrozen             = false;
      onlineEnabled        = true;
      internationalEnabled = false;
      maxTransactionLimit  = null;
      hasVirtualCard       = false;
      virtualCardLast4     = null;
      virtualCardExpiry    = null;
    };
  };

  public func getControl(
    store : Map.Map<Text, CardControl>,
    pmId  : Text,
  ) : CardControl {
    switch (store.get(pmId)) {
      case (?c) c;
      case null defaultControl(pmId);
    };
  };

  public func freeze(
    store : Map.Map<Text, CardControl>,
    pmId  : Text,
  ) {
    let ctrl = getControl(store, pmId);
    store.add(pmId, { ctrl with isFrozen = true });
  };

  public func unfreeze(
    store : Map.Map<Text, CardControl>,
    pmId  : Text,
  ) {
    let ctrl = getControl(store, pmId);
    store.add(pmId, { ctrl with isFrozen = false });
  };

  public func setControls(
    store                : Map.Map<Text, CardControl>,
    pmId                 : Text,
    onlineEnabled        : Bool,
    internationalEnabled : Bool,
    maxTxLimit           : ?Nat,
  ) {
    let ctrl = getControl(store, pmId);
    store.add(pmId, {
      ctrl with
      onlineEnabled;
      internationalEnabled;
      maxTransactionLimit = maxTxLimit;
    });
  };

  public func generateVirtual(
    store : Map.Map<Text, CardControl>,
    pmId  : Text,
  ) : CardControl {
    let ctrl = getControl(store, pmId);
    // Deterministic virtual card generation from pmId hash
    let last4 = Text.fromChar('V') # pmId.size().toText() # "42";
    let expiry = "12/27";
    let updated : CardControl = {
      ctrl with
      hasVirtualCard   = true;
      virtualCardLast4 = ?last4;
      virtualCardExpiry = ?expiry;
    };
    store.add(pmId, updated);
    updated;
  };

  public func reportLostStolen(
    store : Map.Map<Text, CardControl>,
    pmId  : Text,
  ) {
    let ctrl = getControl(store, pmId);
    store.add(pmId, { ctrl with isFrozen = true; hasVirtualCard = false; virtualCardLast4 = null; virtualCardExpiry = null });
  };
};
