import Map           "mo:core/Map";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import PTypes        "../types/profile";
import ProfileLib    "../lib/profile";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles           : Map.Map<Principal, PTypes.UserProfile>,
) {
  /// Save the caller's own profile (auto-generates userId if blank).
  public shared ({ caller }) func saveCallerUserProfile(profile : PTypes.UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProfileLib.saveProfile(profiles, caller, profile);
  };

  /// Get the caller's own profile (required by authorization extension).
  public query ({ caller }) func getCallerUserProfile() : async ?PTypes.UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProfileLib.getProfile(profiles, caller);
  };

  /// Get another user's profile (required by authorization extension).
  public query ({ caller }) func getUserProfile(user : Principal) : async ?PTypes.UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    ProfileLib.getProfile(profiles, user);
  };

  /// Look up a user principal by username, email, or phone (for P2P recipient lookup).
  public query ({ caller }) func findUser(field : { #username : Text; #email : Text; #phone : Text }) : async ?Principal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (field) {
      case (#username text) { ProfileLib.findByUsername(profiles, text) };
      case (#email text)    { ProfileLib.findByEmail(profiles, text) };
      case (#phone text)    { ProfileLib.findByPhone(profiles, text) };
    };
  };

  /// Find a user's profile by their visible userId or username identifier.
  public query ({ caller }) func findUserByIdOrUsername(identifier : Text) : async ?PTypes.UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProfileLib.findByIdOrUsername(profiles, identifier);
  };

  /// Update the caller's profile photo URL (from object storage).
  public shared ({ caller }) func updateProfilePhoto(photoUrl : Text) : async { #ok : Bool; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProfileLib.updatePhoto(profiles, caller, photoUrl);
  };
};
