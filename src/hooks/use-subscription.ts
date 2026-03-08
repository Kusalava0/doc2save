'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { SubscriptionData } from '@/types/api';

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: async (): Promise<SubscriptionData> => {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ error: 'Failed to fetch subscription' }));
        throw new Error(body.error || 'Failed to fetch subscription');
      }
      const data = await res.json();
      return data.subscription;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
