'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MobileSidebarSheet } from '@/components/layout/mobile-sidebar-sheet';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ModalDispatcher } from '@/components/shared/modal-dispatcher';
import { NotificationInit } from '@/components/shared/notification-init';
import { PwaInstallBanner } from '@/components/shared/pwa-install-banner';
import { useUIStore } from '@/stores/ui-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const selectionMode = useUIStore((s) => s.selectionMode);

  return (
    <AuthGuard>
      <div className="flex h-dvh bg-background">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-60 md:flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Mobile sidebar sheet */}
        <MobileSidebarSheet />

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar />
          <main
            className={
              selectionMode
                ? 'flex-1 overflow-y-auto pb-28 md:pb-14'
                : 'flex-1 overflow-y-auto pb-16 md:pb-0'
            }
          >
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />

        {/* Global modal dispatcher */}
        <ModalDispatcher />
        <NotificationInit />
        <PwaInstallBanner />
      </div>
    </AuthGuard>
  );
}
