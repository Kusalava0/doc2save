'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  fileUrl: string;
  containerWidth: number;
  zoom: number;
  onDownload: () => void;
  onPageCount?: (count: number) => void;
}

// Load pdf.js from CDN — bypasses webpack/turbopack bundling entirely
async function getPdfJs(): Promise<any> {
  if ((window as any).__pdfjsLib) return (window as any).__pdfjsLib;

  const pdfjsLib = await import(
    /* webpackIgnore: true */
    // @ts-expect-error CDN import
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.mjs'
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';
  (window as any).__pdfjsLib = pdfjsLib;
  return pdfjsLib;
}

export function PdfViewer({
  fileUrl,
  containerWidth,
  zoom,
  onDownload,
  onPageCount,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const pdfDocRef = useRef<any>(null);
  const renderingRef = useRef<Set<number>>(new Set());

  // The actual pixel width each page renders at
  const renderWidth = Math.round(containerWidth * zoom);

  // Load the PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        const pdfjsLib = await getPdfJs();
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        onPageCount?.(pdf.numPages);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError('Failed to load PDF. Try downloading instead.');
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [fileUrl, onPageCount]);

  // Render a single page to its canvas
  const renderPage = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement) => {
      const pdf = pdfDocRef.current;
      if (!pdf || !canvas) return;
      if (renderingRef.current.has(pageNum)) return;
      renderingRef.current.add(pageNum);

      try {
        const page = await pdf.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scaleToFit = renderWidth / unscaledViewport.width;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scaleToFit * dpr });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${renderWidth}px`;
        canvas.style.height = `${Math.round(
          (renderWidth / unscaledViewport.width) * unscaledViewport.height
        )}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch {
        // Silently skip failed pages
      } finally {
        renderingRef.current.delete(pageNum);
      }
    },
    [renderWidth]
  );

  // Re-render all pages when zoom/width changes
  useEffect(() => {
    if (!pdfDocRef.current || numPages === 0) return;

    for (let i = 1; i <= numPages; i++) {
      const canvas = canvasRefs.current.get(i);
      if (canvas) renderPage(i, canvas);
    }
  }, [numPages, renderWidth, renderPage]);

  const setCanvasRef = useCallback(
    (pageNum: number) => (el: HTMLCanvasElement | null) => {
      if (el) {
        canvasRefs.current.set(pageNum, el);
        renderPage(pageNum, el);
      } else {
        canvasRefs.current.delete(pageNum);
      }
    },
    [renderPage]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <FileText className="h-16 w-16 text-zinc-600" />
        <p className="text-sm text-zinc-400 text-center">{error}</p>
        <Button
          onClick={onDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center py-4 px-2 gap-3 min-w-full">
      {Array.from({ length: numPages }, (_, i) => (
        <canvas
          key={i + 1}
          ref={setCanvasRef(i + 1)}
          className="shadow-lg rounded-sm bg-white block"
        />
      ))}
      {numPages > 0 && (
        <p className="text-xs text-zinc-500 pb-4">
          {numPages} {numPages === 1 ? 'page' : 'pages'}
        </p>
      )}
    </div>
  );
}
