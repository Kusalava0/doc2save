'use client';

import { useNotifications } from '@/hooks/use-notifications';

export function NotificationInit() {
  useNotifications();
  return null;
}
