'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, MoreVertical, Trash2, Move, Edit2, CheckSquare } from 'lucide-react';
import { useLongPress } from '@/hooks/use-long-press';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useUIStore } from '@/stores/ui-store';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import type { FolderData } from '@/types/api';

interface FolderCardProps {
  folder: FolderData;
}

export function FolderCard({ folder }: FolderCardProps) {
  const router = useRouter();
  const openModal = useUIStore((s) => s.openModal);
  const selectionMode = useUIStore((s) => s.selectionMode);
  const selectionType = useUIStore((s) => s.selectionType);
  const selectedFolderIds = useUIStore((s) => s.selectedFolderIds);
  const toggleFolderSelection = useUIStore((s) => s.toggleFolderSelection);
  const enterSelectionMode = useUIStore((s) => s.enterSelectionMode);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const isFolderSelectionMode = selectionMode && selectionType === 'folders';
  const isSelected = selectedFolderIds.has(folder.id);

  const onLongPress = useCallback(() => {
    if (!selectionMode) {
      enterSelectionMode('folders', folder.id);
    }
  }, [selectionMode, enterSelectionMode, folder.id]);

  const { handlers: longPressHandlers, isLongPress } = useLongPress({ onLongPress });

  const handleClick = () => {
    if (isLongPress.current) return;
    if (isFolderSelectionMode) {
      toggleFolderSelection(folder.id);
      return;
    }
    router.push(`/documents/${folder.id}`);
  };

  const handleMenuAction = (action: () => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      setPopoverOpen(false);
      action();
    };
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    enterSelectionMode('folders', folder.id);
  };

  const docCount = folder._count.documents;
  const childCount = folder._count.children;
  const totalItems = docCount + childCount;

  const menuItemClass =
    'flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-md transition-colors';

  const mobilePopoverMenu = (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-48 p-1.5 bg-card border-border"
      >
        <button
          onClick={handleMenuAction(() =>
            openModal({
              type: 'rename-folder',
              folderId: folder.id,
              currentName: folder.name,
            })
          )}
          className={cn(menuItemClass, 'text-foreground/80 hover:bg-accent')}
        >
          <Edit2 className="h-4 w-4 text-muted-foreground" />
          Rename
        </button>
        <button
          onClick={handleMenuAction(() =>
            openModal({ type: 'move-folder', folderId: folder.id })
          )}
          className={cn(menuItemClass, 'text-foreground/80 hover:bg-accent')}
        >
          <Move className="h-4 w-4 text-muted-foreground" />
          Move
        </button>
        <button
          onClick={handleSelect}
          className={cn(menuItemClass, 'text-foreground/80 hover:bg-accent')}
        >
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          Select
        </button>
        <div className="my-1 h-px bg-border" />
        <button
          onClick={handleMenuAction(() =>
            openModal({
              type: 'delete-folder',
              folderId: folder.id,
              folderName: folder.name,
            })
          )}
          className={cn(menuItemClass, 'text-red-500 hover:bg-accent')}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );

  const desktopDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card border-border"
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
          className="text-foreground/80 focus:text-foreground focus:bg-accent"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openModal({ type: 'move-folder', folderId: folder.id });
          }}
          className="text-foreground/80 focus:text-foreground focus:bg-accent"
        >
          <Move className="h-4 w-4 mr-2" />
          Move
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            enterSelectionMode('folders', folder.id);
          }}
          className="text-foreground/80 focus:text-foreground focus:bg-accent"
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Select
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
          className="text-red-400 focus:text-red-300 focus:bg-accent"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const selectionCheckbox = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        toggleFolderSelection(folder.id);
      }}
      className="flex items-center justify-center"
    >
      <Checkbox
        checked={isSelected}
        className="h-5 w-5 border-2 border-muted-foreground data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />
    </div>
  );

  return (
    <div
      onClick={handleClick}
      {...longPressHandlers}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-border transition-colors cursor-pointer select-none',
        isFolderSelectionMode && isSelected && 'border-blue-500 bg-blue-600/10'
      )}
    >
      {isFolderSelectionMode && selectionCheckbox}
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Folder className="h-5 w-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{folder.name}</p>
        <p className="text-xs text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>
      {!isFolderSelectionMode && totalItems > 0 && (
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground border-0 text-xs"
        >
          {totalItems}
        </Badge>
      )}
      {!isFolderSelectionMode && (isMobile ? mobilePopoverMenu : desktopDropdown)}
    </div>
  );
}
