'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
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
    <div className="flex h-full w-60 flex-col bg-zinc-950 border-r border-zinc-800">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4">
        <FileText className="h-6 w-6 text-blue-500" />
        <span className="text-lg font-bold text-white tracking-tight">
          Doc2Save
        </span>
        <Badge className="ml-auto bg-red-600/20 text-red-400 border-red-600/30 text-xs">
          Admin
        </Badge>
      </div>

      <Separator className="bg-zinc-800" />

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
                  ? 'bg-zinc-800/50 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
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
        <Separator className="bg-zinc-800 mb-2" />

        {/* Back to dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs text-white">
              {user.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="text-sm text-zinc-300 truncate">
              {user.name || user.phone}
            </span>
            <Shield className="h-3 w-3 text-red-400 ml-auto" />
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
      <div className="flex h-dvh items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
      </div>
    );
  }

  return (
        <div className="flex h-dvh bg-black">
          {/* Sidebar */}
          <aside className="hidden md:flex md:w-60 md:flex-shrink-0">
            <AdminSidebar />
          </aside>

          {/* Main content area */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Mobile header */}
            <div className="flex h-14 items-center gap-2 px-4 border-b border-zinc-800 md:hidden">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="font-bold text-white">Doc2Save</span>
              <Badge className="bg-red-600/20 text-red-400 border-red-600/30 text-xs">
                Admin
              </Badge>
            </div>

            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

            {/* Mobile bottom nav for admin */}
            <nav className="flex md:hidden border-t border-zinc-800 bg-zinc-950">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-1 flex-col items-center gap-1 py-2 text-zinc-400 hover:text-white"
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
