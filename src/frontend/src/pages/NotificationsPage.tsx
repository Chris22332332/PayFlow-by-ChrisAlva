import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type NotifFilterTab,
  filterNotifications,
  groupNotificationsByDate,
  relativeTime,
  useClearAllNotifications,
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { AppNotification, NotifType } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Gift,
  Info,
  Lock,
  Settings,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ── Type → display config ─────────────────────────────────────────────────────

interface TypeConfig {
  label: string;
  iconNode: React.ReactNode;
  bg: string;
}

function getTypeConfig(type: NotifType): TypeConfig {
  const configs: Record<NotifType, TypeConfig> = {
    payment_received: {
      label: "💳",
      iconNode: <span className="text-lg leading-none">💳</span>,
      bg: "bg-emerald-500/10",
    },
    payment_sent: {
      label: "📤",
      iconNode: <span className="text-lg leading-none">📤</span>,
      bg: "bg-emerald-500/10",
    },
    money_request: {
      label: "🙏",
      iconNode: <span className="text-lg leading-none">🙏</span>,
      bg: "bg-emerald-500/10",
    },
    request_approved: {
      label: "✅",
      iconNode: <span className="text-lg leading-none">✅</span>,
      bg: "bg-emerald-500/10",
    },
    request_declined: {
      label: "❌",
      iconNode: <span className="text-lg leading-none">❌</span>,
      bg: "bg-destructive/10",
    },
    security_alert: {
      label: "🔒",
      iconNode: <Lock className="h-4 w-4 text-destructive" />,
      bg: "bg-destructive/10",
    },
    budget_alert: {
      label: "⚠️",
      iconNode: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      bg: "bg-yellow-500/10",
    },
    savings_milestone: {
      label: "🏆",
      iconNode: <span className="text-lg leading-none">🏆</span>,
      bg: "bg-yellow-500/10",
    },
    referral_reward: {
      label: "🎁",
      iconNode: <Gift className="h-4 w-4 text-purple-500" />,
      bg: "bg-purple-500/10",
    },
    subscription_update: {
      label: "⭐",
      iconNode: <span className="text-lg leading-none">⭐</span>,
      bg: "bg-purple-500/10",
    },
    system: {
      label: "ℹ️",
      iconNode: <Info className="h-4 w-4 text-primary" />,
      bg: "bg-primary/10",
    },
  };
  return configs[type] ?? configs.system;
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

const TABS: Array<{ id: NotifFilterTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "payments", label: "Payments" },
  { id: "security", label: "Security" },
  { id: "alerts", label: "Alerts" },
  { id: "promotions", label: "Promotions" },
  { id: "system", label: "System" },
];

// ── Notification item ─────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  index,
  onRead,
}: {
  notification: AppNotification;
  index: number;
  onRead: (n: AppNotification) => void;
}) {
  const cfg = getTypeConfig(notification.type);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => onRead(notification)}
      className={cn(
        "w-full text-left px-4 py-4 flex items-start gap-4 rounded-xl border transition-all duration-200",
        "hover:shadow-md",
        notification.read
          ? "bg-card border-border/50 hover:bg-muted/30"
          : "bg-primary/5 border-primary/20 hover:bg-primary/8",
      )}
      data-ocid={`notifications.item.${index + 1}`}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          cfg.bg,
        )}
      >
        {cfg.iconNode}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              notification.read
                ? "font-normal text-muted-foreground"
                : "font-semibold text-foreground",
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap mt-0.5">
            {relativeTime(notification.createdAt)}
          </span>
        </div>
        <p
          className={cn(
            "text-xs mt-1 line-clamp-2",
            notification.read
              ? "text-muted-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {notification.body}
        </p>
      </div>

      {/* Unread indicator */}
      <div className="shrink-0 mt-1.5 w-5 flex justify-center">
        {!notification.read && (
          <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
        )}
      </div>
    </motion.button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
      data-ocid="notifications.empty_state"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <Bell className="h-9 w-9 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {filtered ? "No notifications here" : "You're all caught up!"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {filtered
          ? "No notifications match this filter. Try switching tabs."
          : "All notifications have been cleared. New activity will appear here."}
      </p>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-3" data-ocid="notifications.loading_state">
      {(["s1", "s2", "s3", "s4", "s5"] as const).map((k) => (
        <div
          key={k}
          className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card"
        >
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const clearAll = useClearAllNotifications();

  const [activeTab, setActiveTab] = useState<NotifFilterTab>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = filterNotifications(notifications, activeTab);
  const grouped = groupNotificationsByDate(filtered);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredUnread = filtered.filter((n) => !n.read).length;

  function handleClickNotif(n: AppNotification) {
    if (!n.read) markRead.mutate(n.id);
    if (n.actionUrl) {
      navigate({ to: n.actionUrl as "/" });
    }
  }

  function handleClearAll() {
    clearAll.mutate();
    setShowClearConfirm(false);
  }

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-8 space-y-6"
      data-ocid="notifications.page"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground font-bold px-2 py-0.5 text-xs"
                data-ocid="notifications.unread_badge"
              >
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay on top of your payments, security, and account activity.
          </p>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2 shrink-0">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="flex items-center gap-1.5 text-xs"
              data-ocid="notifications.mark_all_read_button"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
              data-ocid="notifications.clear_all_button"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => {
          const tabUnread =
            tab.id === "all"
              ? unreadCount
              : filterNotifications(notifications, tab.id).filter(
                  (n) => !n.read,
                ).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted",
              )}
              data-ocid={`notifications.filter.${tab.id}`}
            >
              {tab.label}
              {tabUnread > 0 && (
                <span
                  className={cn(
                    "min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1",
                    activeTab === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/15 text-primary",
                  )}
                >
                  {tabUnread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState filtered={activeTab !== "all"} />
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
          <div className="space-y-6 pr-2">
            <AnimatePresence mode="popLayout">
              {grouped.map(({ group, items }) => (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Date group label */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group}
                    </span>
                    <div className="flex-1 h-px bg-border/60" />
                    {group === "Today" && filteredUnread > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {filteredUnread} unread
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {items.map((notif, i) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        index={i}
                        onRead={handleClickNotif}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* Manage preferences link */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center pt-2 border-t border-border/50"
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/settings" })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
            data-ocid="notifications.manage_preferences_link"
          >
            <Settings className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform duration-300" />
            Manage notification settings →
          </button>
        </motion.div>
      )}

      {/* Clear all confirmation dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent data-ocid="notifications.clear_dialog">
          <DialogHeader>
            <DialogTitle>Clear all notifications?</DialogTitle>
            <DialogDescription>
              This will permanently delete all {notifications.length}{" "}
              notifications. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
              data-ocid="notifications.clear_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={clearAll.isPending}
              data-ocid="notifications.clear_confirm_button"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
