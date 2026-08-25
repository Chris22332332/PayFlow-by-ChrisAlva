import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Building2, Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";

export interface BankFormValues {
  holderName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
}

interface BankLinkFormProps {
  onSubmit: (values: BankFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function MaskedInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  "data-ocid": ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
  "data-ocid"?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          inputMode="numeric"
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          className="pr-10 font-mono"
          data-ocid={ocid}
          autoComplete="off"
        />
        <button
          type="button"
          aria-label={show ? "Hide" : "Show"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
          onClick={() => setShow((v) => !v)}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function BankLinkForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: BankLinkFormProps) {
  const [holderName, setHolderName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">(
    "checking",
  );

  const isValid =
    holderName.trim().length > 0 &&
    routingNumber.length === 9 &&
    accountNumber.length >= 4;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ holderName, routingNumber, accountNumber, accountType });
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Account type toggle */}
      <div className="space-y-1.5">
        <Label>Account type</Label>
        <ToggleGroup
          type="single"
          value={accountType}
          onValueChange={(v) =>
            v && setAccountType(v as "checking" | "savings")
          }
          className="justify-start gap-2"
          data-ocid="bank_link.account_type_toggle"
        >
          <ToggleGroupItem
            value="checking"
            className="flex-1 border border-input data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            data-ocid="bank_link.account_type.checking"
          >
            Checking
          </ToggleGroupItem>
          <ToggleGroupItem
            value="savings"
            className="flex-1 border border-input data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            data-ocid="bank_link.account_type.savings"
          >
            Savings
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Account holder */}
      <div className="space-y-1.5">
        <Label htmlFor="holder-name">Account holder name</Label>
        <Input
          id="holder-name"
          placeholder="Full name as it appears on your account"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          data-ocid="bank_link.holder_name_input"
        />
      </div>

      <MaskedInput
        id="routing-number"
        label="Routing number"
        value={routingNumber}
        onChange={setRoutingNumber}
        placeholder="9-digit ABA routing number"
        maxLength={9}
        data-ocid="bank_link.routing_number_input"
      />

      <MaskedInput
        id="account-number"
        label="Account number"
        value={accountNumber}
        onChange={setAccountNumber}
        placeholder="Account number"
        maxLength={17}
        data-ocid="bank_link.account_number_input"
      />

      {/* Micro-deposit info */}
      <div
        className={cn(
          "flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20",
        )}
      >
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          We'll send two small deposits (under $1 each) to verify your account.
          This takes{" "}
          <span className="text-foreground font-medium">1–3 business days</span>
          . You'll confirm the amounts to complete verification.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          ACH transfers secured with 256-bit encryption
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
          data-ocid="bank_link.cancel_button"
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={!isValid || isLoading}
          onClick={handleSubmit}
          data-ocid="bank_link.submit_button"
        >
          {isLoading ? "Linking..." : "Link account"}
        </Button>
      </div>
    </div>
  );
}
