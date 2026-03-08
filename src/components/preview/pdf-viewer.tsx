'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  fileUrl: string;
  pageWidth: number;
  scale: number;
  onDownload: () => void;
}

interface PdfPage {
  pageNumber: number;
  rendered: boolean;
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

export function PdfViewer({ fileUrl, pageWidth, scale, onDownload }: PdfViewerProps) {
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const pdfDocRef = useRef<any>(null);

  // Load the PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        const pdfjsLib = await getPdfJs();
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;

        if (cancelled) return;
        pdfDocRef.current = pdf;
        setPages(
          Array.from({ length: pdf.numPages }, (_, i) => ({
            pageNumber: i + 1,
            rendered: false,
          }))
        );
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
  }, [fileUrl]);

  // Render pages to canvases when refs are available or width changes
  const renderPage = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement) => {
      const pdf = pdfDocRef.current;
      if (!pdf || !canvas) return;

      try {
        const page = await pdf.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1 });
        const renderScale = pageWidth / unscaledViewport.width;
        // Use 2x for retina sharpness
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: renderScale * outputScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${pageWidth}px`;
        canvas.style.height = `${(pageWidth / unscaledViewport.width) * unscaledViewport.height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch {
        // Individual page render failure — leave canvas blank
      }
    },
    [pageWidth]
  );

  // Re-render all pages when pageWidth changes
  useEffect(() => {
    if (!pdfDocRef.current || pages.length === 0) return;

    pages.forEach((p) => {
      const canvas = canvasRefs.current.get(p.pageNumber);
      if (canvas) renderPage(p.pageNumber, canvas);
    });
  }, [pages, pageWidth, renderPage]);

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
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: scale > 1 ? `${100 / scale}%` : '100%',
      }}
    >
      <div className="flex flex-col items-center py-4 px-2 gap-3">
        {pages.map((p) => (
          <canvas
            key={p.pageNumber}
            ref={setCanvasRef(p.pageNumber)}
            className="shadow-lg rounded-sm bg-white"
            style={{ maxWidth: '100%' }}
          />
        ))}
        {pages.length > 0 && (
          <p className="text-xs text-zinc-500 pb-4">
            {pages.length} {pages.length === 1 ? 'page' : 'pages'}
          </p>
        )}
      </div>
    </div>
  );
}
