import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Zap } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-3xl tracking-tight">
            PayFlow
          </span>
        </div>

        {/* Card */}
        <div
          className="bg-card border border-border rounded-2xl p-8 shadow-elevated"
          data-ocid="login.card"
        >
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in securely with Internet Identity to access your wallet
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 mb-6 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <span>
              Secured by Internet Identity — no passwords, no tracking, full
              control
            </span>
          </div>

          <Button
            className="w-full h-12 font-display font-semibold text-base"
            onClick={() => login()}
            disabled={isLoading}
            data-ocid="login.submit_button"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Connecting...
              </span>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          New to PayFlow?{" "}
          <button
            type="button"
            onClick={() => login()}
            className="text-primary hover:underline"
            data-ocid="login.register_link"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
