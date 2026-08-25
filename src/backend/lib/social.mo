import List    "mo:core/List";
import Array   "mo:core/Array";
import Time    "mo:core/Time";
import Principal "mo:core/Principal";
import Common  "../types/common";
import SocTypes "../types/social";

module {
  public type ActivityItem = SocTypes.ActivityItem;
  public type ActivityType = SocTypes.ActivityType;
  public type ReactionEntry = SocTypes.ReactionEntry;

  public func addActivity(
    feed       : List.List<ActivityItem>,
    nextActId  : Common.Counter,
    actorId    : Principal,
    username   : Text,
    actionType : ActivityType,
    amount     : ?Nat,
    currency   : ?Common.Currency,
    note       : ?Text,
    isPublic   : Bool,
  ) {
    let item : ActivityItem = {
      id             = nextActId.value;
      actorPrincipal = actorId;
      actorUsername  = username;
      actionType;
      amount;
      currency;
      note;
      timestamp      = Time.now();
      isPublic;
      reactions      = [];
    };
    nextActId.value += 1;
    feed.add(item);
  };

  public func getFeed(
    feed   : List.List<ActivityItem>,
    caller : Principal,
    limit  : Nat,
    offset : Nat,
  ) : [ActivityItem] {
    // Return public items + caller's own items, paginated
    let visible = feed.filter(func(a : ActivityItem) : Bool {
      a.isPublic or Principal.equal(a.actorPrincipal, caller)
    });
    let arr = visible.toArray();
    let total = arr.size();
    if (offset >= total) { return [] };
    let endIdx = if (offset + limit > total) total else offset + limit;
    arr.sliceToArray(offset.toInt(), endIdx.toInt());
  };

  public func setVisibility(
    feed     : List.List<ActivityItem>,
    caller   : Principal,
    actId    : Nat,
    isPublic : Bool,
  ) : Bool {
    let found = feed.find(func(a : ActivityItem) : Bool {
      a.id == actId and Principal.equal(a.actorPrincipal, caller)
    }) != null;
    if (found) {
      feed.mapInPlace(func(a : ActivityItem) : ActivityItem {
        if (a.id == actId and Principal.equal(a.actorPrincipal, caller)) {
          { a with isPublic }
        } else a
      });
    };
    found;
  };

  public func addReaction(
    feed    : List.List<ActivityItem>,
    actId   : Nat,
    emoji   : Text,
    reactor : Principal,
  ) : Bool {
    let found = feed.find(func(a : ActivityItem) : Bool { a.id == actId }) != null;
    if (found) {
      feed.mapInPlace(func(a : ActivityItem) : ActivityItem {
        if (a.id == actId) {
          // Check if emoji already exists in reactions
          let hasEmoji = a.reactions.any(func(r : ReactionEntry) : Bool { r.emoji == emoji });
          if (hasEmoji) {
            let newReactions = a.reactions.map(func(r : ReactionEntry) : ReactionEntry {
              if (r.emoji == emoji) {
                // Add principal if not already present
                let alreadyReacted = r.by.any(func(p : Principal) : Bool { Principal.equal(p, reactor) });
                if (alreadyReacted) r
                else (
                  { emoji = r.emoji; by = r.by.concat([reactor]) } : ReactionEntry
                )
              } else r
            });
            { a with reactions = newReactions }
          } else {
            { a with reactions = a.reactions.concat([{ emoji; by = [reactor] }]) }
          }
        } else a
      });
    };
    found;
  };

  public func removeReaction(
    feed    : List.List<ActivityItem>,
    actId   : Nat,
    emoji   : Text,
    reactor : Principal,
  ) : Bool {
    let found = feed.find(func(a : ActivityItem) : Bool { a.id == actId }) != null;
    if (found) {
      feed.mapInPlace(func(a : ActivityItem) : ActivityItem {
        if (a.id == actId) {
          let newReactions = a.reactions.filterMap(func(r : ReactionEntry) : ?ReactionEntry {
            if (r.emoji == emoji) {
              let filtered = r.by.filter(func(p : Principal) : Bool { not Principal.equal(p, reactor) });
              if (filtered.size() == 0) null
              else ?{ emoji = r.emoji; by = filtered }
            } else ?r
          });
          { a with reactions = newReactions }
        } else a
      });
    };
    found;
  };
};
