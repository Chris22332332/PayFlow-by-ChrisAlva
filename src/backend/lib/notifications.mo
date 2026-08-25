import Map     "mo:core/Map";
import List    "mo:core/List";
import Time    "mo:core/Time";
import Principal "mo:core/Principal";
import NTypes  "../types/notifications";
import Common  "../types/common";

module {
  public type Notification = NTypes.Notification;
  public type NotifType    = NTypes.NotifType;

  public func getNotifications(
    store  : Map.Map<Principal, List.List<Notification>>,
    user   : Principal,
  ) : [Notification] {
    switch (store.get(user)) {
      case null [];
      case (?list) list.toArray();
    };
  };

  public func addNotification(
    store     : Map.Map<Principal, List.List<Notification>>,
    nextNotifId : Common.Counter,
    user      : Principal,
    notifType : NotifType,
    title     : Text,
    body      : Text,
    relatedTxId : ?Common.TxId,
  ) {
    let notif : Notification = {
      id          = nextNotifId.value;
      notifType;
      title;
      body;
      timestamp   = Time.now();
      isRead      = false;
      relatedTxId;
    };
    nextNotifId.value += 1;
    switch (store.get(user)) {
      case (?list) { list.add(notif) };
      case null {
        let list = List.empty<Notification>();
        list.add(notif);
        store.add(user, list);
      };
    };
  };

  public func markRead(
    store  : Map.Map<Principal, List.List<Notification>>,
    user   : Principal,
    id     : Nat,
  ) : Bool {
    switch (store.get(user)) {
      case null false;
      case (?list) {
        let found = list.find(func(n : Notification) : Bool { n.id == id }) != null;
        if (found) {
          list.mapInPlace(func(n : Notification) : Notification {
            if (n.id == id) { { n with isRead = true } } else n
          });
        };
        found;
      };
    };
  };

  public func markAllRead(
    store : Map.Map<Principal, List.List<Notification>>,
    user  : Principal,
  ) {
    switch (store.get(user)) {
      case null {};
      case (?list) {
        list.mapInPlace(func(n : Notification) : Notification {
          { n with isRead = true }
        });
      };
    };
  };
};
