export const queryKeys = {
  userProfile: ['user-profile'] as const,

  documents: {
    all: ['documents'] as const,
    list: (folderId: string | null) => ['documents', 'list', folderId] as const,
    detail: (documentId: string) => ['documents', 'detail', documentId] as const,
    recent: ['recent-documents'] as const,
    favorites: ['favorite-documents'] as const,
    search: (query: string) => ['search-documents', query] as const,
    tagged: (tag: string) => ['documents', 'tagged', tag] as const,
  },

  folders: {
    all: ['folders'] as const,
    root: ['folders', 'root'] as const,
    contents: (folderId: string) => ['folders', folderId, 'contents'] as const,
    tree: ['folders', 'tree'] as const,
  },

  subscription: ['subscription'] as const,

  admin: {
    stats: ['admin', 'stats'] as const,
    users: (params: { page: number; search?: string; blocked?: boolean }) =>
      ['admin', 'users', params] as const,
    userDetail: (userId: string) => ['admin', 'users', userId] as const,
    revenue: (params: { period: string; year: number }) =>
      ['admin', 'revenue', params] as const,
    subscriptions: (params: { page: number; status?: string }) =>
      ['admin', 'subscriptions', params] as const,
  },
} as const;
