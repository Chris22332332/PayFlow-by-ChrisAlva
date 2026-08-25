import Map       "mo:core/Map";
import List      "mo:core/List";
import Principal "mo:core/Principal";
import Runtime   "mo:core/Runtime";
import Types     "../types/payment";

module {
  public type PaymentMethod = Types.PaymentMethod;

  /// Get or initialize the payment method list for a user
  func getUserMethods(
    methods : Map.Map<Principal, List.List<PaymentMethod>>,
    caller  : Principal,
  ) : List.List<PaymentMethod> {
    switch (methods.get(caller)) {
      case (?list) list;
      case null {
        let list = List.empty<PaymentMethod>();
        methods.add(caller, list);
        list;
      };
    };
  };

  /// Add a new tokenized payment method for a user
  public func addMethod(
    methods      : Map.Map<Principal, List.List<PaymentMethod>>,
    caller       : Principal,
    token        : Text,
    last4        : Text,
    expiry       : Text,
    pmType       : Types.PaymentMethodType,
    displayLabel : Text,
    nextId       : Nat,
  ) {
    let list = getUserMethods(methods, caller);
    // First method becomes default automatically
    let isDefault = list.size() == 0;
    list.add({
      id = nextId;
      token;
      last4;
      expiry;
      pmType;
      isDefault;
      displayLabel;
      stripe_payment_method_id = null;
      verification_status = #Unverified;
      account_holder_name = null;
    });
  };

  /// Remove a payment method by id; if it was the default, promote the first remaining one
  public func removeMethod(
    methods : Map.Map<Principal, List.List<PaymentMethod>>,
    caller  : Principal,
    id      : Nat,
  ) {
    let list = switch (methods.get(caller)) {
      case (?l) l;
      case null { Runtime.trap("No payment methods found") };
    };
    let removed = switch (list.find(func(pm : PaymentMethod) : Bool = pm.id == id)) {
      case (?pm) pm;
      case null  { Runtime.trap("Payment method not found") };
    };

    // Build a new list without the removed item, stored back under the caller key
    let newList = list.filter(func(pm : PaymentMethod) : Bool = pm.id != id);

    // If the removed item was the default, promote the new first item
    if (removed.isDefault) {
      switch (newList.first()) {
        case null {};
        case (?first) {
          newList.mapInPlace(func(pm : PaymentMethod) : PaymentMethod {
            { pm with isDefault = pm.id == first.id };
          });
        };
      };
    };

    // Replace the old list contents: clear + append
    list.clear();
    list.append(newList);
  };

  /// Set a payment method as the default; clears previous default
  public func setDefault(
    methods : Map.Map<Principal, List.List<PaymentMethod>>,
    caller  : Principal,
    id      : Nat,
  ) {
    let list = switch (methods.get(caller)) {
      case (?l) l;
      case null { Runtime.trap("No payment methods found") };
    };
    // Verify the target id exists
    switch (list.find(func(pm : PaymentMethod) : Bool = pm.id == id)) {
      case null  { Runtime.trap("Payment method not found") };
      case (?_) {};
    };
    list.mapInPlace(func(pm : PaymentMethod) : PaymentMethod {
      { pm with isDefault = pm.id == id };
    });
  };

  /// Return all payment methods for a user as an immutable array
  public func listMethods(
    methods : Map.Map<Principal, List.List<PaymentMethod>>,
    caller  : Principal,
  ) : [PaymentMethod] {
    switch (methods.get(caller)) {
      case null    { [] };
      case (?list) { list.toArray() };
    };
  };
};
