'use client';

import { useRecentDocuments } from '@/hooks/use-documents';
import { DocumentGrid } from '@/components/documents/document-grid';

export default function RecentPage() {
  const { data: documents, isLoading } = useRecentDocuments();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Recent</h1>

      <DocumentGrid
        documents={documents}
        isLoading={isLoading}
        emptyMessage="No recent activity"
        emptyDescription="Your recently viewed and edited documents will appear here."
      />
    </div>
  );
}
