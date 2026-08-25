import Map     "mo:core/Map";
import List    "mo:core/List";
import Time    "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Common  "../types/common";
import CTypes  "../types/contacts";

module {
  public type TrustedContact = CTypes.TrustedContact;

  public func addContact(
    store       : Map.Map<Principal, List.List<TrustedContact>>,
    nextId      : Common.Counter,
    user        : Principal,
    name        : Text,
    relationship : Text,
    phone       : ?Text,
    email       : ?Text,
    accessLevel : Text,
  ) {
    let contact : TrustedContact = {
      id = nextId.value;
      name;
      relationship;
      phone;
      email;
      accessLevel;
      addedAt = Time.now();
    };
    nextId.value += 1;
    switch (store.get(user)) {
      case (?list) { list.add(contact) };
      case null {
        let list = List.empty<TrustedContact>();
        list.add(contact);
        store.add(user, list);
      };
    };
  };

  public func getContacts(
    store : Map.Map<Principal, List.List<TrustedContact>>,
    user  : Principal,
  ) : [TrustedContact] {
    switch (store.get(user)) {
      case null [];
      case (?list) list.toArray();
    };
  };

  public func removeContact(
    store : Map.Map<Principal, List.List<TrustedContact>>,
    user  : Principal,
    id    : Nat,
  ) : Bool {
    switch (store.get(user)) {
      case null false;
      case (?list) {
        let before = list.size();
        let filtered = list.filter(func(c : TrustedContact) : Bool { c.id != id });
        list.clear();
        list.append(filtered);
        list.size() < before;
      };
    };
  };

  public func updateContact(
    store        : Map.Map<Principal, List.List<TrustedContact>>,
    user         : Principal,
    id           : Nat,
    name         : Text,
    relationship : Text,
    phone        : ?Text,
    email        : ?Text,
    accessLevel  : Text,
  ) : Bool {
    switch (store.get(user)) {
      case null false;
      case (?list) {
        let found = list.find(func(c : TrustedContact) : Bool { c.id == id }) != null;
        if (found) {
          list.mapInPlace(func(c : TrustedContact) : TrustedContact {
            if (c.id == id) {
              { c with name; relationship; phone; email; accessLevel }
            } else c
          });
        };
        found;
      };
    };
  };
};
