'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Crown, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { queryKeys } from '@/lib/query-keys';
import { SUBSCRIPTION_AMOUNT } from '@/lib/constants';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  'Unlimited document uploads',
  'Up to 50 MB per file',
  'PDF, JPEG, PNG, HEIC, DOCX support',
  'Secure cloud storage',
];

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  const queryClient = useQueryClient();
  const { auth } = useAuthStore();
  const {
    checkoutState,
    setCheckoutState,
    setRazorpaySubscriptionId,
    setError,
    reset,
  } = useSubscriptionStore();

  const user = auth.status === 'authenticated' ? auth.user : null;

  const isCheckoutBusy =
    checkoutState === 'creating_subscription' ||
    checkoutState === 'checkout_open' ||
    checkoutState === 'processing';

  const handleSubscribe = useCallback(async () => {
    try {
      setCheckoutState('creating_subscription');

      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user?.phone }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(body.error || 'Failed to create subscription');
      }

      const { subscriptionId } = await res.json();
      setRazorpaySubscriptionId(subscriptionId);
      setCheckoutState('checkout_open');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id: subscriptionId,
        name: 'Doc2Save',
        description: `Monthly Subscription - Rs ${SUBSCRIPTION_AMOUNT}`,
        handler: () => {
          setCheckoutState('success');
          toast.success('Subscription activated successfully!');
          queryClient.invalidateQueries({
            queryKey: queryKeys.subscription,
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.userProfile,
          });
          onOpenChange(false);
          setTimeout(() => reset(), 3000);
        },
        modal: {
          ondismiss: () => {
            setCheckoutState('idle');
          },
        },
        prefill: {
          contact: user?.phone ?? '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Subscription failed';
      setError(message);
      setCheckoutState('error');
      toast.error(message);
      setTimeout(() => reset(), 3000);
    }
  }, [
    user?.phone,
    setCheckoutState,
    setRazorpaySubscriptionId,
    setError,
    reset,
    queryClient,
    onOpenChange,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
            <Crown className="h-6 w-6 text-blue-400" />
          </div>
          <DialogTitle className="text-white text-lg">
            Upgrade to continue uploading
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            You have used your free upload. Subscribe to Doc2Save Pro for
            unlimited uploads.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="text-center">
            <span className="text-3xl font-bold text-white">
              Rs {SUBSCRIPTION_AMOUNT}
            </span>
            <span className="text-zinc-400 ml-1">/month</span>
          </div>

          <div className="space-y-2">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-zinc-300"
              >
                <Check className="h-4 w-4 text-blue-500 shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleSubscribe}
              disabled={isCheckoutBusy}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
            >
              {isCheckoutBusy ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {checkoutState === 'creating_subscription'
                    ? 'Setting up...'
                    : 'Processing...'}
                </>
              ) : (
                'Subscribe Now'
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
