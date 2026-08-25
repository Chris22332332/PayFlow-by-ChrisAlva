import type { UserSettings } from "@/backend.d";
import { Currency, NumberFormat, TxHistoryVisibility } from "@/backend.d";
import { SessionList } from "@/components/SessionList";
import { SettingsSection } from "@/components/SettingsSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useBudgets,
  useSetBudget,
  useSpendingAnalytics,
} from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import {
  useDeviceSessions,
  useRevokeAllSessions,
  useRevokeSession,
  useUpdateUserSettings,
  useUserSettings,
} from "@/hooks/useSettings";
import type { BudgetSetting, SpendingCategory } from "@/types";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCopy,
  Code2,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  Key,
  KeyRound,
  Lock,
  LogOut,
  Moon,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  SunMoon,
  Trash2,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

// ── Helpers ────────────────────────────────────────────────────────────────

function centsToDisplay(cents: bigint): string {
  return (Number(cents) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPreview(settings: UserSettings | undefined): string {
  if (!settings) return "$1,234.56";
  const val = 1234.5678;
  const decimals = Number(settings.decimal_places);
  const sym =
    settings.primary_currency === Currency.EUR
      ? "€"
      : settings.primary_currency === Currency.GBP
        ? "£"
        : settings.primary_currency === Currency.JPY
          ? "¥"
          : "$";
  if (settings.number_format === NumberFormat.Comma) {
    return `${sym}${val
      .toFixed(decimals)
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  }
  return `${sym}${val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

const RECOVERY_CODES = Array.from({ length: 8 }, () => {
  const part = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X");
  return `${part()}-${part()}`;
});

const SPENDING_CATEGORIES: {
  key: SpendingCategory;
  label: string;
  emoji: string;
  color: string;
}[] = [
  {
    key: "food",
    label: "Food & Dining",
    emoji: "🍔",
    color: "text-orange-500",
  },
  { key: "transport", label: "Transport", emoji: "🚗", color: "text-blue-500" },
  {
    key: "entertainment",
    label: "Entertainment",
    emoji: "🎬",
    color: "text-purple-500",
  },
  { key: "shopping", label: "Shopping", emoji: "🛍️", color: "text-pink-500" },
  {
    key: "health",
    label: "Health & Fitness",
    emoji: "🏥",
    color: "text-emerald-500",
  },
  {
    key: "utilities",
    label: "Utilities & Bills",
    emoji: "⚡",
    color: "text-yellow-500",
  },
  { key: "travel", label: "Travel", emoji: "✈️", color: "text-sky-500" },
  { key: "transfers", label: "Transfers", emoji: "💸", color: "text-primary" },
  {
    key: "subscriptions",
    label: "Subscriptions",
    emoji: "🔄",
    color: "text-violet-500",
  },
  { key: "other", label: "Other", emoji: "📦", color: "text-muted-foreground" },
];

const CONNECTED_APPS = [
  {
    id: "stripe",
    name: "Stripe Payments",
    description: "Card deposits, withdrawals & merchant payments",
    icon: CreditCard,
    status: "connected",
    scope: "Read/write",
    connectedAt: "Mar 15, 2026",
  },
  {
    id: "plaid",
    name: "Plaid Bank Link",
    description: "Bank account verification and ACH transfers",
    icon: Globe,
    status: "connected",
    scope: "Read-only",
    connectedAt: "Mar 15, 2026",
  },
  {
    id: "zapier",
    name: "Zapier Automation",
    description: "Trigger automations on payment events",
    icon: Zap,
    status: "disconnected",
    scope: "Read-only",
    connectedAt: null,
  },
];

// ── Modals ─────────────────────────────────────────────────────────────────

function RequestLimitModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [justification, setJustification] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      "Limit increase request submitted. We'll review within 2–3 business days.",
    );
    setJustification("");
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-ocid="limit_increase.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            Request Limit Increase
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="justification">
              Why do you need higher limits?
            </Label>
            <Textarea
              id="justification"
              rows={4}
              placeholder="Describe your use case, e.g. business payments, high-value transfers..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
              data-ocid="limit_increase.textarea"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="limit_increase.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!justification.trim()}
              data-ocid="limit_increase.submit_button"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecoveryCodesModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(RECOVERY_CODES.join("\n"));
    toast.success("Recovery codes copied to clipboard");
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-ocid="recovery_codes.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Recovery Codes</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mt-1">
          Store these codes in a safe place. Each code can only be used once.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3 p-4 bg-muted/30 rounded-xl border border-border">
          {RECOVERY_CODES.map((code) => (
            <code
              key={code}
              className="font-mono text-sm text-foreground text-center py-1"
            >
              {code}
            </code>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleCopy}
            data-ocid="recovery_codes.copy_button"
          >
            <Download className="h-4 w-4" /> Copy Codes
          </Button>
          <Button
            className="flex-1"
            onClick={onClose}
            data-ocid="recovery_codes.close_button"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DownloadDataModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" data-ocid="download_data.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Export Your Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Choose export format for your transactions, profile, and settings.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["csv", "json"] as const).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFormat(f)}
                className={`p-3 rounded-xl border text-sm font-medium transition-smooth ${
                  format === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
                data-ocid={`download_data.format_${f}_button`}
              >
                {f.toUpperCase()}
                <p className="text-[10px] font-normal mt-0.5">
                  {f === "csv" ? "Spreadsheet" : "Developer"}
                </p>
              </button>
            ))}
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Transaction history + tax breakdown</li>
            <li>Profile and account information</li>
            <li>Payment methods (masked)</li>
            <li>Settings and preferences</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Processed within 24 hours, delivered via email.
          </p>
        </div>
        <Button
          className="w-full mt-2 gap-2"
          onClick={() => {
            toast.success(
              "Export requested. Check your email within 24 hours.",
            );
            onClose();
          }}
          data-ocid="download_data.confirm_button"
        >
          <Download className="h-4 w-4" /> Request Export (
          {format.toUpperCase()})
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" data-ocid="delete_account.dialog">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Delete Account
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <strong>30-day grace period:</strong> Your account enters a
            deactivation queue. You can cancel within 30 days by signing back
            in. After 30 days, all data is permanently deleted.
          </div>
          <p className="text-sm text-muted-foreground">
            All funds, transaction history, and linked accounts will be
            permanently removed.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="delete-confirm" className="text-sm">
              Type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              data-ocid="delete_account.confirm_input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="delete_account.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={confirm !== "DELETE"}
              onClick={() => {
                toast.error(
                  "Account deletion scheduled. You have 30 days to cancel.",
                );
                onClose();
              }}
              data-ocid="delete_account.confirm_button"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TOTPSetupModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"qr" | "verify">("qr");
  const [code, setCode] = useState("");
  const secret = "JBSWY3DPEHPK3PXP";
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" data-ocid="totp_setup.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            Set Up Authenticator App
          </DialogTitle>
        </DialogHeader>
        {step === "qr" ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </p>
            <div className="flex justify-center">
              <div className="w-40 h-40 bg-muted/30 border border-border rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-7 gap-0.5">
                  {[
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                    "i",
                    "j",
                    "k",
                    "l",
                    "m",
                    "n",
                    "o",
                    "p",
                    "q",
                    "r",
                    "s",
                    "t",
                    "u",
                    "v",
                    "w",
                    "x",
                    "y",
                    "z",
                    "0",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "A",
                    "B",
                    "C",
                    "D",
                    "E",
                    "F",
                    "G",
                    "H",
                    "I",
                    "J",
                    "K",
                    "L",
                    "M",
                  ].map((cell) => (
                    <div
                      key={cell}
                      className={`w-4 h-4 rounded-sm ${cell.charCodeAt(0) % 2 === 0 ? "bg-foreground" : "bg-transparent"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Or enter manually:
              </p>
              <code className="font-mono text-xs text-foreground">
                {secret}
              </code>
            </div>
            <Button
              className="w-full"
              onClick={() => setStep("verify")}
              data-ocid="totp_setup.next_button"
            >
              Next: Verify Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to complete
              setup.
            </p>
            <Input
              placeholder="000 000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              data-ocid="totp_setup.code_input"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("qr")}
                data-ocid="totp_setup.back_button"
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={code.length !== 6}
                onClick={() => {
                  toast.success("Two-factor authentication enabled!");
                  setCode("");
                  onClose();
                }}
                data-ocid="totp_setup.confirm_button"
              >
                Enable 2FA
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Tab: General ───────────────────────────────────────────────────────────

function GeneralTab({
  settings,
  patchSettings,
  settingsLoading,
}: {
  settings: UserSettings | undefined;
  patchSettings: (p: Partial<UserSettings>) => void;
  settingsLoading: boolean;
}) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-5">
      <SettingsSection
        title="Display"
        description="Language, timezone, and theme"
        icon={SunMoon}
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light", label: "Light", Icon: Sun },
                { value: "dark", label: "Dark", Icon: Moon },
                { value: "system", label: "System", Icon: SunMoon },
              ].map(({ value, label, Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-smooth ${
                    theme === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                  }`}
                  data-ocid={`settings.theme_${value}_button`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Language</Label>
            <Select defaultValue="en-US">
              <SelectTrigger data-ocid="settings.language_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Timezone</Label>
            <Select defaultValue="America/New_York">
              <SelectTrigger data-ocid="settings.timezone_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">
                  Eastern Time (UTC-5)
                </SelectItem>
                <SelectItem value="America/Chicago">
                  Central Time (UTC-6)
                </SelectItem>
                <SelectItem value="America/Denver">
                  Mountain Time (UTC-7)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time (UTC-8)
                </SelectItem>
                <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Currency & Number Format"
        description="How amounts are displayed"
        icon={CircleDollarSign}
      >
        {settingsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Primary currency</Label>
              <Select
                value={settings?.primary_currency ?? Currency.USD}
                onValueChange={(v) =>
                  patchSettings({ primary_currency: v as Currency })
                }
              >
                <SelectTrigger data-ocid="settings.primary_currency_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Currency).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Decimal places</Label>
                <Select
                  value={String(settings?.decimal_places ?? 2)}
                  onValueChange={(v) =>
                    patchSettings({ decimal_places: BigInt(v) })
                  }
                >
                  <SelectTrigger data-ocid="settings.decimal_places_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 — 1,234.56</SelectItem>
                    <SelectItem value="3">3 — 1,234.567</SelectItem>
                    <SelectItem value="4">4 — 1,234.5678</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Number format</Label>
                <Select
                  value={settings?.number_format ?? NumberFormat.Period}
                  onValueChange={(v) =>
                    patchSettings({ number_format: v as NumberFormat })
                  }
                >
                  <SelectTrigger data-ocid="settings.number_format_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NumberFormat.Period}>
                      1,000.00
                    </SelectItem>
                    <SelectItem value={NumberFormat.Comma}>1.000,00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Live preview</p>
              <p className="font-mono font-bold text-foreground">
                {formatPreview(settings)}
              </p>
            </div>
          </div>
        )}
      </SettingsSection>
    </div>
  );
}

// ── Tab: Security ──────────────────────────────────────────────────────────

function SecurityTab({
  sessions,
  sessionsLoading,
  onRevoke,
  onRevokeAll,
  isRevoking,
  isRevokingAll,
}: {
  sessions: unknown[];
  sessionsLoading: boolean;
  onRevoke: (id: string) => void;
  onRevokeAll: () => void;
  isRevoking: boolean;
  isRevokingAll: boolean;
}) {
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [showTOTP, setShowTOTP] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Two-Factor Authentication"
        description="Add an extra layer of security"
        icon={ShieldCheck}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Authenticator App (TOTP)</p>
              <p className="text-xs text-muted-foreground">
                Google Authenticator, Authy, 1Password
              </p>
            </div>
            <div className="flex items-center gap-2">
              {twoFAEnabled && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                >
                  Enabled
                </Badge>
              )}
              <Switch
                checked={twoFAEnabled}
                onCheckedChange={(v) => {
                  if (v) setShowTOTP(true);
                  else setTwoFAEnabled(false);
                }}
                data-ocid="settings.totp_switch"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full"
            onClick={() => setShowTOTP(true)}
            data-ocid="settings.setup_2fa_button"
          >
            <Key className="h-3.5 w-3.5" />{" "}
            {twoFAEnabled
              ? "Re-configure Authenticator"
              : "Set Up Authenticator App"}
          </Button>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Biometric Login</p>
              <p className="text-xs text-muted-foreground">
                Face ID or fingerprint unlock
              </p>
            </div>
            <Switch
              checked={biometricEnabled}
              onCheckedChange={setBiometricEnabled}
              data-ocid="settings.biometric_switch"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Change Password</p>
              <p className="text-xs text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.info("Go to Profile to manage your password")
              }
              data-ocid="settings.change_password_button"
            >
              Manage <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Account Recovery"
        description="Backup codes and recovery methods"
        icon={KeyRound}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Recovery Codes</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Single-use codes let you regain access if you lose your device.
                Store them in a secure location.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full"
            onClick={() => setShowRecoveryCodes(true)}
            data-ocid="settings.generate_recovery_codes_button"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Generate Recovery Codes
          </Button>
          <Separator className="bg-border" />
          <div className="space-y-1.5">
            <Label htmlFor="recovery-phone" className="text-sm font-medium">
              Recovery Phone
            </Label>
            <div className="flex gap-2">
              <Input
                id="recovery-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="flex-1"
                data-ocid="settings.recovery_phone_input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Recovery phone updated")}
                data-ocid="settings.recovery_phone_save_button"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Sessions"
        description="Active logins and device management"
        icon={Smartphone}
      >
        <SessionList
          sessions={sessions as Parameters<typeof SessionList>[0]["sessions"]}
          isLoading={sessionsLoading}
          onRevoke={onRevoke}
          onRevokeAll={onRevokeAll}
          isRevoking={isRevoking}
          isRevokingAll={isRevokingAll}
        />
      </SettingsSection>

      <RecoveryCodesModal
        open={showRecoveryCodes}
        onClose={() => setShowRecoveryCodes(false)}
      />
      <TOTPSetupModal
        open={showTOTP}
        onClose={() => {
          setShowTOTP(false);
          setTwoFAEnabled(true);
        }}
      />
    </div>
  );
}

// ── Tab: Notifications ─────────────────────────────────────────────────────

function NotificationsTab({
  settings,
  patchSettings,
  settingsLoading,
}: {
  settings: UserSettings | undefined;
  patchSettings: (p: Partial<UserSettings>) => void;
  settingsLoading: boolean;
}) {
  const [notifSound, setNotifSound] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailDigest, setEmailDigest] = useState<"off" | "daily" | "weekly">(
    "daily",
  );

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Transaction Alerts"
        description="Notifications for payments and activity"
        icon={Bell}
      >
        {settingsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[
              {
                key: "notification_email_receipts" as const,
                label: "Email receipts",
                desc: "Receive a receipt for every completed transaction",
                ocid: "settings.notif_email_receipts_switch",
              },
              {
                key: "notification_p2p_requests" as const,
                label: "Payment requests",
                desc: "Notify me when someone requests money",
                ocid: "settings.notif_p2p_requests_switch",
              },
              {
                key: "notification_payment_alerts" as const,
                label: "Payment alerts",
                desc: "Alerts for large or suspicious transactions",
                ocid: "settings.notif_payment_alerts_switch",
              },
              {
                key: "notification_promotions" as const,
                label: "Promotions & updates",
                desc: "News, offers, and product announcements",
                ocid: "settings.notif_promotions_switch",
              },
            ].map(({ key, label, desc, ocid }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={settings?.[key] ?? false}
                  onCheckedChange={(v) => patchSettings({ [key]: v })}
                  data-ocid={ocid}
                />
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Delivery Preferences"
        description="How and when to receive notifications"
        icon={Smartphone}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Notification Sound</p>
              <p className="text-xs text-muted-foreground">
                Play a sound for incoming notifications
              </p>
            </div>
            <Switch
              checked={notifSound}
              onCheckedChange={setNotifSound}
              data-ocid="settings.notif_sound_switch"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Quiet Hours (10pm – 8am)</p>
              <p className="text-xs text-muted-foreground">
                Suppress non-urgent notifications overnight
              </p>
            </div>
            <Switch
              checked={quietHours}
              onCheckedChange={setQuietHours}
              data-ocid="settings.quiet_hours_switch"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Push Notifications</p>
              <p className="text-xs text-muted-foreground">
                Browser push alerts (requires permission)
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={(v) => {
                setPushEnabled(v);
                if (v) toast.info("Push permission requested (demo)");
              }}
              data-ocid="settings.push_notif_switch"
            />
          </div>
          <Separator className="bg-border" />
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email Digest</Label>
            <Select
              value={emailDigest}
              onValueChange={(v) => setEmailDigest(v as typeof emailDigest)}
            >
              <SelectTrigger data-ocid="settings.email_digest_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off — no digest emails</SelectItem>
                <SelectItem value="daily">
                  Daily — summary every morning
                </SelectItem>
                <SelectItem value="weekly">
                  Weekly — summary every Monday
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

// ── Tab: Budget & Limits ───────────────────────────────────────────────────

function BudgetLimitsTab({
  settings: _settings,
  patchSettings: _patchSettings,
}: {
  settings: UserSettings | undefined;
  patchSettings: (p: Partial<UserSettings>) => void;
}) {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { data: budgets = [] } = useBudgets();
  const { mutate: setBudget } = useSetBudget();
  const now = new Date();
  const { data: analytics } = useSpendingAnalytics(
    now.getMonth() + 1,
    now.getFullYear(),
  );
  // Use fallback defaults for limit display since settings is intentionally unused in budget tab
  const _perTxLimit = BigInt(10000);
  const _dailyLimit = BigInt(50000);
  const _monthlyLimit = BigInt(500000);

  function getSpentForCategory(cat: SpendingCategory): number {
    return (
      analytics?.categories.find((c) => c.category === cat)?.totalCents ?? 0
    );
  }

  function getBudgetFor(cat: SpendingCategory): BudgetSetting | undefined {
    return budgets.find((b) => b.category === cat);
  }

  function handleLimitChange(cat: SpendingCategory, value: string) {
    const cents = Math.round(Number.parseFloat(value) * 100);
    if (Number.isNaN(cents)) return;
    const existing = getBudgetFor(cat);
    setBudget({
      category: cat,
      limitCents: cents,
      spentCents: getSpentForCategory(cat),
      alertAt: existing?.alertAt ?? 80,
    });
  }

  function handleAlertChange(cat: SpendingCategory, value: number[]) {
    const existing = getBudgetFor(cat);
    if (!existing) return;
    setBudget({ ...existing, alertAt: value[0] });
  }

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Spending Limits"
        description="Hard limits on transactions"
        icon={TrendingUp}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Per Transaction", value: BigInt(10000), unit: "/tx" },
              { label: "Daily Limit", value: BigInt(50000), unit: "/day" },
              { label: "Monthly Limit", value: BigInt(500000), unit: "/mo" },
            ].map(({ label, value, unit }) => (
              <div
                key={label}
                className="p-3 rounded-xl bg-muted/30 border border-border text-center"
                data-ocid={`settings.limit_${label.toLowerCase().replace(/\s/g, "_")}_card`}
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  {label}
                </p>
                <p className="font-display font-bold text-sm">
                  ${centsToDisplay(value)}
                </p>
                <p className="text-[10px] text-muted-foreground">{unit}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Need higher limits?</p>
              <p className="text-xs text-muted-foreground">
                Verified accounts can request increases
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLimitModal(true)}
              data-ocid="settings.request_limit_increase_button"
            >
              Request Increase
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Category Budgets"
        description="Set monthly budgets per spending category"
        icon={BookOpen}
      >
        <div className="space-y-4">
          {SPENDING_CATEGORIES.map(({ key, label, emoji }) => {
            const budget = getBudgetFor(key);
            const spent = getSpentForCategory(key);
            const limit = budget?.limitCents ?? 0;
            const pct =
              limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const alertAt = budget?.alertAt ?? 80;
            const isOverAlert = limit > 0 && pct >= alertAt;
            const isOver = pct >= 100;

            return (
              <div
                key={key}
                className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-smooth"
                data-ocid={`settings.budget_${key}_row`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{emoji}</span>
                  <p className="text-sm font-medium flex-1">{label}</p>
                  {isOver && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-destructive/40 text-destructive bg-destructive/10"
                    >
                      Over Budget
                    </Badge>
                  )}
                  {isOverAlert && !isOver && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-yellow-500/40 text-yellow-500 bg-yellow-500/10"
                    >
                      Near Limit
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Monthly Limit ($)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      placeholder="0.00"
                      defaultValue={limit > 0 ? (limit / 100).toFixed(2) : ""}
                      onBlur={(e) => handleLimitChange(key, e.target.value)}
                      className="h-8 text-sm"
                      data-ocid={`settings.budget_${key}_input`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Alert at {alertAt}%
                    </Label>
                    <div className="flex items-center gap-2 pt-1.5">
                      <Slider
                        min={50}
                        max={100}
                        step={5}
                        value={[alertAt]}
                        onValueChange={(v) => handleAlertChange(key, v)}
                        className="flex-1"
                        data-ocid={`settings.budget_${key}_alert_slider`}
                      />
                    </div>
                  </div>
                </div>
                {limit > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>${(spent / 100).toFixed(2)} spent</span>
                      <span>
                        ${(limit / 100).toFixed(2)} limit ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isOver ? "bg-destructive" : isOverAlert ? "bg-yellow-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <RequestLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </div>
  );
}

// ── Tab: Privacy ───────────────────────────────────────────────────────────

function PrivacyTab({
  settings,
  patchSettings,
}: {
  settings: UserSettings | undefined;
  patchSettings: (p: Partial<UserSettings>) => void;
}) {
  const [showDownloadData, setShowDownloadData] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [activityFeed, setActivityFeed] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Profile Visibility"
        description="Control who can see your profile and activity"
        icon={Eye}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Public Profile</p>
              <p className="text-xs text-muted-foreground">
                Let anyone view your PayFlow profile page
              </p>
            </div>
            <Switch
              checked={publicProfile}
              onCheckedChange={setPublicProfile}
              data-ocid="settings.public_profile_switch"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Activity Feed Visibility</p>
              <p className="text-xs text-muted-foreground">
                Show your payments in the public activity feed
              </p>
            </div>
            <Switch
              checked={activityFeed}
              onCheckedChange={setActivityFeed}
              data-ocid="settings.activity_feed_switch"
            />
          </div>
          <Separator className="bg-border" />
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Transaction History Visibility
            </Label>
            <Select
              value={
                settings?.tx_history_visibility ?? TxHistoryVisibility.Private
              }
              onValueChange={(v) =>
                patchSettings({
                  tx_history_visibility: v as TxHistoryVisibility,
                })
              }
            >
              <SelectTrigger data-ocid="settings.tx_visibility_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TxHistoryVisibility.Private}>
                  Private — only you
                </SelectItem>
                <SelectItem value={TxHistoryVisibility.FriendsOnly}>
                  Friends Only
                </SelectItem>
                <SelectItem value={TxHistoryVisibility.Public}>
                  Public
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Security & Data"
        description="Balance privacy and data consent"
        icon={EyeOff}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                Hide Balance from Screenshots
              </p>
              <p className="text-xs text-muted-foreground">
                Blur balance when switching apps (mobile)
              </p>
            </div>
            <Switch
              checked={hideBalance}
              onCheckedChange={setHideBalance}
              data-ocid="settings.hide_balance_switch"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Analytics Data Sharing</p>
              <p className="text-xs text-muted-foreground">
                Help improve PayFlow with anonymized usage data
              </p>
            </div>
            <Switch
              checked={settings?.data_sharing ?? false}
              onCheckedChange={(v) => patchSettings({ data_sharing: v })}
              data-ocid="settings.data_sharing_switch"
            />
          </div>
          <Separator className="bg-border" />
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowDownloadData(true)}
              data-ocid="settings.download_data_button"
            >
              <Download className="h-3.5 w-3.5" /> Download My Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDeleteAccount(true)}
              data-ocid="settings.delete_account_button"
            >
              <Trash2 className="h-3.5 w-3.5" /> Request Account Deletion
            </Button>
          </div>
        </div>
      </SettingsSection>

      <DownloadDataModal
        open={showDownloadData}
        onClose={() => setShowDownloadData(false)}
      />
      <DeleteAccountModal
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </div>
  );
}

// ── Tab: Connected ─────────────────────────────────────────────────────────

function ConnectedTab() {
  const [showDisconnect, setShowDisconnect] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Connected Apps"
        description="Third-party services with PayFlow API access"
        icon={Globe}
      >
        <div className="space-y-3">
          {CONNECTED_APPS.map((app, idx) => {
            const AppIcon = app.icon;
            const isConnected = app.status === "connected";
            return (
              <div
                key={app.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/10"
                data-ocid={`settings.connected_app.${idx + 1}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${isConnected ? "bg-primary/10 border-primary/20" : "bg-muted/30 border-border"}`}
                >
                  <AppIcon
                    className={`h-5 w-5 ${isConnected ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                    {app.name}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 ${isConnected ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" : "border-muted-foreground/30 text-muted-foreground"}`}
                    >
                      {isConnected ? "Connected" : "Not Connected"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {app.scope}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.description}
                  </p>
                  {app.connectedAt && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Connected {app.connectedAt}
                    </p>
                  )}
                </div>
                {isConnected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                    onClick={() => setShowDisconnect(app.id)}
                    data-ocid={`settings.connected_app_revoke.${idx + 1}`}
                  >
                    Revoke
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      toast.info(`${app.name} integration coming soon`)
                    }
                    data-ocid={`settings.connected_app_connect.${idx + 1}`}
                  >
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Stripe Customer Portal"
        description="Manage your payment methods and billing"
        icon={CreditCard}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Access the Stripe Customer Portal to update your payment methods,
            view invoices, and manage your billing preferences.
          </p>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.info("Opening Stripe Customer Portal...")}
            data-ocid="settings.stripe_portal_button"
          >
            <CreditCard className="h-4 w-4" /> Open Stripe Portal
          </Button>
        </div>
      </SettingsSection>

      <Dialog
        open={!!showDisconnect}
        onOpenChange={() => setShowDisconnect(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="disconnect_app.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Revoke App Access
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            This will immediately revoke{" "}
            {CONNECTED_APPS.find((a) => a.id === showDisconnect)?.name}'s access
            to your PayFlow account. Any active integrations will stop working.
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDisconnect(null)}
              data-ocid="disconnect_app.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                toast.success("App access revoked");
                setShowDisconnect(null);
              }}
              data-ocid="disconnect_app.confirm_button"
            >
              Revoke Access
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Advanced ──────────────────────────────────────────────────────────

function AdvancedTab({
  principal,
}: { principal: { toString: () => string } | null | undefined }) {
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const accountId = principal ? principal.toString() : "xxxx-xxxx-xxxx-xxxx";
  const mockApiKey = "pk_live_payflow_xxxxxxxxxxxxxxxxxx";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Account Information"
        description="Your account identifiers and references"
        icon={Settings}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Account ID (Principal)
            </Label>
            <div className="flex gap-2">
              <Input
                value={accountId}
                readOnly
                className="font-mono text-xs flex-1 bg-muted/30"
                data-ocid="settings.account_id_input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(accountId, "Account ID")}
                data-ocid="settings.account_id_copy_button"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Your unique PayFlow principal identifier
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="API Access"
        description="Developer API key for Business tier"
        icon={Code2}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            <p className="text-xs text-muted-foreground">
              API access requires a{" "}
              <strong className="text-foreground">Business</strong> or higher
              subscription.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 ml-auto"
              onClick={() =>
                toast.info("Upgrade to Business to get API access")
              }
              data-ocid="settings.api_upgrade_button"
            >
              Upgrade
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">API Key</Label>
            <div className="flex gap-2">
              <Input
                value={apiKeyVisible ? mockApiKey : `pk_live_${"•".repeat(26)}`}
                readOnly
                className="font-mono text-xs flex-1 bg-muted/30"
                data-ocid="settings.api_key_input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                data-ocid="settings.api_key_toggle_button"
              >
                {apiKeyVisible ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Upgrade to Business to copy your API key")
                }
                data-ocid="settings.api_key_copy_button"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Never share your API key. Treat it like a password.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => toast.info("API documentation coming soon")}
            data-ocid="settings.api_docs_button"
          >
            <BookOpen className="h-3.5 w-3.5" /> View API Documentation
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Data & Account"
        description="Export data or delete your account"
        icon={Fingerprint}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Export All Data</p>
            <p className="text-xs text-muted-foreground mb-2">
              Download a complete copy of your PayFlow data including
              transactions, profile, and settings.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  toast.success(
                    "CSV export requested. Check your email in 24 hours.",
                  )
                }
                data-ocid="settings.export_csv_button"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  toast.success(
                    "JSON export requested. Check your email in 24 hours.",
                  )
                }
                data-ocid="settings.export_json_button"
              >
                <Download className="h-3.5 w-3.5" /> Export JSON
              </Button>
            </div>
          </div>
          <Separator className="bg-border" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">Danger Zone</p>
            <p className="text-xs text-muted-foreground">
              Account deletion enters a 30-day grace period. You can cancel by
              signing back in within that window.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
              onClick={() => setShowDeleteAccount(true)}
              data-ocid="settings.delete_account_button"
            >
              <Trash2 className="h-3.5 w-3.5" /> Request Account Deletion
            </Button>
          </div>
        </div>
      </SettingsSection>

      <DeleteAccountModal
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────────────

export default function SettingsPage() {
  const { logout, principal } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useUserSettings();
  const { mutate: updateSettings } = useUpdateUserSettings();
  const { data: sessions = [], isLoading: sessionsLoading } =
    useDeviceSessions();
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession();
  const { mutate: revokeAllSessions, isPending: isRevokingAll } =
    useRevokeAllSessions();

  const shortPrincipal = principal
    ? `${principal.toString().slice(0, 8)}...${principal.toString().slice(-6)}`
    : "—";

  function patchSettings(patch: Partial<UserSettings>) {
    if (!settings) return;
    updateSettings({ ...settings, ...patch });
  }

  return (
    <div className="space-y-5 max-w-2xl" data-ocid="settings.page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display font-bold text-2xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, preferences, and security
        </p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl"
        data-ocid="settings.profile_card"
      >
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold">PayFlow User</p>
          <p className="text-xs font-mono text-muted-foreground truncate">
            {shortPrincipal}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            toast.info("Go to the Profile page to edit your details")
          }
          data-ocid="settings.edit_profile_button"
          className="shrink-0"
        >
          Edit <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="general" data-ocid="settings.tabs">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1 rounded-xl mb-5 w-full">
            {[
              { value: "general", label: "General" },
              { value: "security", label: "Security" },
              { value: "notifications", label: "Notifications" },
              { value: "budget", label: "Budget & Limits" },
              { value: "privacy", label: "Privacy" },
              { value: "connected", label: "Connected" },
              { value: "advanced", label: "Advanced" },
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 text-xs sm:text-sm min-w-fit"
                data-ocid={`settings.tab.${value}`}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general">
            <GeneralTab
              settings={settings}
              patchSettings={patchSettings}
              settingsLoading={settingsLoading}
            />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab
              sessions={sessions}
              sessionsLoading={sessionsLoading}
              onRevoke={(id) =>
                revokeSession(id, {
                  onSuccess: () => toast.success("Session revoked"),
                  onError: () => toast.error("Failed to revoke session"),
                })
              }
              onRevokeAll={() =>
                revokeAllSessions(undefined, {
                  onSuccess: () =>
                    toast.success("All other sessions signed out"),
                  onError: () => toast.error("Failed to sign out all sessions"),
                })
              }
              isRevoking={isRevoking}
              isRevokingAll={isRevokingAll}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab
              settings={settings}
              patchSettings={patchSettings}
              settingsLoading={settingsLoading}
            />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetLimitsTab
              settings={settings}
              patchSettings={patchSettings}
            />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacyTab settings={settings} patchSettings={patchSettings} />
          </TabsContent>

          <TabsContent value="connected">
            <ConnectedTab />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedTab principal={principal} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        onClick={() => logout()}
        data-ocid="settings.logout_button"
      >
        <LogOut className="h-4 w-4" /> Sign out of PayFlow
      </Button>
    </div>
  );
}
