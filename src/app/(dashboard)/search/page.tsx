'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchDocuments } from '@/hooks/use-documents';
import { DocumentGrid } from '@/components/documents/document-grid';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: documents, isLoading } = useSearchDocuments(debouncedQuery);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Search</h1>

      {/* Search input */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by document name..."
          className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
        />
      </div>

      {/* Results */}
      {debouncedQuery.length < 2 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16">
          <Search className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-medium text-white mb-1">
            Search your documents
          </h3>
          <p className="text-sm text-zinc-400 text-center max-w-sm">
            Type at least 2 characters to start searching.
          </p>
        </div>
      ) : (
        <DocumentGrid
          documents={documents}
          isLoading={isLoading}
          emptyMessage="No results found"
          emptyDescription={`No documents matching "${debouncedQuery}". Try a different search term.`}
        />
      )}
    </div>
  );
}
