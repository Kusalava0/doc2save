'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, Loader2, Check, File, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileIcon } from '@/components/shared/file-icon';
import { formatFileSize } from '@/lib/format';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_CONCURRENT_UPLOADS,
} from '@/lib/constants';
import { queryKeys } from '@/lib/query-keys';
import { notifyUploadComplete, notifyUploadFailed } from '@/lib/notifications';
import { extractImageMetadata, reverseGeocode } from '@/lib/exif';
import { DocumentScanner, type ScanLocation } from '@/components/documents/document-scanner';
import type { UploadUrlResponse, DocumentMetadata } from '@/types/api';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string | null;
  dashboardTag?: string | null;
}

interface UploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'confirming' | 'success' | 'error';
  progress: number;
  error?: string;
  abortController?: AbortController;
  scanLocation?: ScanLocation;
}

export function UploadDialog({
  open,
  onOpenChange,
  folderId,
  dashboardTag,
}: UploadDialogProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'scan'>('upload');
  const activeUploadsRef = useRef(0);
  const locationRef = useRef<ScanLocation | undefined>(undefined);
  const locationRequestedRef = useRef(false);

  // Request location on user gesture (not useEffect — Chrome silently
  // denies geolocation without a recent user interaction)
  const requestLocationOnGesture = useCallback(() => {
    if (locationRequestedRef.current || !navigator.geolocation) return;
    locationRequestedRef.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationRef.current = {
          latitude: Math.round(pos.coords.latitude * 1000000) / 1000000,
          longitude: Math.round(pos.coords.longitude * 1000000) / 1000000,
        };
      },
      () => {
        // Permission denied or unavailable — proceed without location
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      rejectedFiles.forEach((r: any) => {
        const name = r.file?.name || 'File';
        if (r.errors?.some((e: any) => e.code === 'file-too-large')) {
          toast.error(`${name} exceeds the 50MB size limit`);
        } else if (r.errors?.some((e: any) => e.code === 'file-invalid-type')) {
          toast.error(`${name} has an unsupported file type`);
        }
      });

      const newItems: UploadItem[] = acceptedFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        status: 'pending' as const,
        progress: 0,
        scanLocation: locationRef.current,
      }));

      setFiles((prev) => [...prev, ...newItems]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_MIME_TYPES.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {} as Record<string, string[]>
    ),
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
    onFileDialogOpen: requestLocationOnGesture,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.abortController) item.abortController.abort();
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadSingleFile = async (item: UploadItem): Promise<void> => {
    const abortController = new AbortController();

    setFiles((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? { ...f, status: 'uploading' as const, progress: 0, abortController }
          : f
      )
    );

    try {
      // Step 1: Get presigned URL
      const urlRes = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.file.name,
          mimeType: item.file.type,
          size: item.file.size,
          folderId: folderId ?? null,
        }),
        signal: abortController.signal,
      });

      if (!urlRes.ok) {
        const body = await urlRes
          .json()
          .catch(() => ({ error: 'Failed to get upload URL' }));
        throw new Error(body.error || 'Failed to get upload URL');
      }

      const { uploadUrl, documentId, r2Key }: UploadUrlResponse =
        await urlRes.json();

      // Step 2: Upload to presigned URL via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === item.id ? { ...f, progress: pct } : f
              )
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        abortController.signal.addEventListener('abort', () => xhr.abort());

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', item.file.type);
        xhr.send(item.file);
      });

      // Step 3: Extract EXIF metadata (for images) while confirming
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: 'confirming' as const, progress: 100 }
            : f
        )
      );

      let metadata: DocumentMetadata | null = null;
      try {
        metadata = await extractImageMetadata(item.file);
        // Reverse geocode if we have GPS coordinates
        if (metadata?.latitude != null && metadata?.longitude != null) {
          const geo = await reverseGeocode(metadata.latitude, metadata.longitude);
          if (geo) {
            metadata = { ...metadata, ...geo };
          }
        }
      } catch {
        // Non-critical — continue without metadata
      }

      // Inject scan location if EXIF didn't have GPS
      if (item.scanLocation && (!metadata?.latitude || !metadata?.longitude)) {
        metadata = {
          ...(metadata || {}),
          latitude: item.scanLocation.latitude,
          longitude: item.scanLocation.longitude,
        };
        // Reverse geocode the injected location
        try {
          const geo = await reverseGeocode(item.scanLocation.latitude, item.scanLocation.longitude);
          if (geo) {
            metadata = { ...metadata, ...geo };
          }
        } catch {
          // Non-critical
        }
      }

      // Include dashboardTag in metadata if provided
      const finalMetadata = dashboardTag
        ? { ...(metadata || {}), dashboardTag }
        : metadata;

      const confirmRes = await fetch('/api/documents/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, r2Key, metadata: finalMetadata }),
        signal: abortController.signal,
      });

      if (!confirmRes.ok) {
        const body = await confirmRes
          .json()
          .catch(() => ({ error: 'Confirm failed' }));
        throw new Error(body.error || 'Confirm failed');
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 'success' as const } : f
        )
      );

      notifyUploadComplete(item.file.name);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message === 'Upload cancelled') {
        setFiles((prev) => prev.filter((f) => f.id !== item.id));
        return;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: 'error' as const, error: err.message }
            : f
        )
      );

      notifyUploadFailed(item.file.name);
    }
  };

  const processQueue = async (items: UploadItem[]) => {
    const queue = [...items];

    const processNext = async (): Promise<void> => {
      if (queue.length === 0) return;
      const item = queue.shift()!;
      activeUploadsRef.current++;
      await uploadSingleFile(item);
      activeUploadsRef.current--;
      await processNext();
    };

    // Start up to MAX_CONCURRENT_UPLOADS workers
    const workers = Array.from(
      { length: Math.min(MAX_CONCURRENT_UPLOADS, queue.length) },
      () => processNext()
    );

    await Promise.all(workers);
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    await processQueue(pendingFiles);
    setIsUploading(false);

    // Invalidate queries on completion
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.recent });
    queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    if (dashboardTag) {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.tagged(dashboardTag) });
    }

    const successCount = files.filter((f) => f.status === 'success').length;
    if (successCount > 0) {
      toast.success(
        `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`
      );
    }
  };

  const handleScanComplete = useCallback((file: File) => {
    const newItem: UploadItem = {
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0,
      scanLocation: locationRef.current,
    };
    setFiles((prev) => [...prev, newItem]);
    setMode('upload');
  }, []);

  const handleClose = (open: boolean) => {
    if (isUploading) return; // Prevent closing during upload
    setFiles([]);
    setMode('upload');
    onOpenChange(open);
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const allDone =
    files.length > 0 && files.every((f) => f.status === 'success' || f.status === 'error');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-border text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Works</DialogTitle>
        </DialogHeader>

        {/* Mode tabs */}
        {files.length === 0 && !isUploading && (
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            <button
              onClick={() => { setMode('upload'); requestLocationOnGesture(); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === 'upload'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
            <button
              onClick={() => { setMode('scan'); requestLocationOnGesture(); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === 'scan'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ScanLine className="h-4 w-4" />
              Scan Document
            </button>
          </div>
        )}

        {/* Scanner mode */}
        {mode === 'scan' && files.length === 0 && (
          <DocumentScanner
            onComplete={handleScanComplete}
            onCancel={() => setMode('upload')}
          />
        )}

        {/* Drop zone (upload mode) */}
        {mode === 'upload' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-border hover:border-zinc-600'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            {isDragActive ? (
              <p className="text-sm text-blue-400">Drop files here...</p>
            ) : (
              <>
                <p className="text-sm text-foreground/80 mb-1">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPEG, PNG, HEIC, DOCX up to 50MB
                </p>
              </>
            )}
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5"
              >
                <FileIcon mimeType={item.file.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {item.file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(item.file.size)}
                    </span>
                    {item.status === 'uploading' && (
                      <span className="text-xs text-blue-400">
                        {item.progress}%
                      </span>
                    )}
                    {item.status === 'confirming' && (
                      <span className="text-xs text-yellow-400">
                        Confirming...
                      </span>
                    )}
                    {item.status === 'success' && (
                      <span className="text-xs text-green-400">Done</span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-xs text-red-400">
                        {item.error || 'Failed'}
                      </span>
                    )}
                  </div>
                  {(item.status === 'uploading' ||
                    item.status === 'confirming') && (
                    <Progress
                      value={item.progress}
                      className="h-1 mt-1 bg-muted [&>div]:bg-blue-500"
                    />
                  )}
                </div>
                <div className="shrink-0">
                  {item.status === 'success' ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : item.status === 'uploading' ||
                    item.status === 'confirming' ? (
                    <button
                      onClick={() => removeFile(item.id)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : item.status === 'error' ? (
                    <button
                      onClick={() => removeFile(item.id)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => removeFile(item.id)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions (only in upload mode or when files exist) */}
        {mode === 'upload' && <div className="flex justify-end gap-2 pt-2">
          {allDone ? (
            <Button
              onClick={() => handleClose(false)}
              className="bg-muted hover:bg-border text-foreground"
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => handleClose(false)}
                disabled={isUploading}
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={pendingCount === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {pendingCount > 0 ? `(${pendingCount})` : ''}
                  </>
                )}
              </Button>
            </>
          )}
        </div>}
      </DialogContent>
    </Dialog>
  );
}
