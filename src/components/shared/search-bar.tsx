'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/ui-store';
import { useSearchDocuments } from '@/hooks/use-documents';
import { FileIcon } from '@/components/shared/file-icon';
import { formatFileSize } from '@/lib/format';

export function SearchBar() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useUIStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const { data: results, isLoading } = useSearchDocuments(searchQuery);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    setSearchQuery('');
    setIsOpen(false);
  }, [setSearchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search documents..."
          className="pl-9 pr-8 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
            </div>
          )}

          {!isLoading && results && results.length === 0 && (
            <div className="py-6 text-center text-sm text-zinc-500">
              No documents found
            </div>
          )}

          {!isLoading &&
            results &&
            results.length > 0 &&
            results.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  router.push(`/preview/${doc.id}`);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left"
              >
                <FileIcon mimeType={doc.mimeType} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{doc.name}</p>
                  <p className="text-xs text-zinc-500">
                    {formatFileSize(doc.size)}
                  </p>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
