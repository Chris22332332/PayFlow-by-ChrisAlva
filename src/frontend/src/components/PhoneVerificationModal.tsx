import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequestPhoneVerification, useVerifyPhone } from "@/hooks/usePhone";
import { CheckCircle2, Phone, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PhoneVerificationModalProps {
  open: boolean;
  onClose: () => void;
  currentPhone?: string;
}

const CODE_EXPIRY_SECONDS = 600; // 10 minutes
const RESEND_COOLDOWN_SECONDS = 30;

export function PhoneVerificationModal({
  open,
  onClose,
  currentPhone,
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<"phone" | "code" | "success">("phone");
  const [phone, setPhone] = useState(currentPhone ?? "");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(CODE_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resendRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestVerification = useRequestPhoneVerification();
  const verifyPhone = useVerifyPhone();

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("phone");
        setCode("");
        setTimeLeft(CODE_EXPIRY_SECONDS);
        setResendCooldown(0);
      }, 300);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (step !== "code") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [step]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    resendRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(resendRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(resendRef.current!);
  }, [resendCooldown]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = phone.trim();
    if (!normalized.startsWith("+")) {
      toast.error("Phone must be in international format (+1XXXXXXXXXX)");
      return;
    }
    try {
      await requestVerification.mutateAsync(normalized);
      setStep("code");
      setTimeLeft(CODE_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success("Verification code sent via SMS");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter your 6-digit code");
      return;
    }
    try {
      await verifyPhone.mutateAsync(code);
      setStep("success");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Invalid or expired code",
      );
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await requestVerification.mutateAsync(phone.trim());
      setTimeLeft(CODE_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCode("");
      toast.success("New code sent");
    } catch {
      toast.error("Failed to resend code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-ocid="phone_verify.dialog">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {step === "success" ? "Phone Verified!" : "Verify Phone Number"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1 — Enter phone */}
        {step === "phone" && (
          <form onSubmit={handleSendCode} className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Enter your number in international format. We'll send you a
              6-digit code via SMS.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="phone-input">Phone number</Label>
              <Input
                id="phone-input"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                data-ocid="phone_verify.phone_input"
              />
              <p className="text-xs text-muted-foreground">
                Format: +1XXXXXXXXXX (US), +44XXXXXXXXXX (UK), etc.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-ocid="phone_verify.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!phone.trim() || requestVerification.isPending}
                data-ocid="phone_verify.send_code_button"
              >
                {requestVerification.isPending ? "Sending…" : "Send Code"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2 — Enter code */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4 mt-2">
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-sm">
              Code sent to{" "}
              <span className="font-mono font-semibold">{phone}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="code-input">6-digit code</Label>
                <span
                  className={`text-xs font-mono ${timeLeft <= 60 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {timeLeft > 0
                    ? `Expires in ${formatTime(timeLeft)}`
                    : "Code expired"}
                </span>
              </div>
              <Input
                id="code-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="font-mono text-center text-xl tracking-[0.4em]"
                autoFocus
                required
                data-ocid="phone_verify.code_input"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || requestVerification.isPending}
                className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline transition-colors"
                data-ocid="phone_verify.resend_button"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Change number
              </button>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-ocid="phone_verify.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  code.length !== 6 || timeLeft === 0 || verifyPhone.isPending
                }
                data-ocid="phone_verify.confirm_button"
              >
                {verifyPhone.isPending ? "Verifying…" : "Verify"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3 — Success */}
        {step === "success" && (
          <div className="space-y-4 mt-2 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Phone number verified!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-mono">{phone}</span> is now linked to your
                account. People can send you money using this number.
              </p>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Verified numbers are used for 2FA and payment recovery.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={onClose}
              data-ocid="phone_verify.close_button"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
