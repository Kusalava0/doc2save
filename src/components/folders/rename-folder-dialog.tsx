'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRenameFolder } from '@/hooks/use-folders';
import { toast } from 'sonner';
import type { FolderData } from '@/types/api';

interface RenameFolderDialogProps {
  folder: FolderData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameFolderDialog({
  folder,
  open,
  onOpenChange,
}: RenameFolderDialogProps) {
  const [name, setName] = useState(folder.name);
  const renameFolder = useRenameFolder();

  useEffect(() => {
    if (open) setName(folder.name);
  }, [open, folder.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === folder.name) return;

    try {
      await renameFolder.mutateAsync({ folderId: folder.id, name: trimmed });
      toast.success('Folder renamed');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename folder');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Rename Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            autoFocus
            className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !name.trim() ||
                name.trim() === folder.name ||
                renameFolder.isPending
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {renameFolder.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
