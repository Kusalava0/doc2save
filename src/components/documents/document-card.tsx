'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  MoreVertical,
  Download,
  Trash2,
  Move,
  Eye,
  CheckSquare,
  MapPin,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useToggleFavorite } from '@/hooks/use-documents';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FileIcon } from '@/components/shared/file-icon';
import { formatDateShort } from '@/lib/format';
import { useLongPress } from '@/hooks/use-long-press';
import { cn } from '@/lib/utils';
import { ExpiryDatePicker } from '@/components/documents/expiry-date-picker';
import type { DocumentData } from '@/types/api';

interface DocumentCardProps {
  document: DocumentData;
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const router = useRouter();
  const viewMode = useUIStore((s) => s.viewMode);
  const openModal = useUIStore((s) => s.openModal);
  const selectionMode = useUIStore((s) => s.selectionMode);
  const selectedDocumentIds = useUIStore((s) => s.selectedDocumentIds);
  const toggleDocumentSelection = useUIStore((s) => s.toggleDocumentSelection);
  const enterSelectionMode = useUIStore((s) => s.enterSelectionMode);
  const toggleFavorite = useToggleFavorite();
  const [isStarring, setIsStarring] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const metadataLine = (() => {
    const m = doc.metadata;
    if (!m) return null;
    const parts: string[] = [];
    if (m.city || m.state) parts.push([m.city, m.state].filter(Boolean).join(', '));
    else if (m.formattedAddress) parts.push(m.formattedAddress.split(',').slice(0, 2).join(','));
    if (m.cameraMake || m.cameraModel) parts.push([m.cameraMake, m.cameraModel].filter(Boolean).join(' '));
    if (m.imageWidth && m.imageHeight) parts.push(`${m.imageWidth}×${m.imageHeight}`);
    return parts.length > 0 ? parts : null;
  })();

  const isExpiringSoon = doc.expiryDate
    ? (() => {
      const days = Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 7;
    })()
    : false;

  const isSelected = selectedDocumentIds.has(doc.id);

  const onLongPress = useCallback(() => {
    if (!selectionMode) {
      enterSelectionMode('documents', doc.id);
    }
  }, [selectionMode, enterSelectionMode, doc.id]);

  const { handlers: longPressHandlers, isLongPress } = useLongPress({ onLongPress });

  const handleClick = () => {
    if (isLongPress.current) return;
    if (selectionMode) {
      toggleDocumentSelection(doc.id);
      return;
    }
    router.push(`/preview/${doc.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectionMode || isStarring) return;
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
    setPopoverOpen(false);
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
      setPopoverOpen(false);
      action();
    };
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    enterSelectionMode('documents', doc.id);
  };

  const menuItemClass =
    'flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-md transition-colors';

  const mobilePopoverMenu = (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 text-muted-foreground hover:text-foreground',
            viewMode === 'list' && 'h-8 w-8'
          )}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side={viewMode === 'list' ? 'bottom' : 'left'}
        className="w-48 p-1.5 bg-card border-border"
      >
        <button
          onClick={handleMenuAction(handleClick)}
          className={cn(menuItemClass, 'text-foreground/80 hover:bg-accent')}
        >
          <Eye className="h-4 w-4 text-muted-foreground" />
          Preview
        </button>
        <button
          onClick={handleMenuAction(() => handleDownload())}
          className={cn(menuItemClass, 'text-foreground/80 hover:bg-accent')}
        >
          <Download className="h-4 w-4 text-muted-foreground" />
          Download
        </button>
        <button
          onClick={handleMenuAction(() =>
            openModal({ type: 'move-document', documentId: doc.id })
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
              type: 'delete-document',
              documentId: doc.id,
              documentName: doc.name,
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
            enterSelectionMode('documents', doc.id);
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

  const selectionCheckbox = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        toggleDocumentSelection(doc.id);
      }}
      className="flex items-center justify-center"
    >
      <Checkbox
        checked={isSelected}
        className="h-5 w-5 border-2 border-muted-foreground data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        {...longPressHandlers}
        className={cn(
          'flex items-center gap-3 px-4 py-3 hover:bg-card/50 transition-colors cursor-pointer group select-none',
          selectionMode && isSelected && 'bg-blue-600/10'
        )}
      >
        {selectionMode && selectionCheckbox}
        <FileIcon mimeType={doc.mimeType} />
        <span className="flex-1 text-sm text-foreground truncate min-w-0">
          {doc.name}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDateShort(doc.uploadedAt)}
        </span>
        {metadataLine && (doc.metadata?.city || doc.metadata?.state || doc.metadata?.formattedAddress) && (
          <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1 max-w-[120px]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{metadataLine[0]}</span>
          </span>
        )}
        {!selectionMode && (
          <ExpiryDatePicker
            documentId={doc.id}
            expiryDate={doc.expiryDate}
            isExpiringSoon={isExpiringSoon}
          />
        )}
        {!selectionMode && (
          <>
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
            {isMobile ? mobilePopoverMenu : desktopDropdown}
          </>
        )}
      </div>
    );
  }

  // Grid mode
  return (
    <div
      onClick={handleClick}
      {...longPressHandlers}
      className={cn(
        'group relative rounded-xl border border-border bg-card p-3 hover:border-border transition-colors cursor-pointer select-none',
        selectionMode && isSelected && 'border-blue-500 bg-blue-600/10'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        {selectionMode ? (
          <div className="flex items-center gap-2">
            {selectionCheckbox}
            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
              <FileIcon mimeType={doc.mimeType} className="h-4 w-4" />
            </div>
          </div>
        ) : (
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
            <FileIcon mimeType={doc.mimeType} className="h-4 w-4" />
          </div>
        )}
        {!selectionMode && (
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
            {isMobile ? mobilePopoverMenu : desktopDropdown}
          </div>
        )}
      </div>

      <p className="text-sm font-medium text-foreground truncate mb-1">
        {doc.name}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatDateShort(doc.uploadedAt)}</span>
        {!selectionMode && (
          <ExpiryDatePicker
            documentId={doc.id}
            expiryDate={doc.expiryDate}
            isExpiringSoon={isExpiringSoon}
          />
        )}
      </div>
      {metadataLine && (
        <div className="mt-1.5 space-y-0.5">
          {metadataLine.map((info, i) => (
            <div key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
              {i === 0 && (doc.metadata?.city || doc.metadata?.state || doc.metadata?.formattedAddress) && <MapPin className="h-3 w-3 shrink-0" />}
              {i === 1 && (doc.metadata?.cameraMake || doc.metadata?.cameraModel) && <Camera className="h-3 w-3 shrink-0" />}
              <span className="truncate">{info}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
