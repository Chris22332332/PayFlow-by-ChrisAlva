import { create } from "zustand";
import type {
  PaymentMethod,
  Transaction,
  UserProfile,
  WalletState,
} from "../types";

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  profile: null,
  transactions: [],
  paymentMethods: [],
  isLoading: false,
  setProfile: (profile: UserProfile | null) => set({ profile }),
  setBalance: (balance: number) => set({ balance }),
  setTransactions: (transactions: Transaction[]) => set({ transactions }),
  setPaymentMethods: (paymentMethods: PaymentMethod[]) =>
    set({ paymentMethods }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));
