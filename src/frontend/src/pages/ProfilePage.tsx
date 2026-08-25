import type { UserProfile as BackendUserProfile } from "@/backend.d";
import { BillingInterval, SubscriptionTier } from "@/backend.d";
import { PhoneVerificationModal } from "@/components/PhoneVerificationModal";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import { QRCodeCard } from "@/components/QRCodeCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUnlinkPhone } from "@/hooks/usePhone";
import {
  useFindUserByIdOrUsername,
  useGetProfile,
  useSaveProfile,
} from "@/hooks/useProfile";
import {
  useCancelSubscription,
  useCreateSubscriptionCheckout,
  useGetSubscription,
} from "@/hooks/useSubscription";
import {
  CheckCircle2,
  ClipboardCopy,
  Crown,
  ExternalLink,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ── Tier config ─────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  plus: "Plus+",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

const TIER_FEATURES: Record<
  string,
  { label: string; monthly: number; annual: number }
> = {
  plus: {
    label: "Plus+",
    monthly: 499,
    annual: 4799,
  },
  pro: {
    label: "Pro",
    monthly: 1299,
    annual: 12499,
  },
  business: {
    label: "Business",
    monthly: 2999,
    annual: 28799,
  },
  enterprise: {
    label: "Enterprise",
    monthly: 9999,
    annual: 95990,
  },
};

function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ── Subscription Section ─────────────────────────────────────────────────────

function SubscriptionSection() {
  const { data: sub, isLoading } = useGetSubscription();
  const { mutate: checkout, isPending: isCheckingOut } =
    useCreateSubscriptionCheckout();
  const { mutate: cancel, isPending: isCancelling } = useCancelSubscription();
  const [selectedInterval, setSelectedInterval] = useState<
    "monthly" | "annual"
  >("monthly");
  const [showCancel, setShowCancel] = useState(false);

  const currentTier = sub?.tier ?? SubscriptionTier.free;

  const handleUpgrade = (tier: string) => {
    checkout(
      {
        tier: tier as SubscriptionTier,
        interval:
          selectedInterval === "annual"
            ? BillingInterval.annual
            : BillingInterval.monthly,
      },
      {
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Checkout failed"),
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      data-ocid="profile.subscription_section"
    >
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-accent" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current plan badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
            <div>
              <p className="text-sm font-semibold">
                {TIER_LABELS[currentTier] ?? currentTier} Plan
              </p>
              {sub && sub.status === "active" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sub.status === "active" ? "Active" : sub.status} ·{" "}
                  {sub.interval}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className="text-[10px] px-2"
              data-ocid="profile.plan_badge"
            >
              {sub?.status === "active" ? "Active" : "Free"}
            </Badge>
          </div>

          {isLoading && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          )}

          {/* Interval toggle */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/40 border border-border w-fit">
            {(["monthly", "annual"] as const).map((iv) => (
              <button
                key={iv}
                type="button"
                onClick={() => setSelectedInterval(iv)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-smooth ${
                  selectedInterval === iv
                    ? "bg-card text-foreground shadow-elevated"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`profile.interval_${iv}_toggle`}
              >
                {iv === "annual" ? "Annual (save 20%)" : "Monthly"}
              </button>
            ))}
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(TIER_FEATURES).map(([tier, info], idx) => {
              const isCurrentTier = currentTier === tier;
              const price =
                selectedInterval === "annual" ? info.annual : info.monthly;
              return (
                <div
                  key={tier}
                  className={`relative p-4 rounded-xl border transition-smooth ${
                    isCurrentTier
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20 hover:border-primary/40"
                  }`}
                  data-ocid={`profile.tier_card.${idx + 1}`}
                >
                  {tier === "pro" && !isCurrentTier && (
                    <div className="absolute -top-2 right-3 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Popular
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display font-semibold text-sm">
                        {info.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${centsToDisplay(price)}/
                        {selectedInterval === "annual" ? "yr" : "mo"}
                      </p>
                    </div>
                    {isCurrentTier && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isCurrentTier ? "outline" : "default"}
                    className="w-full text-xs h-8"
                    disabled={isCurrentTier || isCheckingOut}
                    onClick={() => handleUpgrade(tier)}
                    data-ocid={`profile.upgrade_${tier}_button`}
                  >
                    {isCurrentTier ? (
                      "Current Plan"
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1.5" />
                        Upgrade to {info.label}
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Cancel option */}
          {sub && sub.status === "active" && currentTier !== "free" && (
            <>
              <Separator />
              {!showCancel ? (
                <button
                  type="button"
                  onClick={() => setShowCancel(true)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  data-ocid="profile.cancel_subscription_button"
                >
                  Cancel subscription
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Are you sure? Your plan benefits will expire at the end of
                    the billing period.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCancel(false)}
                      data-ocid="profile.cancel_keep_button"
                    >
                      Keep Plan
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      disabled={isCancelling}
                      onClick={() =>
                        cancel(undefined, {
                          onSuccess: () => {
                            toast.success("Subscription cancelled");
                            setShowCancel(false);
                          },
                          onError: () => toast.error("Failed to cancel"),
                        })
                      }
                      data-ocid="profile.cancel_confirm_button"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveProfile();
  const { mutate: unlinkPhone, isPending: isUnlinking } = useUnlinkPhone();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [publicProfile, setPublicProfile] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Sync form fields when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setUsername(profile.username ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const userId = profile?.userId ?? "—";
  const hasPhone = !!(profile?.phone && profile.phone.length > 0);

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    toast.success("User ID copied to clipboard");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const updated: BackendUserProfile = {
      ...profile,
      displayName,
      username,
      bio: bio || undefined,
    };
    saveProfile(updated, {
      onSuccess: () => toast.success("Profile updated"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to save"),
    });
  };

  const handleUnlinkPhone = () => {
    unlinkPhone(undefined, {
      onSuccess: () => toast.success("Phone number unlinked"),
      onError: () => toast.error("Failed to unlink phone"),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6" data-ocid="profile.loading_state">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 pb-12" data-ocid="profile.page">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display font-bold text-2xl">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your identity, sharing options, and subscription
        </p>
      </motion.div>

      {/* ── Identity Card: User ID ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card
          className="border border-border bg-card overflow-hidden"
          data-ocid="profile.identity_card"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-label text-muted-foreground mb-1">
                  Your User ID
                </p>
                <p className="font-display font-bold text-xl tracking-wider text-primary">
                  #{userId}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Share this ID to receive payments from anyone
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={handleCopyUserId}
                data-ocid="profile.copy_userid_button"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Profile Edit Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card
          className="border border-border bg-card"
          data-ocid="profile.edit_card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              {/* Photo + name row */}
              <div className="flex items-start gap-5">
                <ProfilePhotoUpload
                  currentPhotoUrl={profile?.photoUrl}
                  displayName={displayName || "User"}
                />
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="space-y-1.5">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your full name"
                      required
                      data-ocid="profile.display_name_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        @
                      </span>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) =>
                          setUsername(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, ""),
                          )
                        }
                        placeholder="handle"
                        className="pl-7"
                        required
                        data-ocid="profile.username_input"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Others can send you money via @{username || "yourhandle"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people a bit about yourself…"
                  rows={3}
                  maxLength={200}
                  data-ocid="profile.bio_textarea"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/200
                </p>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email ?? ""}
                  readOnly
                  className="bg-muted/30 text-muted-foreground cursor-not-allowed"
                  data-ocid="profile.email_input"
                />
                <p className="text-xs text-muted-foreground">
                  Email is managed through your Internet Identity
                </p>
              </div>

              {/* Public profile toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium">Public profile</p>
                  <p className="text-xs text-muted-foreground">
                    Let others find you by name or username
                  </p>
                </div>
                <Switch
                  checked={publicProfile}
                  onCheckedChange={setPublicProfile}
                  data-ocid="profile.public_toggle"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSaving}
                data-ocid="profile.save_button"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Phone Verification ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.11 }}
      >
        <Card
          className="border border-border bg-card"
          data-ocid="profile.phone_section"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPhone ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-mono text-sm truncate">
                    {profile?.phone}
                  </span>
                  <span className="badge-verified shrink-0">Verified</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPhoneModal(true)}
                    data-ocid="profile.change_phone_button"
                  >
                    Change
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isUnlinking}
                    onClick={handleUnlinkPhone}
                    data-ocid="profile.unlink_phone_button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    No phone number linked
                  </p>
                  <span className="badge-pending ml-auto shrink-0">
                    Unverified
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowPhoneModal(true)}
                  data-ocid="profile.verify_phone_button"
                >
                  <Phone className="h-4 w-4" />
                  Add & Verify Phone Number
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              A verified number lets others send you money and enables 2FA
              recovery.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── QR Code ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
      >
        <Card
          className="border border-border bg-card"
          data-ocid="profile.qr_section"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              My QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Anyone can scan this code to instantly send you money — share it
              anywhere.
            </p>
            {profile ? (
              <QRCodeCard
                userId={profile.userId ?? "UNKNOWN"}
                displayName={profile.displayName}
                username={profile.username}
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">
                  Load your profile to see your QR code
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Find User ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <FindUserSection />
      </motion.div>

      {/* ── Subscription ── */}
      <SubscriptionSection />

      {/* Phone Modal */}
      <PhoneVerificationModal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        currentPhone={profile?.phone}
      />
    </div>
  );
}

// ── Find User Section ────────────────────────────────────────────────────────

function FindUserSection() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<BackendUserProfile | null | undefined>(
    undefined,
  );
  const [isSearching, setIsSearching] = useState(false);
  const { mutateAsync: findUser } = useFindUserByIdOrUsername();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const found = await findUser(query.trim());
      setResult(found);
      if (!found) toast.info("No user found with that ID or username");
    } catch {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card
      className="border border-border bg-card"
      data-ocid="profile.find_user_section"
    >
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-primary" />
          Find a User
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResult(undefined);
            }}
            placeholder="User ID (#ABC12345) or @username"
            className="flex-1"
            data-ocid="profile.find_user_input"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!query.trim() || isSearching}
            data-ocid="profile.find_user_button"
          >
            {isSearching ? "Searching…" : "Search"}
          </Button>
        </form>

        {result !== undefined && (
          <div data-ocid="profile.find_user_result">
            {result ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  {result.photoUrl ? (
                    <img
                      src={result.photoUrl}
                      alt={result.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-display font-bold text-primary text-sm">
                      {result.displayName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {result.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{result.username} · #{result.userId}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-primary ml-auto shrink-0" />
              </div>
            ) : (
              <div
                className="text-center py-4 text-sm text-muted-foreground"
                data-ocid="profile.find_user_empty_state"
              >
                No user found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
