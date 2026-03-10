'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { DocumentData } from '@/types/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

export function useDocuments(folderId?: string | null) {
  const params = folderId ? `?folderId=${folderId}` : '';
  return useQuery({
    queryKey: queryKeys.documents.list(folderId ?? null),
    queryFn: async () => {
      const res = await fetchJson<{ documents: DocumentData[] }>(`/api/documents${params}`);
      return res.documents;
    },
  });
}

export function useRecentDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.recent,
    queryFn: async () => {
      const res = await fetchJson<{ documents: DocumentData[] }>('/api/documents/recent');
      return res.documents;
    },
  });
}

export function useFavoriteDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.favorites,
    queryFn: async () => {
      const res = await fetchJson<{ documents: DocumentData[] }>('/api/documents/favorites');
      return res.documents;
    },
  });
}

export function useSearchDocuments(query: string) {
  return useQuery({
    queryKey: queryKeys.documents.search(query),
    queryFn: async () => {
      const res = await fetchJson<{ documents: DocumentData[] }>(
        `/api/documents/search?q=${encodeURIComponent(query)}`
      );
      return res.documents;
    },
    enabled: query.length >= 2,
  });
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['global-search', query] as const,
    queryFn: async () => {
      const res = await fetchJson<{
        documents: DocumentData[];
        folders: import('@/types/api').FolderData[];
      }>(`/api/documents/search?q=${encodeURIComponent(query)}`);
      return res;
    },
    enabled: query.length >= 2,
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(body.error || 'Delete failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.recent });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.favorites });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      isFavorite,
    }: {
      documentId: string;
      isFavorite: boolean;
    }) => {
      const res = await fetch(`/api/documents/${documentId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Update failed' }));
        throw new Error(body.error || 'Update failed');
      }
      return res.json();
    },
    onMutate: async ({ documentId, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.all });

      // Snapshot previous values for rollback
      const previousAll = queryClient.getQueriesData<DocumentData[]>({
        queryKey: queryKeys.documents.all,
      });

      // Optimistically update all document caches (skip non-array entries like detail queries)
      queryClient.setQueriesData<DocumentData[]>(
        { queryKey: queryKeys.documents.all },
        (old) =>
          Array.isArray(old)
            ? old.map((doc) =>
                doc.id === documentId ? { ...doc, isFavorite } : doc
              )
            : old
      );

      return { previousAll };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousAll) {
        context.previousAll.forEach(([key, data]) => {
          if (data) queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.favorites });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.recent });
    },
  });
}

export function useMoveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      targetFolderId,
    }: {
      documentId: string;
      targetFolderId: string | null;
    }) => {
      const res = await fetch(`/api/documents/${documentId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: targetFolderId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Move failed' }));
        throw new Error(body.error || 'Move failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useBulkDeleteDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentIds: string[]) => {
      // Delete sequentially to avoid overwhelming the server
      const results = await Promise.allSettled(
        documentIds.map((id) =>
          fetch(`/api/documents/${id}`, { method: 'DELETE' }).then((res) => {
            if (!res.ok) throw new Error(`Failed to delete ${id}`);
          })
        )
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        throw new Error(`Failed to delete ${failed} of ${documentIds.length} works`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.recent });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.favorites });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useBulkMoveDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentIds,
      targetFolderId,
    }: {
      documentIds: string[];
      targetFolderId: string | null;
    }) => {
      const results = await Promise.allSettled(
        documentIds.map((id) =>
          fetch(`/api/documents/${id}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderId: targetFolderId }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to move ${id}`);
          })
        )
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        throw new Error(`Failed to move ${failed} of ${documentIds.length} works`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}
