import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useActivityFeed,
  useAddReaction,
  useRemoveReaction,
  useTogglePaymentVisibility,
} from "@/hooks/useActivity";
import {
  type ContactAccessLevel,
  type ContactRelationship,
  type TrustedContactExtended,
  useAddTrustedContact,
  useRemoveTrustedContact,
  useTrustedContacts,
} from "@/hooks/useContacts";
import { formatCurrencyDisplay } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ActivityItem, ActivityType } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Gift,
  Globe,
  Lock,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary/20 text-primary",
    "bg-accent/20 text-accent-foreground",
    "bg-destructive/20 text-destructive",
    "bg-chart-1/20",
    "bg-chart-2/20",
    "bg-chart-3/20",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

type ActivityFilter = "all" | "sent" | "received" | "goals" | "achievements";

function matchesFilter(item: ActivityItem, filter: ActivityFilter): boolean {
  if (filter === "all") return true;
  if (filter === "sent")
    return (
      item.type === "payment" && item.title.toLowerCase().startsWith("you sent")
    );
  if (filter === "received")
    return (
      item.type === "payment" &&
      !item.title.toLowerCase().startsWith("you sent")
    );
  if (filter === "goals")
    return item.type === "savings_deposit" || item.type === "savings_withdraw";
  if (filter === "achievements")
    return item.type === "referral" || item.type === "subscription";
  return true;
}

function getTypeIcon(type: ActivityType) {
  switch (type) {
    case "savings_deposit":
    case "savings_withdraw":
      return <TrendingUp className="h-4 w-4 text-primary" />;
    case "referral":
      return <Gift className="h-4 w-4 text-accent-foreground" />;
    case "subscription":
      return <Star className="h-4 w-4 text-primary" />;
    default:
      return null;
  }
}

// ── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({
  item,
  index,
}: {
  item: ActivityItem;
  index: number;
}) {
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const toggleVisibility = useTogglePaymentVisibility();

  const isSent =
    item.type === "payment" && item.title.toLowerCase().startsWith("you sent");
  const isPayment = item.type === "payment";
  const counterpartyInitials = item.counterpartyName
    ? getInitials(item.counterpartyName)
    : "?";
  const avatarColor = item.counterpartyName
    ? getAvatarColor(item.counterpartyName)
    : "bg-muted text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200 hover:shadow-md",
          !item.isPublic && "border-dashed",
        )}
        data-ocid={`activity.item.${index}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback
                  className={cn("text-sm font-semibold", avatarColor)}
                >
                  {isPayment ? counterpartyInitials : getTypeIcon(item.type)}
                </AvatarFallback>
              </Avatar>
              {isPayment && (
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center",
                    isSent
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {isSent ? (
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  ) : (
                    <ArrowDownLeft className="h-2.5 w-2.5" />
                  )}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  {item.amountCents != null && item.currency && (
                    <p
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        isSent ? "text-destructive" : "text-primary",
                      )}
                    >
                      {isSent ? "−" : "+"}
                      {formatCurrencyDisplay(
                        item.amountCents,
                        item.currency as import("@/backend.d").Currency,
                      )}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {timeAgo(item.timestamp)}
                  </p>
                </div>
              </div>

              {/* Privacy + visibility row */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    toggleVisibility.mutate({
                      activityId: item.id,
                      isPublic: !item.isPublic,
                    })
                  }
                  className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors",
                    item.isPublic
                      ? "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                      : "border-dashed border-border text-muted-foreground hover:text-foreground",
                  )}
                  data-ocid="activity.visibility_toggle"
                >
                  {item.isPublic ? (
                    <>
                      <Globe className="h-3 w-3" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      <span>Private</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reactions */}
              {item.reactions.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {item.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      type="button"
                      onClick={() => {
                        if (r.reacted) {
                          removeReaction.mutate({
                            activityId: item.id,
                            emoji: r.emoji,
                          });
                        } else {
                          addReaction.mutate({
                            activityId: item.id,
                            emoji: r.emoji,
                          });
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all duration-150 select-none",
                        r.reacted
                          ? "bg-primary/10 border-primary/40 text-primary scale-105"
                          : "bg-muted/50 border-border text-foreground hover:border-primary/30 hover:bg-primary/5",
                        r.count === 0 && !r.reacted && "opacity-50",
                      )}
                      data-ocid={`activity.reaction.${r.emoji}.${index}`}
                    >
                      <span>{r.emoji}</span>
                      {r.count > 0 && (
                        <span className="tabular-nums font-medium">
                          {r.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Add Contact Modal ────────────────────────────────────────────────────────

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
}

function AddContactModal({ open, onClose }: AddContactModalProps) {
  const addContact = useAddTrustedContact();
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    relationship: "Friend" as ContactRelationship,
    accessLevel: "View-only" as ContactAccessLevel,
    notes: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addContact.mutate(
      {
        name: form.name,
        username: form.username || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        relationship: form.relationship,
        accessLevel: form.accessLevel,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({
            name: "",
            username: "",
            phone: "",
            email: "",
            relationship: "Friend",
            accessLevel: "View-only",
            notes: "",
          });
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        data-ocid="contacts.add_contact.dialog"
      >
        <DialogHeader>
          <DialogTitle>Add Trusted Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Full Name *</Label>
            <Input
              id="contact-name"
              placeholder="e.g. Alex Chen"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              data-ocid="contacts.add_contact.name_input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contact-username">Username</Label>
              <Input
                id="contact-username"
                placeholder="@username"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                data-ocid="contacts.add_contact.username_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                placeholder="+1 555-0100"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                data-ocid="contacts.add_contact.phone_input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              data-ocid="contacts.add_contact.email_input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select
                value={form.relationship}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    relationship: v as ContactRelationship,
                  }))
                }
              >
                <SelectTrigger data-ocid="contacts.add_contact.relationship_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Family",
                      "Friend",
                      "Colleague",
                      "Other",
                    ] as ContactRelationship[]
                  ).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select
                value={form.accessLevel}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    accessLevel: v as ContactAccessLevel,
                  }))
                }
              >
                <SelectTrigger data-ocid="contacts.add_contact.access_level_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    ["View-only", "Emergency", "Full"] as ContactAccessLevel[]
                  ).map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-notes">Notes</Label>
            <Input
              id="contact-notes"
              placeholder="e.g. Roommate, best friend..."
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              data-ocid="contacts.add_contact.notes_input"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="contacts.add_contact.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={addContact.isPending}
              data-ocid="contacts.add_contact.submit_button"
            >
              {addContact.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Relationship badge colors ─────────────────────────────────────────────────

const REL_COLORS: Record<string, string> = {
  Family: "bg-destructive/10 text-destructive border-destructive/20",
  Friend: "bg-primary/10 text-primary border-primary/20",
  Colleague: "bg-accent/10 text-accent-foreground border-accent/20",
  Other: "bg-muted text-muted-foreground border-border",
};

const ACCESS_ICONS: Record<string, React.ReactNode> = {
  "View-only": <Eye className="h-3 w-3" />,
  Emergency: <Shield className="h-3 w-3" />,
  Full: <User className="h-3 w-3" />,
};

// ── Contact Card ─────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  index,
}: {
  contact: TrustedContactExtended;
  index: number;
}) {
  const remove = useRemoveTrustedContact();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Card
        className="overflow-hidden hover:shadow-md transition-all duration-200"
        data-ocid={`contacts.item.${index}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 shrink-0">
              <AvatarFallback
                className={cn(
                  "text-sm font-semibold",
                  getAvatarColor(contact.name),
                )}
              >
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold">{contact.name}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-0 h-5",
                    REL_COLORS[contact.relationship] ?? REL_COLORS.Other,
                  )}
                >
                  {contact.relationship}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {contact.username && (
                  <span className="text-xs text-muted-foreground">
                    @{contact.username}
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                    contact.accessLevel === "Full"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : contact.accessLevel === "Emergency"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {ACCESS_ICONS[contact.accessLevel]}
                  {contact.accessLevel}
                </span>
                {contact.lastTransactionAt && (
                  <span className="text-xs text-muted-foreground">
                    Last sent {timeAgo(contact.lastTransactionAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                data-ocid={`contacts.send_button.${index}`}
                onClick={() => {
                  const recipient =
                    contact.email ?? contact.phone ?? contact.name;
                  void navigate({ to: "/", search: { send: recipient } });
                }}
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>

              {confirmDelete ? (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={() => remove.mutate(contact.id)}
                    data-ocid={`contacts.confirm_delete.${index}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setConfirmDelete(false)}
                    data-ocid={`contacts.cancel_delete.${index}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                  data-ocid={`contacts.delete_button.${index}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {contact.notes && (
            <p className="text-xs text-muted-foreground mt-2 pl-14 italic">
              {contact.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: ActivityFilter }[] = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Received", value: "received" },
  { label: "Goals", value: "goals" },
  { label: "Achievements", value: "achievements" },
];

export default function ActivityPage() {
  const {
    data: feed = [],
    isLoading: feedLoading,
    refetch,
  } = useActivityFeed();
  const { data: contacts = [], isLoading: contactsLoading } =
    useTrustedContacts();

  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);

  const filteredFeed = feed
    .filter((item) => matchesFilter(item, activeFilter))
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.counterpartyName?.toLowerCase().includes(q) ?? false) ||
        (item.amountCents != null && String(item.amountCents / 100).includes(q))
      );
    });

  const publicCount = feed.filter((i) => i.isPublic).length;
  const totalReactions = feed.reduce(
    (sum, item) => sum + item.reactions.reduce((s, r) => s + r.count, 0),
    0,
  );

  return (
    <div className="space-y-6 max-w-2xl" data-ocid="activity.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            Activity
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your payment history and social feed
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
          data-ocid="activity.refresh_button"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: <Activity className="h-4 w-4 text-primary" />,
            label: "Transactions",
            value: feed.length,
          },
          {
            icon: <Globe className="h-4 w-4 text-primary" />,
            label: "Public",
            value: publicCount,
          },
          {
            icon: <Star className="h-4 w-4 text-accent-foreground" />,
            label: "Reactions",
            value: totalReactions,
          },
        ].map(({ icon, label, value }) => (
          <Card key={label} className="bg-card">
            <CardContent className="p-3 flex items-center gap-2">
              {icon}
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-bold tabular-nums">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList className="w-full" data-ocid="activity.tabs">
          <TabsTrigger
            value="feed"
            className="flex-1 gap-2"
            data-ocid="activity.feed.tab"
          >
            <Activity className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="flex-1 gap-2"
            data-ocid="activity.contacts.tab"
          >
            <Users className="h-4 w-4" />
            Trusted Contacts
            {contacts.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 text-xs">
                {contacts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Feed Tab ── */}
        <TabsContent value="feed" className="space-y-4 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or amount..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-ocid="activity.search_input"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap" data-ocid="activity.filter.tab">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                  activeFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/50 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
                data-ocid={`activity.filter.${f.value}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feed */}
          {feedLoading ? (
            <div className="space-y-3" data-ocid="activity.loading_state">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : filteredFeed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-3"
              data-ocid="activity.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-lg">
                {searchQuery ? "No results found" : "No activity yet"}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {searchQuery
                  ? `No transactions match "${searchQuery}"`
                  : "Send your first payment to see activity here"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  data-ocid="activity.clear_search_button"
                >
                  Clear search
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredFeed.map((item, i) => (
                  <ActivityCard key={item.id} item={item} index={i + 1} />
                ))}
              </AnimatePresence>

              <p className="text-center text-xs text-muted-foreground py-2">
                {filteredFeed.length} item
                {filteredFeed.length !== 1 ? "s" : ""}
                {activeFilter !== "all" || searchQuery ? " (filtered)" : ""}
              </p>
            </div>
          )}
        </TabsContent>

        {/* ── Contacts Tab ── */}
        <TabsContent value="contacts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {contacts.length} trusted contact
              {contacts.length !== 1 ? "s" : ""}
            </p>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setShowAddContact(true)}
              data-ocid="contacts.add_contact_button"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>

          {contactsLoading ? (
            <div className="space-y-3" data-ocid="contacts.loading_state">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-4"
              data-ocid="contacts.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">No trusted contacts</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  Add family, friends, and colleagues for quick payments and
                  emergency access
                </p>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setShowAddContact(true)}
                data-ocid="contacts.empty_add_button"
              >
                <Plus className="h-4 w-4" />
                Add your first contact
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {contacts.map((contact, i) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    index={i + 1}
                  />
                ))}
              </AnimatePresence>

              {/* Legend */}
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    Access Levels
                  </p>
                  <div className="space-y-1">
                    {[
                      {
                        level: "View-only",
                        desc: "Can see your transactions",
                      },
                      {
                        level: "Emergency",
                        desc: "Can send on your behalf in emergencies",
                      },
                      {
                        level: "Full",
                        desc: "Complete access to your account",
                      },
                    ].map(({ level, desc }) => (
                      <div
                        key={level}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                        <span className="font-medium text-foreground">
                          {level}
                        </span>
                        <span className="text-muted-foreground">— {desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddContactModal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
      />
    </div>
  );
}
