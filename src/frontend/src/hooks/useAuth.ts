import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const isAuthenticated = loginStatus === "success" && identity !== undefined;
  const isLoading = loginStatus === "logging-in";

  const principal = identity?.getPrincipal();

  return {
    login,
    logout: clear,
    isAuthenticated,
    isLoading,
    loginStatus,
    identity,
    principal,
  };
}
