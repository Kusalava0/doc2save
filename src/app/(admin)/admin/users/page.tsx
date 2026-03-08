'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminUsers, useBlockUser } from '@/hooks/use-admin';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useAdminUsers({ page, search });
  const blockUser = useBlockUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      await blockUser.mutateAsync({ userId, isBlocked });
      toast.success(isBlocked ? 'User blocked' : 'User unblocked');
    } catch {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by phone or name..."
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="border-border text-foreground/80 hover:bg-accent"
        >
          Search
        </Button>
      </form>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-muted-foreground">Failed to load users</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Phone</TableHead>
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Docs</TableHead>
                      <TableHead className="text-muted-foreground">Subscription</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.length === 0 ? (
                      <TableRow className="border-border">
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.users.map((user) => (
                        <TableRow
                          key={user.id}
                          className="border-border hover:bg-accent/50 cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/users/${user.id}`)
                          }
                        >
                          <TableCell className="text-foreground/80 font-mono text-sm">
                            {user.phone}
                          </TableCell>
                          <TableCell className="text-foreground/80">
                            {user.name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                user.role === 'ADMIN'
                                  ? 'bg-red-600/20 text-red-400 border-red-600/30'
                                  : 'bg-muted text-muted-foreground'
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isBlocked ? (
                              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                                Blocked
                              </Badge>
                            ) : (
                              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-foreground/80">
                            {user.documentCount}
                          </TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <Badge
                                className={
                                  user.subscription.status === 'ACTIVE'
                                    ? 'bg-green-600/20 text-green-400 border-green-600/30'
                                    : 'bg-muted text-muted-foreground'
                                }
                              >
                                {user.subscription.status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                                onClick={() =>
                                  handleBlock(user.id, !user.isBlocked)
                                }
                                disabled={blockUser.isPending}
                              >
                                {user.isBlocked ? (
                                  <ShieldCheck className="h-4 w-4" />
                                ) : (
                                  <ShieldOff className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
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
                    Page {data.page} of {data.totalPages} ({data.total} users)
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
