'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MobileSidebarSheet } from '@/components/layout/mobile-sidebar-sheet';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ModalDispatcher } from '@/components/shared/modal-dispatcher';
import { NotificationInit } from '@/components/shared/notification-init';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-dvh bg-black">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-60 md:flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Mobile sidebar sheet */}
        <MobileSidebarSheet />

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />

        {/* Global modal dispatcher */}
        <ModalDispatcher />
        <NotificationInit />
      </div>
    </AuthGuard>
  );
}
