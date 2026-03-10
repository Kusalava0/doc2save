'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { FolderData, FolderContents } from '@/types/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

export function useRootFolders() {
  return useQuery({
    queryKey: queryKeys.folders.root,
    queryFn: async () => {
      const res = await fetchJson<{ folders: FolderData[] }>('/api/folders');
      return res.folders;
    },
  });
}

export function useFolderContents(folderId: string) {
  return useQuery({
    queryKey: queryKeys.folders.contents(folderId),
    queryFn: async (): Promise<FolderContents> => {
      const res = await fetchJson<{
        folder: FolderData & { children?: FolderData[]; documents?: unknown[] };
        breadcrumbs: { id: string; name: string }[];
      }>(`/api/folders/${folderId}`);
      // API nests children/documents inside folder — reshape to match FolderContents
      const { children, documents, ...folderData } = res.folder;
      return {
        folder: folderData as FolderData,
        breadcrumbs: res.breadcrumbs,
        subfolders: (children ?? []) as FolderData[],
        documents: (documents ?? []) as import('@/types/api').DocumentData[],
      };
    },
    enabled: !!folderId,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      parentId,
    }: {
      name: string;
      parentId?: string | null;
    }) => {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: parentId ?? null }),
      });
      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ error: 'Create failed' }));
        throw new Error(body.error || 'Create failed');
      }
      return res.json() as Promise<FolderData>;
    },
    onSuccess: (_data, variables) => {
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.folders.contents(variables.parentId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.root });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useRenameFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      name,
    }: {
      folderId: string;
      name: string;
    }) => {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ error: 'Rename failed' }));
        throw new Error(body.error || 'Rename failed');
      }
      return res.json() as Promise<FolderData>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: string) => {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ error: 'Delete failed' }));
        throw new Error(body.error || 'Delete failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useMoveFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      targetParentId,
    }: {
      folderId: string;
      targetParentId: string | null;
    }) => {
      const res = await fetch(`/api/folders/${folderId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: targetParentId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Move failed' }));
        throw new Error(body.error || 'Move failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useBulkDeleteFolders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderIds: string[]) => {
      const results = await Promise.allSettled(
        folderIds.map((id) =>
          fetch(`/api/folders/${id}`, { method: 'DELETE' }).then((res) => {
            if (!res.ok) throw new Error(`Failed to delete ${id}`);
          })
        )
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        throw new Error(`Failed to delete ${failed} of ${folderIds.length} projects`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useBulkMoveFolders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderIds,
      targetParentId,
    }: {
      folderIds: string[];
      targetParentId: string | null;
    }) => {
      const results = await Promise.allSettled(
        folderIds.map((id) =>
          fetch(`/api/folders/${id}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parentId: targetParentId }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to move ${id}`);
          })
        )
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        throw new Error(`Failed to move ${failed} of ${folderIds.length} projects`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}
