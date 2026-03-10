'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGlobalSearch } from '@/hooks/use-documents';
import { DocumentGrid } from '@/components/documents/document-grid';
import { FolderCard } from '@/components/folders/folder-card';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useGlobalSearch(debouncedQuery);
  const folders = data?.folders ?? [];
  const documents = data?.documents ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Search</h1>

      {/* Search input */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name..."
          className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      {/* Results */}
      {debouncedQuery.length < 2 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-medium text-foreground mb-1">
            Search your works & projects
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Type at least 2 characters to start searching.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders results */}
          {folders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground">
                  Projects ({folders.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {folders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </div>
          )}

          {/* Documents results */}
          <div className="space-y-3">
            {folders.length > 0 && documents.length > 0 && (
              <div className="border-t border-border pt-4" />
            )}
            <DocumentGrid
              documents={documents}
              isLoading={isLoading}
              emptyMessage="No results found"
              emptyDescription={`No works or projects matching "${debouncedQuery}".`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 md:p-6 space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Search</h1>
          <div className="h-9 bg-muted animate-pulse rounded-md max-w-lg" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
