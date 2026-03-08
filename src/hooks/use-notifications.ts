'use client';

import { useEffect, useRef } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { useUser } from '@/hooks/use-user';
import {
  requestNotificationPermission,
  hasAskedPermission,
  canNotify,
  notifySubscriptionExpiring,
  notifyStorageWarning,
} from '@/lib/notifications';

const MAX_STORAGE_BYTES = 500 * 1024 * 1024; // 500 MB limit
const STORAGE_WARNING_THRESHOLD = 80; // warn at 80%
const SUBSCRIPTION_WARNING_DAYS = 3;

export function useNotifications() {
  const { data: subscription } = useSubscription();
  const { data: profile } = useUser();
  const hasChecked = useRef(false);

  // Prompt for notification permission on first authenticated load
  useEffect(() => {
    if (!profile || hasAskedPermission()) return;
    // Ask after a short delay so it doesn't feel intrusive
    const timer = setTimeout(() => {
      requestNotificationPermission();
    }, 5000);
    return () => clearTimeout(timer);
  }, [profile]);

  // Check subscription expiry and storage usage
  useEffect(() => {
    if (hasChecked.current || !canNotify()) return;
    if (!profile && !subscription) return;
    hasChecked.current = true;

    // Subscription expiry check
    if (subscription?.currentPeriodEnd) {
      const endDate = new Date(subscription.currentPeriodEnd);
      const now = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft <= SUBSCRIPTION_WARNING_DAYS) {
        notifySubscriptionExpiring(daysLeft);
      }
    }

    // Storage usage check
    if (profile?.storageUsedBytes) {
      const usedPercent = Math.round((profile.storageUsedBytes / MAX_STORAGE_BYTES) * 100);
      if (usedPercent >= STORAGE_WARNING_THRESHOLD) {
        notifyStorageWarning(usedPercent);
      }
    }
  }, [subscription, profile]);
}
