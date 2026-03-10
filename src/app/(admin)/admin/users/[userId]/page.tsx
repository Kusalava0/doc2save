'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  User,
  Calendar,
  FileText,
  HardDrive,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useAdminUserDetail,
  useBlockUser,
  useUpdateUserRole,
} from '@/hooks/use-admin';
import { toast } from 'sonner';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params.userId;

  const { data, isLoading, error } = useAdminUserDetail(userId);
  const blockUser = useBlockUser();
  const updateRole = useUpdateUserRole();

  const user = data?.user;

  const handleBlock = async () => {
    if (!user) return;
    try {
      await blockUser.mutateAsync({
        userId: user.id,
        isBlocked: !user.isBlocked,
      });
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleRoleChange = async (role: 'USER' | 'ADMIN') => {
    if (!user) return;
    try {
      await updateRole.mutateAsync({ userId: user.id, role });
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">User not found</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-border text-foreground/80 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {user.name || 'Unnamed User'}
          </h1>
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge
            className={
              user.role === 'ADMIN'
                ? 'bg-red-600/20 text-red-400 border-red-600/30'
                : 'bg-muted text-muted-foreground'
            }
          >
            {user.role}
          </Badge>
          {user.isBlocked && (
            <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
              Blocked
            </Badge>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Phone:</span>
            <span className="text-foreground/80 font-mono">{user.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Name:</span>
            <span className="text-foreground/80">{user.name || 'Not set'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Joined:</span>
            <span className="text-foreground/80">{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Works:</span>
            <span className="text-foreground/80">{user.documentCount}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Storage:</span>
            <span className="text-foreground/80">
              {formatBytes(user.storageUsedBytes)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {user.subscription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  className={
                    user.subscription.status === 'ACTIVE'
                      ? 'bg-green-600/20 text-green-400 border-green-600/30'
                      : user.subscription.status === 'CANCELLED'
                        ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
                        : 'bg-muted text-muted-foreground'
                  }
                >
                  {user.subscription.status}
                </Badge>
              </div>
              {user.subscription.currentPeriodStart && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Period start:</span>
                  <span className="text-foreground/80">
                    {formatDate(user.subscription.currentPeriodStart)}
                  </span>
                </div>
              )}
              {user.subscription.currentPeriodEnd && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Period end:</span>
                  <span className="text-foreground/80">
                    {formatDate(user.subscription.currentPeriodEnd)}
                  </span>
                </div>
              )}
              {user.subscription.cancelledAt && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Cancelled:</span>
                  <span className="text-foreground/80">
                    {formatDate(user.subscription.cancelledAt)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No subscription</p>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleBlock}
            disabled={blockUser.isPending}
            className={
              user.isBlocked
                ? 'border-green-700 text-green-400 hover:bg-green-900/20'
                : 'border-red-700 text-red-400 hover:bg-red-900/20'
            }
          >
            {blockUser.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : user.isBlocked ? (
              <ShieldCheck className="h-4 w-4 mr-2" />
            ) : (
              <ShieldOff className="h-4 w-4 mr-2" />
            )}
            {user.isBlocked ? 'Unblock User' : 'Block User'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={updateRole.isPending}
                className="border-border text-foreground/80 hover:bg-accent"
              >
                {updateRole.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Change Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border">
              <DropdownMenuItem
                onClick={() => handleRoleChange('USER')}
                className="text-foreground/80 focus:bg-accent focus:text-foreground"
              >
                Set as USER
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange('ADMIN')}
                className="text-foreground/80 focus:bg-accent focus:text-foreground"
              >
                Set as ADMIN
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </div>
  );
}
