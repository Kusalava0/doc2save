import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size';
export type SortOrder = 'asc' | 'desc';

export type ModalType =
  | { type: 'none' }
  | { type: 'upload'; folderId?: string }
  | { type: 'create-folder'; parentId?: string }
  | { type: 'rename-folder'; folderId: string; currentName: string }
  | { type: 'rename-document'; documentId: string; currentName: string }
  | { type: 'delete-document'; documentId: string; documentName: string }
  | { type: 'delete-folder'; folderId: string; folderName: string }
  | { type: 'move-document'; documentId: string }
  | { type: 'move-folder'; folderId: string }
  | { type: 'paywall' }
  | { type: 'pwa-install' };

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  setSort: (by: SortBy, order: SortOrder) => void;

  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  mobileSheetOpen: boolean;
  mobileSheetContent: 'none' | 'folder-actions' | 'document-actions' | 'sort-options';
  openMobileSheet: (content: UIStore['mobileSheetContent']) => void;
  closeMobileSheet: () => void;

  selectedDocumentId: string | null;
  selectedFolderId: string | null;
  selectDocument: (id: string | null) => void;
  selectFolder: (id: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      viewMode: 'grid' as ViewMode,
      setViewMode: (mode) => set({ viewMode: mode }),
      sortBy: 'date' as SortBy,
      sortOrder: 'desc' as SortOrder,
      setSort: (by, order) => set({ sortBy: by, sortOrder: order }),

      activeModal: { type: 'none' } as ModalType,
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: { type: 'none' } }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      mobileSheetOpen: false,
      mobileSheetContent: 'none' as const,
      openMobileSheet: (content) =>
        set({ mobileSheetOpen: true, mobileSheetContent: content }),
      closeMobileSheet: () =>
        set({ mobileSheetOpen: false, mobileSheetContent: 'none' }),

      selectedDocumentId: null,
      selectedFolderId: null,
      selectDocument: (id) => set({ selectedDocumentId: id }),
      selectFolder: (id) => set({ selectedFolderId: id }),
    }),
    {
      name: 'doc2save-ui',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
