'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  MoreVertical,
  Download,
  Trash2,
  Move,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useToggleFavorite } from '@/hooks/use-documents';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FileIcon } from '@/components/shared/file-icon';
import { formatFileSize, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DocumentData } from '@/types/api';

interface DocumentCardProps {
  document: DocumentData;
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const router = useRouter();
  const viewMode = useUIStore((s) => s.viewMode);
  const openModal = useUIStore((s) => s.openModal);
  const toggleFavorite = useToggleFavorite();
  const [isStarring, setIsStarring] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleClick = () => {
    router.push(`/preview/${doc.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStarring) return;
    setIsStarring(true);
    try {
      await toggleFavorite.mutateAsync({
        documentId: doc.id,
        isFavorite: !doc.isFavorite,
      });
    } finally {
      setIsStarring(false);
    }
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSheetOpen(false);
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`);
      if (!res.ok) return;
      const { downloadUrl } = await res.json();
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // silently fail
    }
  };

  const handleMenuAction = (action: () => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      setSheetOpen(false);
      action();
    };
  };

  const openMenuOrSheet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      setSheetOpen(true);
    }
  };

  const menuItems = (
    <>
      <button
        onClick={handleMenuAction(handleClick)}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground/80 hover:bg-accent active:bg-accent transition-colors"
      >
        <Eye className="h-5 w-5 text-muted-foreground" />
        Preview
      </button>
      <button
        onClick={handleMenuAction(() => handleDownload())}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground/80 hover:bg-accent active:bg-accent transition-colors"
      >
        <Download className="h-5 w-5 text-muted-foreground" />
        Download
      </button>
      <button
        onClick={handleMenuAction(() =>
          openModal({ type: 'move-document', documentId: doc.id })
        )}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground/80 hover:bg-accent active:bg-accent transition-colors"
      >
        <Move className="h-5 w-5 text-muted-foreground" />
        Move
      </button>
      <button
        onClick={handleMenuAction(() =>
          openModal({
            type: 'delete-document',
            documentId: doc.id,
            documentName: doc.name,
          })
        )}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-accent active:bg-accent transition-colors"
      >
        <Trash2 className="h-5 w-5" />
        Delete
      </button>
    </>
  );

  const mobileSheet = (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent side="bottom" className="bg-card border-border px-0 pb-8">
        <SheetHeader className="px-4 pb-2">
          <SheetTitle className="text-foreground text-sm truncate text-left">
            {doc.name}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col">{menuItems}</div>
      </SheetContent>
    </Sheet>
  );

  const desktopDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 text-muted-foreground hover:text-foreground transition-opacity',
            viewMode === 'list' ? 'h-8 w-8 opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
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
            handleClick();
          }}
          className="text-foreground/80 focus:text-foreground focus:bg-accent"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDownload}
          className="text-foreground/80 focus:text-foreground focus:bg-accent"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openModal({ type: 'move-document', documentId: doc.id });
          }}
          className="text-foreground/80 focus:text-foreground focus:bg-accent"
        >
          <Move className="h-4 w-4 mr-2" />
          Move
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openModal({
              type: 'delete-document',
              documentId: doc.id,
              documentName: doc.name,
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

  const moreButton = (
    <Button
      variant="ghost"
      size="icon"
      onClick={openMenuOrSheet}
      className={cn(
        'h-7 w-7 text-muted-foreground hover:text-foreground transition-opacity',
        isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        viewMode === 'list' && 'h-8 w-8'
      )}
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  );

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-3 px-4 py-3 hover:bg-card/50 transition-colors cursor-pointer group"
      >
        <FileIcon mimeType={doc.mimeType} />
        <span className="flex-1 text-sm text-foreground truncate min-w-0">
          {doc.name}
        </span>
        <span className="hidden sm:block text-xs text-muted-foreground w-20 text-right">
          {formatFileSize(doc.size)}
        </span>
        <span className="hidden md:block text-xs text-muted-foreground w-28 text-right">
          {formatDate(doc.uploadedAt)}
        </span>
        <button
          onClick={handleToggleFavorite}
          className="p-1 rounded hover:bg-accent transition-colors"
        >
          <Star
            className={cn(
              'h-4 w-4 transition-colors',
              doc.isFavorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-zinc-600 hover:text-muted-foreground'
            )}
          />
        </button>
        {isMobile ? moreButton : desktopDropdown}
        {isMobile && mobileSheet}
      </div>
    );
  }

  // Grid mode
  return (
    <div
      onClick={handleClick}
      className="group relative rounded-xl border border-border bg-card p-4 hover:border-border transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileIcon mimeType={doc.mimeType} className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleFavorite}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <Star
              className={cn(
                'h-4 w-4 transition-colors',
                doc.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-zinc-600 hover:text-muted-foreground'
              )}
            />
          </button>
          {isMobile ? moreButton : desktopDropdown}
        </div>
      </div>

      <p className="text-sm font-medium text-foreground truncate mb-1">
        {doc.name}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatFileSize(doc.size)}</span>
        <span className="text-zinc-700">&middot;</span>
        <span>{formatDate(doc.uploadedAt)}</span>
      </div>

      {isMobile && mobileSheet}
    </div>
  );
}
