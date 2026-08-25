import Map          "mo:core/Map";
import List         "mo:core/List";
import Principal    "mo:core/Principal";
import Runtime      "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common       "../types/common";
import CTypes       "../types/contacts";
import ContactsLib  "../lib/contacts";

mixin (
  accessControlState : AccessControl.AccessControlState,
  contactsStore      : Map.Map<Principal, List.List<CTypes.TrustedContact>>,
  nextContactId      : Common.Counter,
) {
  /// Add a trusted contact.
  public shared ({ caller }) func addTrustedContact(
    name         : Text,
    relationship : Text,
    phone        : ?Text,
    email        : ?Text,
    accessLevel  : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ContactsLib.addContact(contactsStore, nextContactId, caller, name, relationship, phone, email, accessLevel);
  };

  /// Get all trusted contacts for the caller.
  public query ({ caller }) func getTrustedContacts() : async [CTypes.TrustedContact] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ContactsLib.getContacts(contactsStore, caller);
  };

  /// Remove a trusted contact by ID.
  public shared ({ caller }) func removeTrustedContact(id : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ContactsLib.removeContact(contactsStore, caller, id);
  };

  /// Update a trusted contact.
  public shared ({ caller }) func updateTrustedContact(
    id           : Nat,
    name         : Text,
    relationship : Text,
    phone        : ?Text,
    email        : ?Text,
    accessLevel  : Text,
  ) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ContactsLib.updateContact(contactsStore, caller, id, name, relationship, phone, email, accessLevel);
  };
};
