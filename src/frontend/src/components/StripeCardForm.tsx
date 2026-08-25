import { CardElement, Elements } from "@stripe/react-stripe-js";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertCircle, Lock } from "lucide-react";

const STRIPE_PK =
  (import.meta.env.VITE_STRIPE_PK as string | undefined) ??
  "pk_test_placeholder";

const stripePromise = loadStripe(STRIPE_PK);

// Stripe card element appearance — matches the dark fintech theme
const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      color: "oklch(0.92 0.015 260)",
      fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
      fontSize: "14px",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "oklch(0.55 0.012 260)",
      },
      iconColor: "oklch(0.72 0.18 190)",
    },
    invalid: {
      color: "oklch(0.55 0.2 25)",
      iconColor: "oklch(0.55 0.2 25)",
    },
  },
  hidePostalCode: false,
};

interface StripeCardElementProps {
  /** Callback receiving the mounted CardElement ref */
  onReady?: (element: ReturnType<typeof CardElement> | null) => void;
  /** Error message from Stripe to display below the element */
  errorMessage?: string | null;
}

function CardElementInner({ errorMessage }: StripeCardElementProps) {
  return (
    <div className="space-y-2">
      <div className="border border-input rounded-lg p-3.5 bg-background focus-within:ring-1 focus-within:ring-ring transition-smooth">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {errorMessage && (
        <p
          className="flex items-center gap-1.5 text-xs text-destructive"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        Secured by Stripe — we never see your full card number
      </p>
    </div>
  );
}

interface StripeCardFormProps extends StripeCardElementProps {
  /** Wrap in Elements provider? Default: true. Set false if parent already provides. */
  withProvider?: boolean;
}

export function StripeCardForm({
  withProvider = true,
  errorMessage,
  onReady,
}: StripeCardFormProps) {
  if (withProvider) {
    return (
      <Elements stripe={stripePromise}>
        <CardElementInner errorMessage={errorMessage} onReady={onReady} />
      </Elements>
    );
  }
  return <CardElementInner errorMessage={errorMessage} onReady={onReady} />;
}

export { stripePromise };
