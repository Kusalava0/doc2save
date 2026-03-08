'use client';

import { useState } from 'react';
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
import { useCreateFolder } from '@/hooks/use-folders';
import { toast } from 'sonner';

interface CreateFolderDialogProps {
  parentId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFolderDialog({
  parentId,
  open,
  onOpenChange,
}: CreateFolderDialogProps) {
  const [name, setName] = useState('');
  const createFolder = useCreateFolder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      await createFolder.mutateAsync({ name: trimmed, parentId: parentId ?? null });
      toast.success('Folder created');
      setName('');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create folder');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setName('');
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            autoFocus
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createFolder.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createFolder.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
