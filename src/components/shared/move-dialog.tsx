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
import { useMoveDocument } from '@/hooks/use-documents';
import { useMoveFolder } from '@/hooks/use-folders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: 'document' | 'folder';
  itemId: string;
}

export function MoveDialog({
  open,
  onOpenChange,
  itemType,
  itemId,
}: MoveDialogProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: 'Root' }]);

  const { data: rootFolders, isLoading: rootLoading } = useRootFolders();
  const { data: folderContents, isLoading: contentsLoading } =
    useFolderContents(currentFolderId ?? '');

  const moveDocument = useMoveDocument();
  const moveFolder = useMoveFolder();

  const isLoading = currentFolderId ? contentsLoading : rootLoading;
  const isPending = moveDocument.isPending || moveFolder.isPending;

  const folders =
    currentFolderId && folderContents
      ? folderContents.subfolders.filter((f) => f.id !== itemId)
      : (rootFolders ?? []).filter((f) => f.id !== itemId);

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
      if (itemType === 'document') {
        await moveDocument.mutateAsync({
          documentId: itemId,
          targetFolderId: currentFolderId,
        });
      } else {
        await moveFolder.mutateAsync({
          folderId: itemId,
          targetParentId: currentFolderId,
        });
      }
      toast.success(
        `${itemType === 'document' ? 'Document' : 'Folder'} moved successfully`
      );
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Move failed';
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
      <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            Move {itemType === 'document' ? 'Document' : 'Folder'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select a destination folder.
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
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
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
        <div className="border border-zinc-800 rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
            </div>
          ) : folders.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-sm text-zinc-500">
              No subfolders here
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => navigateInto(folder.id, folder.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-900 transition-colors text-left"
                >
                  <Folder className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-sm text-white truncate flex-1">
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
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
