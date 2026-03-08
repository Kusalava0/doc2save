'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
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
    <div className="flex h-full w-60 flex-col bg-zinc-950 border-r border-zinc-800">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4">
        <FileText className="h-6 w-6 text-blue-500" />
        <span className="text-lg font-bold text-white tracking-tight">
          Doc2Save
        </span>
      </div>

      <Separator className="bg-zinc-800" />

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
                  ? 'bg-zinc-800/50 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
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
        <Separator className="bg-zinc-800 mb-2" />

        {/* Subscription badge */}
        <Link
          href="/subscription"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-800/50 transition-colors"
        >
          <Shield className="h-4 w-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">Plan</span>
          <Badge
            variant="secondary"
            className={cn(
              'ml-auto text-xs',
              isActive
                ? 'bg-green-900/50 text-green-400 border border-green-800'
                : 'bg-zinc-800 text-zinc-300'
            )}
          >
            {planLabel}
          </Badge>
        </Link>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs text-white">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-zinc-300 truncate">
              {user.name || user.phone || user.email}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
