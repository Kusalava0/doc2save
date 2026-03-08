'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, CreditCard, Smartphone, Mail, Check, Link2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useUser } from '@/hooks/use-user';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';
import { signInWithGoogle } from '@/lib/firebase/client';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { auth, updateUser, logout } = useAuthStore();
  const { data: profile } = useUser();
  const user = auth.status === 'authenticated' ? auth.user : null;

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update');
      }
      updateUser({ name: name.trim() });
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      toast.success('Name updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true);
    try {
      const idToken = await signInWithGoogle();

      const res = await fetch('/api/auth/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to link Google account');
      }

      const data = await res.json();
      updateUser({ email: data.user.email, name: data.user.name });
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      toast.success('Google account linked successfully');
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      // Silently ignore popup-closed
      if (
        firebaseErr.code === 'auth/popup-closed-by-user' ||
        firebaseErr.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      toast.error(firebaseErr.message || 'Failed to link Google account');
    } finally {
      setLinkingGoogle(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      {/* Profile section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Name</label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-background border-border text-foreground placeholder:text-zinc-600"
              />
              <Button
                onClick={handleSaveName}
                disabled={saving || !name.trim() || name.trim() === user?.name}
                className="bg-white text-black hover:bg-accent shrink-0"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          <Separator className="bg-muted" />
          <div>
            <label className="text-sm font-medium text-muted-foreground">Phone</label>
            <div className="flex items-center gap-2 mt-1">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <p className="text-foreground">{user?.phone || profile?.phone || 'Not set'}</p>
            </div>
          </div>
          {(user?.email || profile?.email) && (
            <>
              <Separator className="bg-muted" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{user?.email || profile?.email}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Linked Accounts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Linked Accounts
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Link multiple sign-in methods to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Phone */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Phone Number</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.hasPhone || user?.phone
                    ? user?.phone || profile?.phone
                    : 'Not linked'}
                </p>
              </div>
            </div>
            {(profile?.hasPhone || user?.phone) ? (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Check className="h-3.5 w-3.5" />
                Linked
              </div>
            ) : (
              <p className="text-xs text-zinc-600">Sign in with phone to link</p>
            )}
          </div>

          {/* Google */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-foreground">Google</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.hasGoogle || user?.email
                    ? user?.email || profile?.email
                    : 'Not linked'}
                </p>
              </div>
            </div>
            {(profile?.hasGoogle || user?.email) ? (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Check className="h-3.5 w-3.5" />
                Linked
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLinkGoogle}
                disabled={linkingGoogle}
                className="border-border text-foreground/80 hover:bg-accent hover:text-foreground text-xs h-8"
              >
                {linkingGoogle ? 'Linking...' : 'Link Google'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Subscription</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your subscription plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            variant="outline"
            className="border-border text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            <Link href="/subscription">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscription
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-red-900/30">
        <CardHeader>
          <CardTitle className="text-foreground">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-red-800/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
