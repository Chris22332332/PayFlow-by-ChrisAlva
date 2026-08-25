import Map           "mo:core/Map";
import Principal     "mo:core/Principal";
import Runtime       "mo:core/Runtime";
import OutCall       "mo:caffeineai-http-outcalls/outcall";
import AccessControl "mo:caffeineai-authorization/access-control";
import PhoneTypes    "../types/phone";
import PhoneLib      "../lib/phone";

mixin (
  accessControlState : AccessControl.AccessControlState,
  phoneVerifications : Map.Map<Principal, PhoneTypes.PhoneVerification>,
  twilioConfig       : { var accountSid : Text; var authToken : Text; var fromNumber : Text },
  transform          : OutCall.Transform,
) {
  /// HTTP outcall transform function required for Twilio API calls.
  public query func twilioTransform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    PhoneLib.twilioTransform(input);
  };

  /// Send a 6-digit SMS verification code to the given phone number via Twilio.
  public shared ({ caller }) func requestPhoneVerification(phone : Text) : async { #ok : Text; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    await* PhoneLib.requestVerification(
      phoneVerifications,
      twilioConfig.accountSid,
      twilioConfig.authToken,
      twilioConfig.fromNumber,
      caller,
      phone,
      transform,
    );
  };

  /// Verify the OTP code the user received; marks phone as verified on success.
  public shared ({ caller }) func verifyPhone(code : Text) : async { #ok : Bool; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PhoneLib.verifyCode(phoneVerifications, caller, code);
  };

  /// Remove the phone number linked to the caller's account.
  public shared ({ caller }) func unlinkPhone() : async { #ok : Bool; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PhoneLib.unlinkPhone(phoneVerifications, caller);
  };
};
