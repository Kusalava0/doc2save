'use client';

import { useUIStore } from '@/stores/ui-store';
import { MoveDialog } from './move-dialog';
import { UploadDialog } from '@/components/documents/upload-dialog';
import { DeleteDocumentDialog } from '@/components/documents/delete-dialog';
import { DeleteFolderDialog } from '@/components/folders/delete-folder-dialog';
import { RenameFolderDialog } from '@/components/folders/rename-folder-dialog';

export function ModalDispatcher() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  switch (activeModal.type) {
    case 'upload':
      return (
        <UploadDialog
          open
          onOpenChange={(open) => !open && closeModal()}
          folderId={activeModal.folderId}
        />
      );

    case 'move-document':
      return (
        <MoveDialog
          open
          onOpenChange={(open) => !open && closeModal()}
          itemType="document"
          itemId={activeModal.documentId}
        />
      );

    case 'move-folder':
      return (
        <MoveDialog
          open
          onOpenChange={(open) => !open && closeModal()}
          itemType="folder"
          itemId={activeModal.folderId}
        />
      );

    case 'delete-document':
      return (
        <DeleteDocumentDialog
          document={{
            id: activeModal.documentId,
            name: activeModal.documentName,
            mimeType: '',
            size: 0,
            folderId: null,
            isFavorite: false,
            uploadedAt: '',
          }}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      );

    case 'delete-folder':
      return (
        <DeleteFolderDialog
          folder={{
            id: activeModal.folderId,
            name: activeModal.folderName,
            parentId: null,
            createdAt: '',
            _count: { documents: 0, children: 0 },
          }}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      );

    case 'rename-folder':
      return (
        <RenameFolderDialog
          folder={{
            id: activeModal.folderId,
            name: activeModal.currentName,
            parentId: null,
            createdAt: '',
            _count: { documents: 0, children: 0 },
          }}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      );

    default:
      return null;
  }
}
