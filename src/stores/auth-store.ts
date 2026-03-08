import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  userId: string;
  firebaseUid: string;
  phone: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN';
  name: string | null;
  freeUploadUsed: boolean;
}

type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: string };

interface AuthStore {
  auth: AuthState;
  setLoading: () => void;
  setAuthenticated: (user: AuthUser) => void;
  setUnauthenticated: () => void;
  setError: (error: string) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      auth: { status: 'idle' } as AuthState,

      setLoading: () => set({ auth: { status: 'loading' } }),

      setAuthenticated: (user) =>
        set({ auth: { status: 'authenticated', user } }),

      setUnauthenticated: () =>
        set({ auth: { status: 'unauthenticated' } }),

      setError: (error) =>
        set({ auth: { status: 'error', error } }),

      updateUser: (partial) => {
        const current = get().auth;
        if (current.status === 'authenticated') {
          set({
            auth: {
              status: 'authenticated',
              user: { ...current.user, ...partial },
            },
          });
        }
      },

      logout: () => set({ auth: { status: 'unauthenticated' } }),
    }),
    {
      name: 'doc2save-auth',
      partialize: (state) =>
        state.auth.status === 'authenticated'
          ? { auth: state.auth }
          : { auth: { status: 'unauthenticated' as const } },
    }
  )
);
