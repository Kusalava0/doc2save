'use client';

import { Loader2 } from 'lucide-react';
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
import { useDeleteFolder } from '@/hooks/use-folders';
import { toast } from 'sonner';
import type { FolderData } from '@/types/api';

interface DeleteFolderDialogProps {
  folder: FolderData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteFolderDialog({
  folder,
  open,
  onOpenChange,
}: DeleteFolderDialogProps) {
  const deleteFolder = useDeleteFolder();

  const handleDelete = async () => {
    try {
      await deleteFolder.mutateAsync(folder.id);
      toast.success('Folder deleted');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete folder');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-950 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Delete Folder
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-zinc-300">{folder.name}</span>?
            This will permanently delete all documents inside this folder.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteFolder.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteFolder.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
