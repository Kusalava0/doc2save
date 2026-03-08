'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { AdminStats, AdminUser, RevenueData } from '@/types/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

async function patchJson<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

// --- Admin Stats ---
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => fetchJson<AdminStats>('/api/admin/stats'),
  });
}

// --- Admin Users List ---
interface UseAdminUsersParams {
  page: number;
  search?: string;
  blocked?: boolean;
}

interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export function useAdminUsers(params: UseAdminUsersParams) {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));

  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.blocked !== undefined) {
    searchParams.set('blocked', String(params.blocked));
  }

  return useQuery({
    queryKey: queryKeys.admin.users({
      page: params.page,
      search: params.search,
      blocked: params.blocked,
    }),
    queryFn: () =>
      fetchJson<AdminUsersResponse>(`/api/users?${searchParams.toString()}`),
  });
}

// --- Admin User Detail ---
interface AdminUserDetail {
  id: string;
  phone: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  freeUploadUsed: boolean;
  createdAt: string;
  documentCount: number;
  storageUsedBytes: number;
  subscription: {
    id: string;
    status: string;
    razorpaySubscriptionId: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelledAt: string | null;
    createdAt: string;
  } | null;
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: queryKeys.admin.userDetail(userId),
    queryFn: () =>
      fetchJson<{ user: AdminUserDetail }>(`/api/users/${userId}`),
    enabled: !!userId,
  });
}

// --- Admin Revenue ---
interface AdminRevenueResponse {
  year: number;
  revenue: RevenueData[];
}

export function useAdminRevenue(year: number) {
  return useQuery({
    queryKey: queryKeys.admin.revenue({ period: 'monthly', year }),
    queryFn: () =>
      fetchJson<AdminRevenueResponse>(`/api/admin/revenue?year=${year}`),
  });
}

// --- Block/Unblock User ---
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isBlocked,
    }: {
      userId: string;
      isBlocked: boolean;
    }) => {
      return patchJson<{ user: AdminUser }>(`/api/users/${userId}`, {
        isBlocked,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.userDetail(variables.userId),
      });
      // Invalidate all admin user lists
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },
  });
}

// --- Update User Role ---
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: 'USER' | 'ADMIN';
    }) => {
      return patchJson<{ user: AdminUser }>(`/api/users/${userId}`, {
        role,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },
  });
}
