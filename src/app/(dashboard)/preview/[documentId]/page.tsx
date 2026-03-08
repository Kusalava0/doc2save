'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  ArrowLeft,
  Download,
  Star,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/lib/query-keys';
import { useToggleFavorite } from '@/hooks/use-documents';
import { cn } from '@/lib/utils';
import type { DocumentData } from '@/types/api';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ZoomLevel = 'fit' | number;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

export default function PreviewPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();
  const documentId = params.documentId;

  const [zoom, setZoom] = useState<ZoomLevel>('fit');
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const toggleFavorite = useToggleFavorite();

  // Fetch document metadata
  const {
    data: document,
    isLoading: docLoading,
    error: docError,
  } = useQuery({
    queryKey: queryKeys.documents.detail(documentId),
    queryFn: () =>
      fetchJson<{ document: DocumentData }>(
        `/api/documents/${documentId}`
      ).then((res) => res.document),
  });

  // Fetch presigned preview URL
  const {
    data: previewUrl,
    isLoading: previewLoading,
    error: previewError,
  } = useQuery({
    queryKey: [...queryKeys.documents.detail(documentId), 'preview'],
    queryFn: () =>
      fetchJson<{ previewUrl: string }>(
        `/api/documents/${documentId}/preview`
      ).then((res) => res.previewUrl),
    enabled: !!document,
  });

  const handleDownload = useCallback(async () => {
    try {
      const { downloadUrl } = await fetchJson<{ downloadUrl: string }>(
        `/api/documents/${documentId}/download`
      );
      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = document?.name ?? 'download';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } catch {
      // Error handled silently
    }
  }, [documentId, document?.name]);

  const handleFavoriteToggle = useCallback(() => {
    if (!document) return;
    toggleFavorite.mutate({
      documentId: document.id,
      isFavorite: !document.isFavorite,
    });
  }, [document, toggleFavorite]);

  const handleZoomIn = () => {
    setZoom((prev) => {
      const current = prev === 'fit' ? 100 : prev;
      return Math.min(current + 25, 300);
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const current = prev === 'fit' ? 100 : prev;
      return Math.max(current - 25, 25);
    });
  };

  const handleFitToScreen = () => setZoom('fit');

  const getZoomPercent = (): number => {
    if (zoom === 'fit') return 100;
    return zoom;
  };

  const handlePdfLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPdfError(null);
  };

  const handlePdfLoadError = () => {
    setPdfError('Failed to load PDF. Try downloading instead.');
  };

  const isImage = document?.mimeType.startsWith('image/');
  const isPdf = document?.mimeType === 'application/pdf';
  const isDocx =
    document?.mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const isLoading = docLoading || previewLoading;
  const error = docError || previewError;

  // Error state
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-white">Document not found</h2>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          {error instanceof Error ? error.message : 'Failed to load document'}
        </p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {isLoading ? (
          <Skeleton className="h-5 w-48 bg-zinc-800" />
        ) : (
          <h1 className="text-sm md:text-base font-medium text-white truncate flex-1 min-w-0">
            {document?.name}
          </h1>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteToggle}
            disabled={!document || toggleFavorite.isPending}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Star
              className={cn(
                'h-5 w-5',
                document?.isFavorite && 'fill-yellow-500 text-yellow-500'
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={!document}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Zoom controls for images and PDFs */}
      {(isImage || isPdf) && !isLoading && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-950 shrink-0">
          {isPdf && numPages > 0 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-zinc-400 min-w-[4rem] text-center">
                {currentPage} / {numPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="w-px h-5 bg-zinc-700 mx-1" />
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFitToScreen}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
          >
            <Maximize className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-zinc-400 w-12 text-center">
            {zoom === 'fit' ? 'Fit' : `${getZoomPercent()}%`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-black">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
          </div>
        ) : isPdf && previewUrl ? (
          pdfError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
              <FileText className="h-16 w-16 text-zinc-600" />
              <p className="text-sm text-zinc-400 text-center">{pdfError}</p>
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 px-2">
              <Document
                file={`/api/documents/${documentId}/preview/proxy`}
                onLoadSuccess={handlePdfLoadSuccess}
                onLoadError={handlePdfLoadError}
                loading={
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
                  </div>
                }
                className="flex flex-col items-center gap-4"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={
                      zoom === 'fit'
                        ? Math.min(typeof window !== 'undefined' ? window.innerWidth - 32 : 400, 800)
                        : (getZoomPercent() / 100) * 800
                    }
                    className="shadow-lg rounded-sm overflow-hidden"
                    loading={
                      <div className="flex items-center justify-center h-[400px] w-full bg-zinc-900 rounded-sm">
                        <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
                      </div>
                    }
                  />
                ))}
              </Document>
            </div>
          )
        ) : isImage && previewUrl ? (
          <div className="flex items-center justify-center min-h-full p-4">
            <div
              className="max-w-4xl mx-auto"
              style={
                zoom === 'fit'
                  ? { maxWidth: '100%', maxHeight: '100%' }
                  : { width: `${getZoomPercent()}%` }
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={document?.name || 'Document preview'}
                className={cn(
                  'rounded-lg',
                  zoom === 'fit' ? 'max-w-full max-h-[calc(100vh-10rem)] object-contain mx-auto' : 'w-full'
                )}
              />
            </div>
          </div>
        ) : isDocx ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <FileText className="h-16 w-16 text-zinc-600" />
            <h2 className="text-lg font-medium text-white">DOCX Preview</h2>
            <p className="text-sm text-zinc-400 text-center max-w-sm">
              DOCX preview is not yet supported. Download the file to view it in
              your preferred application.
            </p>
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <FileText className="h-16 w-16 text-zinc-600" />
            <p className="text-sm text-zinc-400">Unable to preview this file</p>
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
