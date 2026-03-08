'use client';

import { useState } from 'react';
import {
  CreditCard,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

interface SubscriptionEntry {
  id: string;
  userId: string;
  userPhone: string;
  userName: string | null;
  status: string;
  planId: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'CANCELLED', 'CREATED', 'EXPIRED', 'HALTED'];

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'CANCELLED':
      return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'EXPIRED':
    case 'HALTED':
      return 'bg-red-600/20 text-red-400 border-red-600/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // We use the admin users endpoint with subscription info
  // since subscriptions are tied to users
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.subscriptions({ page, status: statusFilter === 'ALL' ? undefined : statusFilter }),
    queryFn: () =>
      fetchJson<{
        users: Array<{
          id: string;
          phone: string;
          name: string | null;
          subscription: { status: string; currentPeriodEnd: string | null } | null;
        }>;
        total: number;
        page: number;
        totalPages: number;
      }>(
        `/api/users?page=${page}&limit=20${
          statusFilter !== 'ALL' ? `&hasSubscription=true` : ''
        }`
      ),
  });

  // Filter users that have subscriptions
  const subscriptionUsers = data?.users.filter((u) => {
    if (!u.subscription) return statusFilter === 'ALL';
    if (statusFilter === 'ALL') return !!u.subscription;
    return u.subscription.status === statusFilter;
  }) ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        </div>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-border text-foreground/80 hover:bg-accent"
            >
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === 'ALL' ? 'All statuses' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            {STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className="text-foreground/80 focus:bg-accent focus:text-foreground"
              >
                {status === 'ALL' ? 'All statuses' : status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-muted-foreground">Failed to load subscriptions</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">User Phone</TableHead>
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Period End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionUsers.length === 0 ? (
                      <TableRow className="border-border">
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-8"
                        >
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptionUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="border-border hover:bg-accent/50"
                        >
                          <TableCell className="text-foreground/80 font-mono text-sm">
                            {user.phone}
                          </TableCell>
                          <TableCell className="text-foreground/80">
                            {user.name || '-'}
                          </TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <Badge className={getStatusBadgeClasses(user.subscription.status)}>
                                {user.subscription.status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-foreground/80 text-sm">
                            {formatDate(user.subscription?.currentPeriodEnd ?? null)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-border text-muted-foreground hover:bg-accent"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-border text-muted-foreground hover:bg-accent"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
