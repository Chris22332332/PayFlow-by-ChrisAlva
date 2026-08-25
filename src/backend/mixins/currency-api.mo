import Map            "mo:core/Map";
import Runtime        "mo:core/Runtime";
import AccessControl  "mo:caffeineai-authorization/access-control";
import Outcall        "mo:caffeineai-http-outcalls/outcall";
import Common         "../types/common";
import CurrencyLib    "../lib/currency";

mixin (
  accessControlState : AccessControl.AccessControlState,
  mcBalances         : Map.Map<Principal, Map.Map<Common.Currency, Common.Amount>>,
  fxRateCache        : Map.Map<Text, Common.FxRate>,
) {

  /// Transform function required by the http-outcalls extension.
  /// Strips response headers so all replicas see an identical response.
  public query func fxTransform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input)
  };

  /// Return all per-currency balances for the calling user.
  public query ({ caller }) func getMultiCurrencyBalances() : async [(Common.Currency, Common.Amount)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    CurrencyLib.getMultiCurrencyBalances(mcBalances, caller)
  };

  /// Fetch (or return cached) exchange rate between two currencies.
  public shared ({ caller }) func getExchangeRate(
    from : Common.Currency,
    to   : Common.Currency,
  ) : async Common.FxRate {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    await CurrencyLib.getExchangeRate(fxRateCache, from, to, fxTransform)
  };

  /// Convert an amount from one currency to another.
  public shared ({ caller }) func convertCurrency(
    amount : Common.Amount,
    from   : Common.Currency,
    to     : Common.Currency,
  ) : async Common.CurrencyAmount {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    await CurrencyLib.convertCurrency(fxRateCache, amount, from, to, fxTransform)
  };

  /// Return the display symbol for a currency (query — no auth needed).
  public query func getCurrencySymbol(currency : Common.Currency) : async Text {
    CurrencyLib.currencySymbol(currency)
  };
};
