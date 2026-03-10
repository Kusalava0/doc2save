'use client';

import { useState } from 'react';
import {
  X,
  Trash2,
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
import { useBulkDeleteFolders } from '@/hooks/use-folders';
import { toast } from 'sonner';

interface BulkFolderActionBarProps {
  allFolderIds?: string[];
}

export function BulkFolderActionBar({ allFolderIds = [] }: BulkFolderActionBarProps) {
  const selectionMode = useUIStore((s) => s.selectionMode);
  const selectionType = useUIStore((s) => s.selectionType);
  const selectedFolderIds = useUIStore((s) => s.selectedFolderIds);
  const exitSelectionMode = useUIStore((s) => s.exitSelectionMode);
  const selectAllFolders = useUIStore((s) => s.selectAllFolders);
  const openModal = useUIStore((s) => s.openModal);
  const bulkDelete = useBulkDeleteFolders();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const count = selectedFolderIds.size;
  const allSelected = allFolderIds.length > 0 && count === allFolderIds.length;

  if (!selectionMode || selectionType !== 'folders' || count === 0) return null;

  const handleSelectAll = () => {
    if (allSelected) {
      exitSelectionMode();
    } else {
      selectAllFolders(allFolderIds);
    }
  };

  const handleBulkMove = () => {
    openModal({
      type: 'bulk-move-folders',
      folderIds: Array.from(selectedFolderIds),
    });
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(Array.from(selectedFolderIds));
      toast.success(`Deleted ${count} projects`);
      exitSelectionMode();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete projects');
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3">
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
            {allFolderIds.length > 1 && (
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

          <div className="flex items-center gap-1">
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete {count} {count === 1 ? 'project' : 'projects'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the selected {count === 1 ? 'project' : 'projects'} and
              all works inside them. This action cannot be undone.
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
              Delete {count} {count === 1 ? 'project' : 'projects'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
