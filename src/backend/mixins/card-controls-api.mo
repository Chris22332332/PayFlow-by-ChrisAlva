import Map             "mo:core/Map";
import Principal       "mo:core/Principal";
import Runtime         "mo:core/Runtime";
import AccessControl   "mo:caffeineai-authorization/access-control";
import CCTypes         "../types/card-controls";
import CardControlsLib "../lib/card-controls";

mixin (
  accessControlState : AccessControl.AccessControlState,
  cardControls       : Map.Map<Text, CCTypes.CardControl>,
) {
  /// Get control settings for a card.
  public query ({ caller }) func getCardControls(pmId : Text) : async CCTypes.CardControl {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    CardControlsLib.getControl(cardControls, pmId);
  };

  /// Freeze a card.
  public shared ({ caller }) func freezeCard(pmId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    CardControlsLib.freeze(cardControls, pmId);
  };

  /// Unfreeze a card.
  public shared ({ caller }) func unfreezeCard(pmId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    CardControlsLib.unfreeze(cardControls, pmId);
  };

  /// Update card control settings (online, international, transaction limit).
  public shared ({ caller }) func setCardControls(
    pmId                 : Text,
    onlineEnabled        : Bool,
    internationalEnabled : Bool,
    maxTxLimit           : ?Nat,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    CardControlsLib.setControls(cardControls, pmId, onlineEnabled, internationalEnabled, maxTxLimit);
  };

  /// Generate a virtual card number for the given payment method.
  public shared ({ caller }) func generateVirtualCard(pmId : Text) : async CCTypes.CardControl {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    CardControlsLib.generateVirtual(cardControls, pmId);
  };

  /// Report a card as lost or stolen (freezes + clears virtual).
  public shared ({ caller }) func reportCardLostStolen(pmId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    CardControlsLib.reportLostStolen(cardControls, pmId);
  };
};
