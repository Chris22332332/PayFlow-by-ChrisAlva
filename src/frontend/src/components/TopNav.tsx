import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/pages/SubscriptionsPage";
import { TierBadge } from "@/pages/SubscriptionsPage";
import type { AppNotification } from "@/types";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Crown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Send,
  Settings,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transfers", label: "Transfers", icon: Send },
  { to: "/payment-methods", label: "Cards", icon: CreditCard },
  { to: "/subscriptions", label: "Subscriptions", icon: Crown },
  { to: "/settings", label: "Settings", icon: Settings },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
      aria-label="Toggle theme"
      data-ocid="topnav.theme_toggle"
    >
      <Sun className="h-4 w-4 hidden dark:block" />
      <Moon className="h-4 w-4 block dark:hidden" />
    </button>
  );
}

function NotifIcon(type: AppNotification["type"]) {
  const map: Record<AppNotification["type"], string> = {
    payment_received: "💸",
    payment_sent: "📤",
    money_request: "🙏",
    request_approved: "✅",
    request_declined: "❌",
    referral_reward: "🎁",
    security_alert: "🔒",
    subscription_update: "⭐",
    budget_alert: "⚠️",
    savings_milestone: "🏆",
    system: "🔔",
  };
  return map[type] ?? "🔔";
}

function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 5);

  function handleClickNotif(n: AppNotification) {
    if (!n.read) markRead.mutate(n.id);
    if (n.actionUrl) navigate({ to: n.actionUrl as "/" });
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        data-ocid="topnav.notifications_button"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-0.5">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            role="presentation"
          />
          <div
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden"
            data-ocid="topnav.notifications_popover"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => markAll.mutate()}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                    data-ocid="topnav.mark_all_read_button"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground"
                  data-ocid="topnav.notifications_close_button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {recent.length === 0 ? (
                <div
                  className="py-8 text-center text-muted-foreground text-sm"
                  data-ocid="topnav.notifications_empty_state"
                >
                  No notifications yet
                </div>
              ) : (
                recent.map((n, i) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleClickNotif(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors",
                      !n.read && "bg-primary/5",
                    )}
                    data-ocid={`topnav.notification_item.${i + 1}`}
                  >
                    <span className="text-lg leading-none shrink-0 mt-0.5">
                      {NotifIcon(n.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-medium truncate",
                          !n.read && "text-foreground",
                          n.read && "text-muted-foreground",
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                    )}
                    {n.read && (
                      <Check className="shrink-0 h-3 w-3 text-muted-foreground mt-1" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-border">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline"
                data-ocid="topnav.view_all_notifications_link"
              >
                View all notifications
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface TopNavProps {
  subscriptionTier?: PlanId;
}

export function TopNav({ subscriptionTier = "free" }: TopNavProps) {
  const { logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            PayFlow
          </span>
        </Link>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  data-ocid={`topnav.${label.toLowerCase().replace(" ", "_")}_link`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tier badge */}
          <TierBadge
            tier={subscriptionTier}
            className="hidden sm:inline-flex"
          />

          <NotificationBell />
          <ThemeToggle />

          {!isMobile && (
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              data-ocid="topnav.logout_button"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          )}
          {isMobile && (
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              aria-label="Toggle menu"
              data-ocid="topnav.menu_toggle"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && menuOpen && (
        <div className="border-t border-border bg-card px-4 py-3 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                data-ocid={`topnav.mobile_${label.toLowerCase().replace(" ", "_")}_link`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
            data-ocid="topnav.mobile_logout_button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
