'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Upload, FolderPlus, Grid3X3, List, Folder, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/stores/ui-store';
import { useFolderContents } from '@/hooks/use-folders';
import { DocumentGrid } from '@/components/documents/document-grid';
import { FolderCard } from '@/components/folders/folder-card';
import { BulkFolderActionBar } from '@/components/folders/bulk-folder-action-bar';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { UploadDialog } from '@/components/documents/upload-dialog';
import { CreateFolderDialog } from '@/components/folders/create-folder-dialog';
import { cn } from '@/lib/utils';

export default function FolderPage() {
  const params = useParams();
  const folderId = params.folderId as string;
  const { viewMode, setViewMode, selectionMode, selectionType, enterSelectionMode, exitSelectionMode } = useUIStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const { data, isLoading, isError } = useFolderContents(folderId);

  const isFolderSelection = selectionMode && selectionType === 'folders';
  const isDocSelection = selectionMode && selectionType === 'documents';

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-5 w-48 bg-muted" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40 bg-muted" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 bg-muted rounded-lg" />
            <Skeleton className="h-9 w-24 bg-muted rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <h3 className="text-lg font-medium text-foreground mb-1">
            Project not found
          </h3>
          <p className="text-sm text-muted-foreground">
            This project may have been deleted or moved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Breadcrumbs */}
      {!selectionMode && <Breadcrumbs items={data.breadcrumbs} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{data.folder.name}</h1>
        <div className="flex items-center gap-2">
          {!selectionMode && (
            <>
              {data.subfolders.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => enterSelectionMode('folders')}
                  className="h-9 w-9 border-border text-foreground/80 hover:bg-accent hover:text-foreground"
                  title="Select Projects"
                >
                  <Folder className="h-4 w-4" />
                </Button>
              )}
              {data.documents && data.documents.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => enterSelectionMode('documents')}
                  className="h-9 w-9 border-border text-foreground/80 hover:bg-accent hover:text-foreground"
                  title="Select Works"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          {selectionMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={exitSelectionMode}
              className="border-border text-foreground/80 hover:bg-accent hover:text-foreground"
            >
              Cancel
            </Button>
          )}

          {!selectionMode && (
            <>
              <div className="hidden sm:flex items-center rounded-lg border border-border p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground/80'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    viewMode === 'list'
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground/80'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => setCreateFolderOpen(true)}
                className="border-border bg-card text-foreground/80 hover:bg-accent hover:text-foreground"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Project</span>
              </Button>

              <Button
                onClick={() => setUploadOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Subfolders */}
      {!isDocSelection && data.subfolders.length > 0 && (
        <div className="space-y-3">
          {!selectionMode && (
            <h2 className="text-sm font-medium text-muted-foreground">Projects</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.subfolders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
          <BulkFolderActionBar allFolderIds={data.subfolders.map((f) => f.id)} />
        </div>
      )}

      {/* Documents */}
      {!isFolderSelection && (
        <div className="space-y-3">
          {!selectionMode && data.subfolders.length > 0 && (
            <h2 className="text-sm font-medium text-muted-foreground">Works</h2>
          )}
          <DocumentGrid
            documents={data.documents}
            emptyMessage="No works in this project"
            emptyDescription="Upload works or move files into this project."
          />
        </div>
      )}

      {/* Dialogs */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderId={folderId}
      />
      <CreateFolderDialog
        parentId={folderId}
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
    </div>
  );
}
