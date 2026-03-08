'use client';

import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';

export function Topbar() {
  const { toggleSidebar, searchQuery, setSearchQuery } = useUIStore();
  const { auth } = useAuthStore();

  const user = auth.status === 'authenticated' ? auth.user : null;
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-4">
      {/* Mobile: hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Mobile: centered title */}
      <span className="flex-1 text-center text-base font-semibold text-white md:hidden">
        Doc2Save
      </span>

      {/* Mobile: search icon */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-zinc-400 hover:text-white hover:bg-zinc-800/50"
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>

      {/* Desktop: search input */}
      <div className="hidden md:flex flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700 h-9"
          />
        </div>
      </div>

      {/* Desktop: user avatar */}
      <div className="hidden md:flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-zinc-800 text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
