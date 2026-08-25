import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRedeemInvite, useValidateInvite } from "@/hooks/useInvite";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PERKS = [
  { icon: Zap, label: "Instant transfers", detail: "Send money in seconds" },
  {
    icon: Shield,
    label: "Bank-grade security",
    detail: "Internet Identity — no passwords",
  },
  {
    icon: CheckCircle,
    label: "Multi-currency wallets",
    detail: "USD, EUR, GBP and more",
  },
];

export default function InvitePage() {
  const { code } = useParams({ from: "/invite/$code" });
  const {
    login,
    isAuthenticated,
    isLoading: authLoading,
    loginStatus,
  } = useAuth();
  const navigate = useNavigate();
  const redeemInvite = useRedeemInvite();
  const { data: isValid, isLoading: validating } = useValidateInvite(code);

  const [redemptionState, setRedemptionState] = useState<
    "idle" | "redeeming" | "done"
  >("idle");
  const hasRedeemedRef = useRef(false);

  // After login completes, redeem the invite and redirect
  useEffect(() => {
    if (
      isAuthenticated &&
      isValid &&
      redemptionState === "idle" &&
      !hasRedeemedRef.current
    ) {
      hasRedeemedRef.current = true;
      setRedemptionState("redeeming");
      redeemInvite
        .mutateAsync(code)
        .then(() => {
          setRedemptionState("done");
          toast.success("Welcome to PayFlow! Your account is ready.");
          navigate({ to: "/dashboard" });
        })
        .catch(() => {
          // Invite already redeemed or expired — still go to dashboard
          setRedemptionState("done");
          navigate({ to: "/dashboard" });
        });
    }
  }, [isAuthenticated, isValid, redemptionState, code, redeemInvite, navigate]);

  const handleCTA = () => {
    if (isAuthenticated) {
      // Already logged in — just redirect
      navigate({ to: "/dashboard" });
    } else {
      login();
    }
  };

  const isWorking =
    authLoading ||
    loginStatus === "logging-in" ||
    redemptionState === "redeeming";

  // Loading: validating invite
  if (validating) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="invite.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <Spinner size="lg" className="text-primary" />
          <p className="text-sm text-muted-foreground">Checking your invite…</p>
        </div>
      </div>
    );
  }

  // Invalid / expired invite
  if (isValid === false) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
        data-ocid="invite.error_state"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-destructive/5 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-display font-bold text-2xl mb-3">
            Invite expired or invalid
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            This invite link is no longer active. Ask your friend for a fresh
            link, or sign in directly.
          </p>
          <Button
            className="w-full h-12 font-display font-semibold"
            onClick={() => navigate({ to: "/login" })}
            data-ocid="invite.go_to_login_button"
          >
            Go to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  // Valid invite — main landing
  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="invite.page"
    >
      {/* Gradient backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-3xl tracking-tight">
              PayFlow
            </span>
          </div>

          {/* Hero card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-elevated text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium mb-6">
              <CheckCircle className="h-3.5 w-3.5" />
              You've been invited
            </div>

            <h1 className="font-display font-bold text-3xl mb-3 leading-tight">
              Send &amp; receive real money
              <br />
              <span className="text-primary">instantly</span>
            </h1>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Your friend invited you to PayFlow — a secure digital wallet for
              instant P2P payments. Create your free account in seconds.
            </p>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {PERKS.map(({ icon: Icon, label, detail }) => (
                <div
                  key={label}
                  className="bg-muted/50 rounded-xl p-3 text-left"
                >
                  <Icon className="h-4 w-4 text-primary mb-1.5" />
                  <p className="font-medium text-xs leading-tight">{label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-tight">
                    {detail}
                  </p>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-13 font-display font-semibold text-base bg-primary hover:bg-primary/90"
              onClick={handleCTA}
              disabled={isWorking}
              data-ocid="invite.create_account_button"
            >
              {isWorking ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  {redemptionState === "redeeming"
                    ? "Setting up your account…"
                    : "Connecting…"}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account &amp; Start Sending Money
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/login" })}
                className="text-primary hover:underline"
                data-ocid="invite.sign_in_link"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 bg-card/60 border border-border rounded-xl p-4 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              Secured by{" "}
              <span className="text-foreground font-medium">
                Internet Identity
              </span>{" "}
              — no passwords, no tracking. You own your identity and your money.
            </span>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative text-center py-6 text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
