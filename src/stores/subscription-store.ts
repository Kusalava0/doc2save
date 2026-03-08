import { create } from 'zustand';

export type CheckoutState =
  | 'idle'
  | 'creating_subscription'
  | 'checkout_open'
  | 'processing'
  | 'success'
  | 'error';

interface SubscriptionStore {
  checkoutState: CheckoutState;
  razorpaySubscriptionId: string | null;
  error: string | null;

  setCheckoutState: (state: CheckoutState) => void;
  setRazorpaySubscriptionId: (id: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  checkoutState: 'idle',
  razorpaySubscriptionId: null,
  error: null,

  setCheckoutState: (state) => set({ checkoutState: state }),
  setRazorpaySubscriptionId: (id) => set({ razorpaySubscriptionId: id }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ checkoutState: 'idle', razorpaySubscriptionId: null, error: null }),
}));
