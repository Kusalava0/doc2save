'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { SearchBar } from '@/components/shared/search-bar';

export function Topbar() {
  const { toggleSidebar } = useUIStore();
  const { auth } = useAuthStore();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const user = auth.status === 'authenticated' ? auth.user : null;
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  // Cmd/Ctrl+K to focus search
  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus the desktop search input, or open mobile search
        const input = desktopSearchRef.current?.querySelector('input');
        if (input && window.innerWidth >= 768) {
          input.focus();
        } else {
          setMobileSearchOpen(true);
        }
      }
    }
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4">
      {/* Mobile: hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-muted-foreground hover:text-foreground hover:bg-accent/50"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Mobile: search overlay */}
      {mobileSearchOpen ? (
        <div className="flex-1 flex items-center gap-2 md:hidden">
          <div className="flex-1">
            <SearchBar autoFocus onClose={() => setMobileSearchOpen(false)} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileSearchOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile: centered title (absolute so it's truly centered) */}
          <span className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-foreground md:hidden pointer-events-none">
            AptsWorks
          </span>

          {/* Spacer to push icons right */}
          <div className="flex-1 md:hidden" />

          {/* Mobile: search icon */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground hover:bg-accent/50"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Mobile: theme toggle */}
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </>
      )}

      {/* Desktop: search bar */}
      <div ref={desktopSearchRef} className="hidden md:flex flex-1">
        <SearchBar />
      </div>

      {/* Desktop: actions */}
      <div className="hidden md:flex items-center gap-3">
        <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
        <ThemeToggle />
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
