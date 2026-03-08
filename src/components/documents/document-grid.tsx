'use client';

import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/stores/ui-store';
import { DocumentCard } from '@/components/documents/document-card';
import type { DocumentData } from '@/types/api';

interface DocumentGridProps {
  documents?: DocumentData[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
        >
          <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800 mb-3" />
          <Skeleton className="h-4 w-3/4 bg-zinc-800 mb-2" />
          <Skeleton className="h-3 w-1/2 bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 divide-y divide-zinc-800">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-5 w-5 rounded bg-zinc-800" />
          <Skeleton className="h-4 flex-1 bg-zinc-800" />
          <Skeleton className="h-3 w-16 bg-zinc-800 hidden sm:block" />
          <Skeleton className="h-3 w-24 bg-zinc-800 hidden md:block" />
        </div>
      ))}
    </div>
  );
}

export function DocumentGrid({
  documents,
  isLoading,
  emptyMessage = 'No documents yet',
  emptyDescription = 'Upload your first document to get started.',
}: DocumentGridProps) {
  const viewMode = useUIStore((s) => s.viewMode);

  if (isLoading) {
    return viewMode === 'grid' ? <GridSkeleton /> : <ListSkeleton />;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16">
        <FileText className="h-10 w-10 text-zinc-600 mb-3" />
        <h3 className="text-base font-medium text-white mb-1">
          {emptyMessage}
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-sm">
          {emptyDescription}
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="rounded-xl border border-zinc-800 divide-y divide-zinc-800">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
