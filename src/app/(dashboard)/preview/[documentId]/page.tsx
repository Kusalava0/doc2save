'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Download,
  Star,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/lib/query-keys';
import { useToggleFavorite } from '@/hooks/use-documents';
import { cn } from '@/lib/utils';
import type { DocumentData } from '@/types/api';

const PdfViewer = dynamic(
  () => import('@/components/preview/pdf-viewer').then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    ),
  },
);

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

function usePinchZoom(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  const baseScale = useRef(1);
  const startDistance = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function getDistance(t1: Touch, t2: Touch) {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        startDistance.current = getDistance(e.touches[0], e.touches[1]);
        baseScale.current = scale;
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const newScale = Math.min(
          Math.max(baseScale.current * (dist / startDistance.current), 0.5),
          4
        );
        setScale(newScale);
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [containerRef, scale]);

  const resetScale = useCallback(() => setScale(1), []);

  return { scale, resetScale };
}

export default function PreviewPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();
  const documentId = params.documentId;

  const [pageWidth, setPageWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, resetScale } = usePinchZoom(containerRef);

  const toggleFavorite = useToggleFavorite();

  // Calculate page width based on container
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth - 16;
        setPageWidth(Math.min(w, 900));
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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

  const isImage = document?.mimeType.startsWith('image/');
  const isPdf = document?.mimeType === 'application/pdf';
  const isDocx =
    document?.mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const isLoading = docLoading || previewLoading;
  const error = docError || previewError;

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
          {scale !== 1 && (
            <button
              onClick={resetScale}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800"
            >
              {Math.round(scale * 100)}% ✕
            </button>
          )}

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

      {/* Preview area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-black"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
          </div>
        ) : isPdf ? (
          <PdfViewer
            fileUrl={`/api/documents/${documentId}/preview/proxy`}
            pageWidth={pageWidth}
            scale={scale}
            onDownload={handleDownload}
          />
        ) : isImage && previewUrl ? (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: scale > 1 ? `${100 / scale}%` : '100%',
            }}
          >
            <div className="flex items-center justify-center min-h-full p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={document?.name || 'Document preview'}
                className="max-w-full max-h-[calc(100vh-6rem)] object-contain rounded-lg"
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
