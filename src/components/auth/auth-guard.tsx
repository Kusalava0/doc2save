'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { auth, setAuthenticated, setUnauthenticated, setLoading } =
    useAuthStore();

  useEffect(() => {
    const hydrate = async () => {
      // If already authenticated from persisted store, verify the session is still valid
      if (auth.status === 'authenticated') {
        try {
          const res = await fetch('/api/auth/session');
          if (!res.ok) {
            setUnauthenticated();
            router.push('/login');
            return;
          }
          const data = await res.json();
          setAuthenticated(data.user);
        } catch {
          setUnauthenticated();
          router.push('/login');
        }
        return;
      }

      // For idle or unauthenticated states, check if there's a server session
      if (auth.status === 'idle' || auth.status === 'unauthenticated') {
        setLoading();
        try {
          const res = await fetch('/api/auth/session');
          if (!res.ok) {
            setUnauthenticated();
            router.push('/login');
            return;
          }
          const data = await res.json();
          setAuthenticated(data.user);
        } catch {
          setUnauthenticated();
          router.push('/login');
        }
      }
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (auth.status === 'authenticated') {
    return <>{children}</>;
  }

  // Loading / idle / checking state
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Doc2Save
        </h1>
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-500 [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-500 [animation-delay:300ms]" />
        </div>
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    </div>
  );
}
