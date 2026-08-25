import Common "common";

module {
  public type ActivityType = {
    #Sent;
    #Received;
    #SavingsGoal;
    #Achievement;
    #JoinedViaInvite;
  };

  public type ReactionEntry = {
    emoji : Text;
    by    : [Principal];
  };

  public type ActivityItem = {
    id           : Nat;
    actorPrincipal : Principal;
    actorUsername  : Text;
    actionType     : ActivityType;
    amount         : ?Nat;
    currency       : ?Common.Currency;
    note           : ?Text;
    timestamp      : Common.Timestamp;
    isPublic       : Bool;
    reactions      : [ReactionEntry];
  };
};
