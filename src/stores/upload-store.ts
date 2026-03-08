import { create } from 'zustand';

export type UploadFileStatus =
  | 'pending'
  | 'validating'
  | 'requesting_url'
  | 'uploading'
  | 'confirming'
  | 'success'
  | 'error';

export interface UploadFile {
  id: string;
  file: File;
  fileName: string;
  mimeType: string;
  size: number;
  folderId: string | null;
  status: UploadFileStatus;
  progress: number;
  error: string | null;
  documentId: string | null;
  r2Key: string | null;
  uploadUrl: string | null;
  abortController: AbortController | null;
}

export type UploadFlowState = 'idle' | 'selecting_files' | 'uploading' | 'complete';

interface UploadStore {
  flowState: UploadFlowState;
  files: UploadFile[];
  targetFolderId: string | null;

  setFlowState: (state: UploadFlowState) => void;
  setTargetFolder: (folderId: string | null) => void;
  addFiles: (files: UploadFile[]) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, update: Partial<UploadFile>) => void;
  clearCompleted: () => void;
  resetAll: () => void;

  hasActiveUploads: () => boolean;
  completedCount: () => number;
  totalCount: () => number;
}

const ACTIVE_STATUSES: UploadFileStatus[] = [
  'pending', 'validating', 'requesting_url', 'uploading', 'confirming',
];

export const useUploadStore = create<UploadStore>((set, get) => ({
  flowState: 'idle',
  files: [],
  targetFolderId: null,

  setFlowState: (state) => set({ flowState: state }),
  setTargetFolder: (folderId) => set({ targetFolderId: folderId }),

  addFiles: (files) =>
    set((s) => ({ files: [...s.files, ...files], flowState: 'uploading' })),

  removeFile: (id) => {
    const file = get().files.find((f) => f.id === id);
    if (file?.abortController) file.abortController.abort();
    set((s) => ({ files: s.files.filter((f) => f.id !== id) }));
  },

  updateFile: (id, update) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, ...update } : f)),
    })),

  clearCompleted: () =>
    set((s) => ({
      files: s.files.filter((f) => f.status !== 'success'),
      flowState: s.files.every((f) => f.status === 'success') ? 'idle' : s.flowState,
    })),

  resetAll: () => {
    get().files.forEach((f) => f.abortController?.abort());
    set({ files: [], flowState: 'idle', targetFolderId: null });
  },

  hasActiveUploads: () =>
    get().files.some((f) => ACTIVE_STATUSES.includes(f.status)),

  completedCount: () =>
    get().files.filter((f) => f.status === 'success').length,

  totalCount: () => get().files.length,
}));
