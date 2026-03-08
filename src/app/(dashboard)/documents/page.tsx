'use client';

import { useState } from 'react';
import { Upload, FolderPlus, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/stores/ui-store';
import { useDocuments } from '@/hooks/use-documents';
import { useRootFolders } from '@/hooks/use-folders';
import { DocumentGrid } from '@/components/documents/document-grid';
import { FolderCard } from '@/components/folders/folder-card';
import { UploadDialog } from '@/components/documents/upload-dialog';
import { CreateFolderDialog } from '@/components/folders/create-folder-dialog';
import { cn } from '@/lib/utils';

export default function DocumentsPage() {
  const { viewMode, setViewMode } = useUIStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const { data: folders, isLoading: foldersLoading } = useRootFolders();
  const { data: documents, isLoading: documentsLoading } = useDocuments(null);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Documents</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex items-center rounded-lg border border-zinc-800 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => setCreateFolderOpen(true)}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Folder</span>
          </Button>

          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Folders */}
      {foldersLoading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-zinc-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-zinc-900" />
            ))}
          </div>
        </div>
      )}

      {!foldersLoading && folders && folders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400">Folders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="space-y-3">
        {(!foldersLoading && folders && folders.length > 0) && (
          <h2 className="text-sm font-medium text-zinc-400">Documents</h2>
        )}
        <DocumentGrid
          documents={documents}
          isLoading={documentsLoading}
          emptyMessage="No documents yet"
          emptyDescription="Upload your first document to get started. We support PDF, images, and common document formats."
        />
      </div>

      {/* Dialogs */}
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
    </div>
  );
}
