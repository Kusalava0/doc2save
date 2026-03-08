'use client';

import { Star } from 'lucide-react';
import { useFavoriteDocuments } from '@/hooks/use-documents';
import { DocumentGrid } from '@/components/documents/document-grid';

export default function FavoritesPage() {
  const { data: documents, isLoading } = useFavoriteDocuments();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Favorites</h1>

      <DocumentGrid
        documents={documents}
        isLoading={isLoading}
        emptyMessage="No favorites yet"
        emptyDescription="Star documents to see them here."
      />
    </div>
  );
}
