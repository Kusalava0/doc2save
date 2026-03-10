'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <Image
          src="/icons/icon-192x192.png"
          alt="AptsWorks"
          width={72}
          height={72}
          className="rounded-2xl"
          priority
        />
        <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-[length:200%_100%] animate-shimmer bg-[linear-gradient(110deg,var(--foreground)_35%,var(--muted-foreground)_50%,var(--foreground)_65%)]">
          AptsWorks
        </h1>
      </div>
    </div>
  );
}
