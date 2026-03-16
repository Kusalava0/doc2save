'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, X, Plus, FileText, RotateCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';

interface DocumentScannerProps {
  onComplete: (file: File) => void;
  onCancel: () => void;
}

interface ScannedPage {
  id: string;
  dataUrl: string;
  blob: Blob;
}

async function compressImage(blob: Blob, maxWidth = 1800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (result) => resolve(result || blob),
        'image/jpeg',
        quality,
      );
    };
    img.src = URL.createObjectURL(blob);
  });
}

async function pagesToPdf(pages: ScannedPage[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const page of pages) {
    const compressed = await compressImage(page.blob);
    const imgBytes = await compressed.arrayBuffer();
    const img = await pdfDoc.embedJpg(new Uint8Array(imgBytes));

    const { width, height } = img.scale(1);
    // Fit to A4-ish proportions, max 595x842 points
    const maxW = 595;
    const maxH = 842;
    const scale = Math.min(maxW / width, maxH / height, 1);
    const scaledW = width * scale;
    const scaledH = height * scale;

    const pdfPage = pdfDoc.addPage([scaledW, scaledH]);
    pdfPage.drawImage(img, {
      x: 0,
      y: 0,
      width: scaledW,
      height: scaledH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export function DocumentScanner({ onComplete, onCancel }: DocumentScannerProps) {
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturePhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newPage: ScannedPage = {
        id: `page-${Date.now()}-${Math.random()}`,
        dataUrl: reader.result as string,
        blob: file,
      };
      setPages((prev) => [...prev, newPage]);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-captured
    e.target.value = '';
  }, []);

  const removePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleDone = useCallback(async () => {
    if (pages.length === 0) return;

    if (pages.length === 1) {
      // Single page — upload as image directly
      const file = new File([pages[0].blob], `scan-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      onComplete(file);
      return;
    }

    // Multiple pages — combine into PDF
    setIsCreatingPdf(true);
    try {
      const pdfBlob = await pagesToPdf(pages);
      const file = new File([pdfBlob], `scan-${Date.now()}.pdf`, {
        type: 'application/pdf',
      });
      onComplete(file);
    } catch (err) {
      console.error('Failed to create PDF:', err);
    } finally {
      setIsCreatingPdf(false);
    }
  }, [pages, onComplete]);

  return (
    <div className="space-y-4">
      {/* Hidden native camera input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileCapture}
        className="hidden"
      />

      {/* Empty state */}
      {pages.length === 0 && (
        <button
          onClick={capturePhoto}
          className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer"
        >
          <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-foreground/80 mb-1">
            Tap to scan first page
          </p>
          <p className="text-xs text-muted-foreground">
            Use your camera to capture document pages
          </p>
        </button>
      )}

      {/* Page thumbnails */}
      {pages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground font-medium">
              {pages.length} {pages.length === 1 ? 'page' : 'pages'} scanned
            </span>
            <span className="text-xs text-muted-foreground">
              {pages.length > 1 ? 'Will be saved as PDF' : 'Will be saved as image'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className="relative group rounded-lg overflow-hidden border border-border bg-card aspect-3/4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.dataUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                  {index + 1}
                </span>
                <button
                  onClick={() => removePage(page.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Add page button */}
            <button
              onClick={capturePhoto}
              className="rounded-lg border-2 border-dashed border-border hover:border-zinc-600 transition-colors aspect-3/4 flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add page</span>
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isCreatingPdf}
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          Cancel
        </Button>
        {pages.length > 0 && (
          <Button
            onClick={handleDone}
            disabled={isCreatingPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCreatingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {pages.length === 1 ? 'Upload Image' : `Upload as PDF (${pages.length} pages)`}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
