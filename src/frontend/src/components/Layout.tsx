import type { Subscription } from "@/backend";
import { SubscriptionStatus } from "@/backend";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/pages/SubscriptionsPage";
import { TierBadge, planIdFromTier } from "@/pages/SubscriptionsPage";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Activity, BarChart3, Bell, HelpCircle, PiggyBank } from "lucide-react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { TopNav } from "./TopNav";

interface LayoutProps {
  children: React.ReactNode;
}

const secondaryNavLinks = [
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/savings", label: "Savings", icon: PiggyBank },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/help", label: "Help", icon: HelpCircle },
];

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { actor, isFetching } = useBackend();

  const { data: subscription } = useQuery<Subscription | null>({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSubscription();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const activeTierId: PlanId =
    subscription &&
    (subscription.status === SubscriptionStatus.active ||
      subscription.status === SubscriptionStatus.trialing)
      ? planIdFromTier(subscription.tier)
      : "free";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav subscriptionTier={activeTierId} />

      {/* Secondary nav — quick access to extra pages */}
      <div className="bg-card/60 border-b border-border sticky top-16 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {secondaryNavLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                data-ocid={`layout.${label.toLowerCase()}_link`}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-smooth shrink-0",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
      <footer className="bg-muted/40 border-t border-border py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
          <TierBadge tier={activeTierId} />
        </div>
      </footer>
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          duration: 4500,
          classNames: {
            toast: "bg-card border-border",
          },
        }}
      />
    </div>
  );
}
