'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, FolderOpen, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGlobalSearch } from '@/hooks/use-documents';
import { FileIcon } from '@/components/shared/file-icon';
import { formatFileSize } from '@/lib/format';

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({ onClose, autoFocus }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useGlobalSearch(debouncedQuery);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  const navigateTo = useCallback(
    (path: string) => {
      router.push(path);
      setIsOpen(false);
      setQuery('');
      onClose?.();
    },
    [router, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && query.length >= 2) {
        navigateTo(`/search?q=${encodeURIComponent(query)}`);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
        onClose?.();
      }
    },
    [query, navigateTo, onClose]
  );

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const folders = data?.folders ?? [];
  const documents = data?.documents ?? [];
  const hasResults = folders.length > 0 || documents.length > 0;
  const showDropdown = isOpen && debouncedQuery.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search works & projects..."
          className="pl-9 pr-8 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-9"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </div>
          )}

          {!isLoading && hasResults && (
            <>
              {/* Folders section */}
              {folders.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Projects
                  </div>
                  {folders.slice(0, 5).map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => navigateTo(`/documents/${folder.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                    >
                      <FolderOpen className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {folder._count.documents} works, {folder._count.children} subprojects
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Documents section */}
              {documents.length > 0 && (
                <div>
                  {folders.length > 0 && (
                    <div className="border-t border-border" />
                  )}
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Works
                  </div>
                  {documents.slice(0, 8).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => navigateTo(`/preview/${doc.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                    >
                      <FileIcon mimeType={doc.mimeType} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* View all results */}
              <div className="border-t border-border">
                <button
                  onClick={() => navigateTo(`/search?q=${encodeURIComponent(query)}`)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-blue-500 hover:bg-accent transition-colors"
                >
                  View all results
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
