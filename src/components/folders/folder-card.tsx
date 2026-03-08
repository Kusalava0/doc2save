'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, MoreVertical, Trash2, Move, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useUIStore } from '@/stores/ui-store';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { FolderData } from '@/types/api';

interface FolderCardProps {
  folder: FolderData;
}

export function FolderCard({ folder }: FolderCardProps) {
  const router = useRouter();
  const openModal = useUIStore((s) => s.openModal);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleClick = () => {
    router.push(`/documents/${folder.id}`);
  };

  const handleMenuAction = (action: () => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      setSheetOpen(false);
      action();
    };
  };

  const docCount = folder._count.documents;
  const childCount = folder._count.children;
  const totalItems = docCount + childCount;

  const mobileSheet = (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent side="bottom" className="bg-zinc-900 border-zinc-800 px-0 pb-8">
        <SheetHeader className="px-4 pb-2">
          <SheetTitle className="text-white text-sm truncate text-left">
            {folder.name}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col">
          <button
            onClick={handleMenuAction(() =>
              openModal({
                type: 'rename-folder',
                folderId: folder.id,
                currentName: folder.name,
              })
            )}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 active:bg-zinc-800 transition-colors"
          >
            <Edit2 className="h-5 w-5 text-zinc-400" />
            Rename
          </button>
          <button
            onClick={handleMenuAction(() =>
              openModal({ type: 'move-folder', folderId: folder.id })
            )}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 active:bg-zinc-800 transition-colors"
          >
            <Move className="h-5 w-5 text-zinc-400" />
            Move
          </button>
          <button
            onClick={handleMenuAction(() =>
              openModal({
                type: 'delete-folder',
                folderId: folder.id,
                folderName: folder.name,
              })
            )}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 active:bg-zinc-800 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            Delete
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );

  const desktopDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-zinc-900 border-zinc-800"
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openModal({
              type: 'rename-folder',
              folderId: folder.id,
              currentName: folder.name,
            });
          }}
          className="text-zinc-300 focus:text-white focus:bg-zinc-800"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openModal({ type: 'move-folder', folderId: folder.id });
          }}
          className="text-zinc-300 focus:text-white focus:bg-zinc-800"
        >
          <Move className="h-4 w-4 mr-2" />
          Move
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openModal({
              type: 'delete-folder',
              folderId: folder.id,
              folderName: folder.name,
            });
          }}
          className="text-red-400 focus:text-red-300 focus:bg-zinc-800"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 hover:border-zinc-700 transition-colors cursor-pointer"
    >
      <div className="h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
        <Folder className="h-5 w-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{folder.name}</p>
        <p className="text-xs text-zinc-500">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>
      {totalItems > 0 && (
        <Badge
          variant="secondary"
          className="bg-zinc-800 text-zinc-400 border-0 text-xs"
        >
          {totalItems}
        </Badge>
      )}
      {isMobile ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setSheetOpen(true);
          }}
          className="h-8 w-8 text-zinc-500 hover:text-white"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      ) : (
        desktopDropdown
      )}
      {isMobile && mobileSheet}
    </div>
  );
}
