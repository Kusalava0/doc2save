'use client';

import { useState, useCallback } from 'react';
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
import { PLANS, type Plan } from '@/lib/razorpay/plans';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
  const [selectedPlan, setSelectedPlan] = useState<Plan>(
    PLANS.find((p) => p.popular) ?? PLANS[0]
  );

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

  const handleSubscribe = useCallback(
    async (plan: Plan) => {
      try {
        setCheckoutState('creating_subscription');

        const res = await fetch('/api/subscription/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: user?.phone,
            planName: plan.name,
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
          name: 'Doc2Save',
          description: `${plan.name} Plan — ₹${plan.amountDisplay}`,
          handler: async (response: { razorpay_payment_id?: string; razorpay_subscription_id?: string; razorpay_signature?: string }) => {
            try {
              setCheckoutState('success');
              toast.success('Subscription activated successfully!');
              // Verify payment on server
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
              // Reset to idle so user can retry
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
    },
    [
      user?.phone,
      setCheckoutState,
      setRazorpaySubscriptionId,
      setError,
      reset,
      queryClient,
    ]
  );

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

      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-zinc-400" />
          <h1 className="text-2xl font-bold text-white">Subscription</h1>
        </div>

        {isLoading ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
              </div>
            </CardHeader>
          </Card>
        ) : error ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-zinc-400">
                Failed to load subscription info
              </p>
            </CardContent>
          </Card>
        ) : isActive ? (
          /* Active subscription */
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Active Plan</CardTitle>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Active
                </Badge>
              </div>
              <CardDescription className="text-zinc-400">
                Your subscription is active.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PLANS[0].features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              {formattedEndDate && (
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400">
                    Next billing date:{' '}
                    <span className="text-zinc-300">{formattedEndDate}</span>
                  </p>
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Cancel subscription?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      Your subscription will remain active until the end of the
                      current billing period
                      {formattedEndDate ? ` (${formattedEndDate})` : ''}. After
                      that, you will not be able to upload new documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
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
        ) : isCancelled ? (
          /* Cancelled — show resubscribe with plan selection */
          <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Subscription</CardTitle>
                  <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                    Cancelled
                  </Badge>
                </div>
                <CardDescription className="text-zinc-400">
                  Your subscription has been cancelled.
                  {formattedEndDate && (
                    <>
                      {' '}Access continues until{' '}
                      <span className="text-zinc-300 font-medium">
                        {formattedEndDate}
                      </span>
                      .
                    </>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            <PlanCards
              plans={PLANS}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              onSubscribe={handleSubscribe}
              isCheckoutBusy={isCheckoutBusy}
              checkoutState={checkoutState}
            />
          </div>
        ) : (
          /* No subscription — show plan selection */
          <div className="space-y-4">
            <div className="text-center space-y-2 pb-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
                <Crown className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Choose your plan
              </h2>
              <p className="text-sm text-zinc-400">
                Store and manage all your documents securely
              </p>
            </div>

            <PlanCards
              plans={PLANS}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              onSubscribe={handleSubscribe}
              isCheckoutBusy={isCheckoutBusy}
              checkoutState={checkoutState}
            />
          </div>
        )}
      </div>
    </>
  );
}

function PlanCards({
  plans,
  selectedPlan,
  onSelectPlan,
  onSubscribe,
  isCheckoutBusy,
  checkoutState,
}: {
  plans: Plan[];
  selectedPlan: Plan;
  onSelectPlan: (plan: Plan) => void;
  onSubscribe: (plan: Plan) => void;
  isCheckoutBusy: boolean;
  checkoutState: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const planKey = plan.name;
          const isSelected = selectedPlan.name === plan.name;
          return (
            <Card
              key={planKey}
              onClick={() => onSelectPlan(plan)}
              className={cn(
                'relative cursor-pointer transition-all border-2',
                isSelected
                  ? 'border-blue-500 bg-zinc-900'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ₹{plan.amountDisplay}
                  </span>
                  <span className="text-zinc-400 text-sm">
                    /{plan.period === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {plan.period === 'yearly' && (
                  <p className="text-xs text-green-400">
                    ₹{Math.round(plan.amountDisplay / 12)}/mo — Save 30%
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 text-sm text-zinc-300"
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 shrink-0 mt-0.5',
                          isSelected ? 'text-blue-500' : 'text-zinc-500'
                        )}
                      />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={() => onSubscribe(selectedPlan)}
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
          `Subscribe — ₹${selectedPlan.amountDisplay}/${selectedPlan.period === 'monthly' ? 'mo' : 'yr'}`
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
    </div>
  );
}
