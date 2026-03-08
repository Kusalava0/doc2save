'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { UserProfile } from '@/types/api';

export function useUser() {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: async (): Promise<UserProfile> => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to fetch user' }));
        throw new Error(body.error || 'Failed to fetch user');
      }
      const data = await res.json();
      // API returns { user, subscription, stats } — flatten into UserProfile
      return {
        userId: data.user.userId,
        phone: data.user.phone,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        freeUploadUsed: data.user.freeUploadUsed,
        hasPhone: data.user.hasPhone ?? !!data.user.phone,
        hasGoogle: data.user.hasGoogle ?? !!data.user.email,
        createdAt: data.user.createdAt,
        documentCount: data.stats?.documentCount ?? 0,
        storageUsedBytes: Number(data.stats?.totalStorageUsed ?? 0),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useCanUpload() {
  const { data: user, isLoading } = useUser();

  const canUpload = (() => {
    if (!user) return false;
    // User can upload if they haven't used their free upload yet
    if (!user.freeUploadUsed) return true;
    // Otherwise, they need an active subscription (checked via subscription hook)
    return false;
  })();

  return {
    canUpload,
    isLoading,
    user,
    needsSubscription: user ? user.freeUploadUsed : false,
  };
}
