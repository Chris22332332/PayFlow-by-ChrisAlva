import { af as useNavigate, ag as useNotifications, ah as useMarkNotificationRead, ai as useMarkAllRead, aj as useClearAllNotifications, r as reactExports, ak as filterNotifications, al as groupNotificationsByDate, j as jsxRuntimeExports, w as Badge, B as Button, am as CheckCheck, ad as Trash2, an as cn, a7 as AnimatePresence, m as motion, ao as Settings, E as Dialog, Y as DialogContent, _ as DialogHeader, $ as DialogTitle, ap as DialogDescription, aq as DialogFooter, S as Skeleton, ar as Bell, as as relativeTime, at as Info, au as Gift, J as TriangleAlert, L as Lock } from "./index-BQXzav6B.js";
import { S as ScrollArea } from "./scroll-area-ou4dmD_U.js";
function getTypeConfig(type) {
  const configs = {
    payment_received: {
      label: "💳",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: "💳" }),
      bg: "bg-emerald-500/10"
    },
    payment_sent: {
      label: "📤",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: "📤" }),
      bg: "bg-emerald-500/10"
    },
    money_request: {
      label: "🙏",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: "🙏" }),
      bg: "bg-emerald-500/10"
    },
    request_approved: {
      label: "✅",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: "✅" }),
      bg: "bg-emerald-500/10"
    },
    request_declined: {
      label: "❌",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: "❌" }),
      bg: "bg-destructive/10"
    },
    security_alert: {
      label: "🔒",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 text-destructive" }),
      bg: "bg-destructive/10"
    },
    budget_alert: {
      label: "⚠️",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-yellow-500" }),
      bg: "bg-yellow-500/10"
    },
    savings_milestone: {
      label: "🏆",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: "🏆" }),
      bg: "bg-yellow-500/10"
    },
    referral_reward: {
      label: "🎁",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4 text-purple-500" }),
      bg: "bg-purple-500/10"
    },
    subscription_update: {
      label: "⭐",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: "⭐" }),
      bg: "bg-purple-500/10"
    },
    system: {
      label: "ℹ️",
      iconNode: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4 text-primary" }),
      bg: "bg-primary/10"
    }
  };
  return configs[type] ?? configs.system;
}
const TABS = [
  { id: "all", label: "All" },
  { id: "payments", label: "Payments" },
  { id: "security", label: "Security" },
  { id: "alerts", label: "Alerts" },
  { id: "promotions", label: "Promotions" },
  { id: "system", label: "System" }
];
function NotificationItem({
  notification,
  index,
  onRead
}) {
  const cfg = getTypeConfig(notification.type);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.button,
    {
      type: "button",
      initial: { opacity: 0, x: -8 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.2, delay: index * 0.03 },
      onClick: () => onRead(notification),
      className: cn(
        "w-full text-left px-4 py-4 flex items-start gap-4 rounded-xl border transition-all duration-200",
        "hover:shadow-md",
        notification.read ? "bg-card border-border/50 hover:bg-muted/30" : "bg-primary/5 border-primary/20 hover:bg-primary/8"
      ),
      "data-ocid": `notifications.item.${index + 1}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              cfg.bg
            ),
            children: cfg.iconNode
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: cn(
                  "text-sm leading-snug",
                  notification.read ? "font-normal text-muted-foreground" : "font-semibold text-foreground"
                ),
                children: notification.title
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-muted-foreground whitespace-nowrap mt-0.5", children: relativeTime(notification.createdAt) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: cn(
                "text-xs mt-1 line-clamp-2",
                notification.read ? "text-muted-foreground/70" : "text-muted-foreground"
              ),
              children: notification.body
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 mt-1.5 w-5 flex justify-center", children: !notification.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20" }) })
      ]
    }
  );
}
function EmptyState({ filtered }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.97 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3 },
      className: "flex flex-col items-center justify-center py-20 px-6 text-center",
      "data-ocid": "notifications.empty_state",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-9 w-9 text-muted-foreground/50" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: filtered ? "No notifications here" : "You're all caught up!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-xs", children: filtered ? "No notifications match this filter. Try switching tabs." : "All notifications have been cleared. New activity will appear here." })
      ]
    }
  );
}
function LoadingSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "notifications.loading_state", children: ["s1", "s2", "s3", "s4", "s5"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-10 h-10 rounded-full shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3.5 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2" })
        ] })
      ]
    },
    k
  )) });
}
function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const clearAll = useClearAllNotifications();
  const [activeTab, setActiveTab] = reactExports.useState("all");
  const [showClearConfirm, setShowClearConfirm] = reactExports.useState(false);
  const filtered = filterNotifications(notifications, activeTab);
  const grouped = groupNotificationsByDate(filtered);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredUnread = filtered.filter((n) => !n.read).length;
  function handleClickNotif(n) {
    if (!n.read) markRead.mutate(n.id);
    if (n.actionUrl) {
      navigate({ to: n.actionUrl });
    }
  }
  function handleClearAll() {
    clearAll.mutate();
    setShowClearConfirm(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "max-w-2xl mx-auto px-4 py-8 space-y-6",
      "data-ocid": "notifications.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Notifications" }),
              unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  variant: "default",
                  className: "bg-primary text-primary-foreground font-bold px-2 py-0.5 text-xs",
                  "data-ocid": "notifications.unread_badge",
                  children: [
                    unreadCount,
                    " unread"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Stay on top of your payments, security, and account activity." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => markAll.mutate(),
                disabled: markAll.isPending,
                className: "flex items-center gap-1.5 text-xs",
                "data-ocid": "notifications.mark_all_read_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3.5 w-3.5" }),
                  "Mark all read"
                ]
              }
            ),
            notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setShowClearConfirm(true),
                className: "flex items-center gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5",
                "data-ocid": "notifications.clear_all_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  "Clear all"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide", children: TABS.map((tab) => {
          const tabUnread = tab.id === "all" ? unreadCount : filterNotifications(notifications, tab.id).filter(
            (n) => !n.read
          ).length;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab(tab.id),
              className: cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border",
                activeTab === tab.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
              ),
              "data-ocid": `notifications.filter.${tab.id}`,
              children: [
                tab.label,
                tabUnread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: cn(
                      "min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1",
                      activeTab === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary"
                    ),
                    children: tabUnread
                  }
                )
              ]
            },
            tab.id
          );
        }) }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {}) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { filtered: activeTab !== "all" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[calc(100vh-280px)] min-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "popLayout", children: grouped.map(({ group, items }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: { duration: 0.2 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: group }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border/60" }),
                group === "Today" && filteredUnread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary font-medium", children: [
                  filteredUnread,
                  " unread"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((notif, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                NotificationItem,
                {
                  notification: notif,
                  index: i,
                  onRead: handleClickNotif
                },
                notif.id
              )) })
            ]
          },
          group
        )) }) }) }),
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 0.3 },
            className: "flex items-center justify-center pt-2 border-t border-border/50",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => navigate({ to: "/settings" }),
                className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group",
                "data-ocid": "notifications.manage_preferences_link",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-3.5 w-3.5 group-hover:rotate-45 transition-transform duration-300" }),
                  "Manage notification settings →"
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showClearConfirm, onOpenChange: setShowClearConfirm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "data-ocid": "notifications.clear_dialog", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Clear all notifications?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
              "This will permanently delete all ",
              notifications.length,
              " ",
              "notifications. This action cannot be undone."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                onClick: () => setShowClearConfirm(false),
                "data-ocid": "notifications.clear_cancel_button",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "destructive",
                onClick: handleClearAll,
                disabled: clearAll.isPending,
                "data-ocid": "notifications.clear_confirm_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-1.5" }),
                  "Clear all"
                ]
              }
            )
          ] })
        ] }) })
      ]
    }
  );
}
export {
  NotificationsPage as default
};
