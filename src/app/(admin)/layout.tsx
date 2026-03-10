'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogOut,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminNavItems } from '@/config/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout } = useAuthStore();

  const user = auth.status === 'authenticated' ? auth.user : null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex h-full w-60 flex-col bg-background border-r border-border">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4">
        <Image src="/icons/icon-192x192.png" alt="AptsWorks" width={28} height={28} className="rounded" />
        <span className="text-lg font-bold text-foreground tracking-tight">
          AptsWorks
        </span>
        <Badge className="ml-auto bg-red-600/20 text-red-400 border-red-600/30 text-xs">
          Admin
        </Badge>
      </div>

      <Separator className="bg-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {adminNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/50 text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-2 px-2 pb-3">
        <Separator className="bg-border mb-2" />

        {/* Back to dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-foreground">
              {user.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="text-sm text-foreground/80 truncate">
              {user.name || user.phone}
            </span>
            <Shield className="h-3 w-3 text-red-400 ml-auto" />
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { auth } = useAuthStore();

  // Redirect non-admins
  useEffect(() => {
    if (auth.status === 'authenticated' && auth.user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
    if (auth.status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [auth, router]);

  if (auth.status !== 'authenticated' || auth.user.role !== 'ADMIN') {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  return (
        <div className="flex h-dvh bg-background">
          {/* Sidebar */}
          <aside className="hidden md:flex md:w-60 md:flex-shrink-0">
            <AdminSidebar />
          </aside>

          {/* Main content area */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Mobile header */}
            <div className="flex h-14 items-center gap-2 px-4 border-b border-border md:hidden">
              <Image src="/icons/icon-192x192.png" alt="AptsWorks" width={24} height={24} className="rounded" />
              <span className="font-bold text-foreground">AptsWorks</span>
              <Badge className="bg-red-600/20 text-red-400 border-red-600/30 text-xs">
                Admin
              </Badge>
            </div>

            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

            {/* Mobile bottom nav for admin */}
            <nav className="flex md:hidden border-t border-border bg-background">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-1 flex-col items-center gap-1 py-2 text-muted-foreground hover:text-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
  );
}
