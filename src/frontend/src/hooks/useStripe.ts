import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeCardElement } from "@stripe/stripe-js";
import { useCallback, useEffect, useRef, useState } from "react";

// Stripe publishable key — loaded from env or a default test key for dev
const STRIPE_PK =
  (import.meta.env.VITE_STRIPE_PK as string | undefined) ??
  "pk_test_placeholder";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PK);
  }
  return stripePromise;
}

export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    getStripePromise()
      .then((s) => {
        if (isMounted.current) {
          setStripe(s);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted.current) {
          setError(
            err instanceof Error ? err.message : "Failed to load Stripe",
          );
          setIsLoading(false);
        }
      });
    return () => {
      isMounted.current = false;
    };
  }, []);

  const confirmCardSetup = useCallback(
    async (clientSecret: string, cardElement: StripeCardElement) => {
      if (!stripe) throw new Error("Stripe not loaded");
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Card setup failed");
      }
      return result.setupIntent;
    },
    [stripe],
  );

  const confirmCardPayment = useCallback(
    async (clientSecret: string, cardElement: StripeCardElement) => {
      if (!stripe) throw new Error("Stripe not loaded");
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Payment failed");
      }
      return result.paymentIntent;
    },
    [stripe],
  );

  return { stripe, isLoading, error, confirmCardSetup, confirmCardPayment };
}
