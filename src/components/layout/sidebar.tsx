'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { dashboardNavItems } from '@/config/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSubscription } from '@/hooks/use-subscription';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout } = useAuthStore();
  const { data: subscription } = useSubscription();

  const user = auth.status === 'authenticated' ? auth.user : null;

  const isActive = subscription?.status === 'ACTIVE' || subscription?.status === 'AUTHENTICATED';
  const planLabel = isActive ? 'Active' : 'Free';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-full w-60 flex-col bg-background border-r border-border">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4">
        <Image src="/icons/icon-192x192.png" alt="AptsWorks" width={28} height={28} className="rounded" />
        <span className="text-lg font-bold text-foreground tracking-tight">
          AptsWorks
        </span>
      </div>

      <Separator className="bg-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {dashboardNavItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent/50 text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-2 px-2 pb-3">
        <Separator className="bg-border mb-2" />

        {/* Subscription badge */}
        <Link
          href="/subscription"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors"
        >
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Plan</span>
          <Badge
            variant="secondary"
            className={cn(
              'ml-auto text-xs',
              isActive
                ? 'bg-green-900/50 text-green-400 border border-green-800'
                : 'bg-muted text-foreground/80'
            )}
          >
            {planLabel}
          </Badge>
        </Link>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-foreground">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-foreground/80 truncate">
              {user.name || user.phone || user.email}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
