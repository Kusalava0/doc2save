'use client';

import { useState } from 'react';
import {
  X,
  Trash2,
  Download,
  Move,
  Loader2,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUIStore } from '@/stores/ui-store';
import { useBulkDeleteDocuments } from '@/hooks/use-documents';
import { toast } from 'sonner';

interface BulkActionBarProps {
  allDocumentIds?: string[];
}

export function BulkActionBar({ allDocumentIds = [] }: BulkActionBarProps) {
  const selectionMode = useUIStore((s) => s.selectionMode);
  const selectedDocumentIds = useUIStore((s) => s.selectedDocumentIds);
  const exitSelectionMode = useUIStore((s) => s.exitSelectionMode);
  const selectAllDocuments = useUIStore((s) => s.selectAllDocuments);
  const openModal = useUIStore((s) => s.openModal);
  const bulkDelete = useBulkDeleteDocuments();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const count = selectedDocumentIds.size;
  const allSelected = allDocumentIds.length > 0 && count === allDocumentIds.length;

  if (!selectionMode || count === 0) return null;

  const handleSelectAll = () => {
    if (allSelected) {
      exitSelectionMode();
    } else {
      selectAllDocuments(allDocumentIds);
    }
  };

  const handleBulkDownload = async () => {
    const ids = Array.from(selectedDocumentIds);
    toast.info(`Downloading ${ids.length} works...`);
    for (const id of ids) {
      try {
        const res = await fetch(`/api/documents/${id}/download`);
        if (!res.ok) continue;
        const { downloadUrl } = await res.json();
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Small delay between downloads to not overwhelm browser
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        // skip failed downloads
      }
    }
    exitSelectionMode();
  };

  const handleBulkMove = () => {
    openModal({
      type: 'bulk-move-documents',
      documentIds: Array.from(selectedDocumentIds),
    });
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(Array.from(selectedDocumentIds));
      toast.success(`Deleted ${count} works`);
      exitSelectionMode();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete works');
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      {/* Bulk action bar — fixed above mobile nav (bottom-14) on mobile, bottom-0 on desktop */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3">
          {/* Left: count + select all */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={exitSelectionMode}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">
              {count} selected
            </span>
            {allDocumentIds.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs text-blue-500 hover:text-blue-400 hover:bg-accent h-7 px-2"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1" />
                {allSelected ? 'Deselect all' : 'Select all'}
              </Button>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBulkDownload}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBulkMove}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Move"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={bulkDelete.isPending}
              className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-accent"
              title="Delete"
            >
              {bulkDelete.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete {count} {count === 1 ? 'work' : 'works'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the selected {count === 1 ? 'work' : 'works'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card border-border text-foreground/80 hover:bg-accent hover:text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {bulkDelete.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete {count} {count === 1 ? 'work' : 'works'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
