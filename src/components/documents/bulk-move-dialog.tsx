'use client';

import { useState } from 'react';
import { ChevronRight, Folder, Loader2, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRootFolders, useFolderContents } from '@/hooks/use-folders';
import { useBulkMoveDocuments } from '@/hooks/use-documents';
import { useUIStore } from '@/stores/ui-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BulkMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentIds: string[];
}

export function BulkMoveDialog({
  open,
  onOpenChange,
  documentIds,
}: BulkMoveDialogProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: 'Root' }]);

  const exitSelectionMode = useUIStore((s) => s.exitSelectionMode);
  const { data: rootFolders, isLoading: rootLoading } = useRootFolders();
  const { data: folderContents, isLoading: contentsLoading } =
    useFolderContents(currentFolderId ?? '');

  const bulkMove = useBulkMoveDocuments();

  const isLoading = currentFolderId ? contentsLoading : rootLoading;

  const folders =
    currentFolderId && folderContents
      ? folderContents.subfolders
      : (rootFolders ?? []);

  const navigateInto = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateTo = (index: number) => {
    const target = breadcrumbs[index];
    setCurrentFolderId(target.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleMove = async () => {
    try {
      await bulkMove.mutateAsync({
        documentIds,
        targetFolderId: currentFolderId,
      });
      toast.success(`Moved ${documentIds.length} works`);
      exitSelectionMode();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Move failed';
      toast.error(message);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setCurrentFolderId(null);
      setBreadcrumbs([{ id: null, name: 'Root' }]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Move {documentIds.length} {documentIds.length === 1 ? 'work' : 'works'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a destination project.
          </DialogDescription>
        </DialogHeader>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-sm overflow-x-auto pb-1">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.id ?? 'root'} className="flex items-center gap-1 shrink-0">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 text-zinc-600" />
              )}
              <button
                onClick={() => navigateTo(i)}
                className={cn(
                  'px-1.5 py-0.5 rounded text-xs transition-colors',
                  i === breadcrumbs.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {crumb.id === null ? (
                  <span className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Root
                  </span>
                ) : (
                  crumb.name
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Folder list */}
        <div className="border border-border rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
          ) : folders.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              No subprojects here
            </div>
          ) : (
            <div className="divide-y divide-border">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => navigateInto(folder.id, folder.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-card transition-colors text-left"
                >
                  <Folder className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">
                    {folder.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="border-border text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={bulkMove.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {bulkMove.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
