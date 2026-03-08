'use client';

import { useCallback } from 'react';
import Script from 'next/script';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { queryKeys } from '@/lib/query-keys';
import { PLAN } from '@/lib/razorpay/plans';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import type { SubscriptionData } from '@/types/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

export default function SubscriptionPage() {
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

  // Fetch subscription status
  const {
    data: subscriptionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.subscription,
    queryFn: () =>
      fetchJson<{ subscription: SubscriptionData | null }>(
        '/api/subscription'
      ).then((res) => res.subscription),
  });

  const status = subscriptionData?.status ?? 'NONE';
  const isActive = status === 'ACTIVE';
  const isCancelled = status === 'CANCELLED';

  const handleSubscribe = useCallback(async () => {
    try {
      setCheckoutState('creating_subscription');

      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone,
          planName: PLAN.name,
        }),
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
        name: 'AptsWorks',
        description: `${PLAN.name} Plan — ₹${PLAN.amountDisplay}/mo`,
        handler: async (response: { razorpay_payment_id?: string; razorpay_subscription_id?: string; razorpay_signature?: string }) => {
          try {
            setCheckoutState('success');
            toast.success('Subscription activated successfully!');
            await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            queryClient.invalidateQueries({
              queryKey: queryKeys.subscription,
            });
            queryClient.invalidateQueries({
              queryKey: queryKeys.userProfile,
            });
          } catch {
            // Webhook will handle it even if this fails
          } finally {
            setTimeout(() => reset(), 3000);
          }
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
      (rzp as any).on('payment.failed', () => {
        setCheckoutState('error');
        toast.error('Payment failed. Please try again.');
        setTimeout(() => reset(), 3000);
      });
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
  ]);

  const handleCancel = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ error: 'Cancel failed' }));
        throw new Error(body.error || 'Failed to cancel subscription');
      }

      toast.success(
        'Subscription cancelled. Access continues until the billing period ends.'
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Cancellation failed';
      toast.error(message);
    }
  }, [queryClient]);

  const formattedEndDate = subscriptionData?.currentPeriodEnd
    ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const isCheckoutBusy =
    checkoutState === 'creating_subscription' ||
    checkoutState === 'checkout_open' ||
    checkoutState === 'processing';

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="p-4 md:p-6 space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
        </div>

        {isLoading ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              </div>
            </CardHeader>
          </Card>
        ) : error ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-muted-foreground">
                Failed to load subscription info
              </p>
            </CardContent>
          </Card>
        ) : isActive ? (
          /* Active subscription */
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Active Plan</CardTitle>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Active
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground">
                Your subscription is active — ₹{PLAN.amountDisplay}/month.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PLAN.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              {formattedEndDate && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Next billing date:{' '}
                    <span className="text-foreground/80">{formattedEndDate}</span>
                  </p>
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground/80 hover:bg-accent hover:text-foreground"
                  >
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                      Cancel subscription?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Your subscription will remain active until the end of the
                      current billing period
                      {formattedEndDate ? ` (${formattedEndDate})` : ''}. After
                      that, you will not be able to upload new documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border text-foreground/80 hover:bg-accent">
                      Keep subscription
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Yes, cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ) : (
          /* No subscription or cancelled — show single plan */
          <div className="space-y-4">
            {isCancelled && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Subscription</CardTitle>
                    <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                      Cancelled
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Your subscription has been cancelled.
                    {formattedEndDate && (
                      <>
                        {' '}Access continues until{' '}
                        <span className="text-foreground/80 font-medium">
                          {formattedEndDate}
                        </span>
                        .
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card className="bg-card border-2 border-blue-500/50">
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
                  <Crown className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-foreground text-lg">
                  AptsWorks Pro
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1 pt-1">
                  <span className="text-4xl font-bold text-foreground">
                    ₹{PLAN.amountDisplay}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  {PLAN.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      {feature}
                    </div>
                  ))}
                </div>

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
                    `Subscribe — ₹${PLAN.amountDisplay}/mo`
                  )}
                </Button>

                {checkoutState === 'error' && (
                  <p className="text-sm text-red-400 text-center">
                    Something went wrong. Please try again.
                  </p>
                )}

                {checkoutState === 'success' && (
                  <p className="text-sm text-green-400 text-center">
                    Subscription activated!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
