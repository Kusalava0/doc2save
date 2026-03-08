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
import { useDeleteDocument } from '@/hooks/use-documents';
import { toast } from 'sonner';
import type { DocumentData } from '@/types/api';

interface DeleteDialogProps {
  document: DocumentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDocumentDialog({
  document: doc,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const deleteDoc = useDeleteDocument();

  const handleDelete = async () => {
    try {
      await deleteDoc.mutateAsync(doc.id);
      toast.success('Document deleted');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-950 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Delete Document
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-zinc-300">{doc.name}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteDoc.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteDoc.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
