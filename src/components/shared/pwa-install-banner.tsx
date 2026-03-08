'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/hooks/use-pwa-install';

const DISMISSED_KEY = 'doc2save-install-dismissed';

export function PwaInstallBanner() {
  const { canInstall, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    // Check if user dismissed the banner recently (within 7 days)
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }
    setDismissed(false);
  }, []);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 mx-3 mb-2 md:bottom-0 md:mb-3 md:mx-auto md:max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm p-3 shadow-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Install Doc2Save</p>
          <p className="text-xs text-zinc-400 truncate">
            Add to home screen for quick access
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleInstall}
          className="bg-white text-black hover:bg-zinc-200 text-xs h-8 px-3 shrink-0"
        >
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 text-zinc-500 hover:text-zinc-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
