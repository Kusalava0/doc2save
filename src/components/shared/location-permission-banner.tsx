'use client';

import { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getLocationPermissionState,
  hasAskedLocationPermission,
} from '@/lib/notifications';

export function LocationPermissionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasAskedLocationPermission()) return;
    if (!('geolocation' in navigator)) return;

    // Pre-check: if already granted, no banner needed
    getLocationPermissionState().then((state) => {
      if (state === 'granted') {
        localStorage.setItem('doc2save-location-asked', 'true');
        return;
      }
      // Show the banner — user needs to click Allow for the browser prompt
      setTimeout(() => setVisible(true), 6000);
    });
  }, []);

  if (!visible) return null;

  // Call getCurrentPosition directly — no wrappers, no promises between click and the API
  const handleAllow = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        localStorage.setItem('doc2save-location-asked', 'true');
        setVisible(false);
      },
      () => {
        localStorage.setItem('doc2save-location-asked', 'true');
        setVisible(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const handleDismiss = () => {
    localStorage.setItem('doc2save-location-asked', 'true');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="shrink-0 h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Enable location</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tag your uploaded documents with location details automatically
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <Button
              size="sm"
              onClick={handleAllow}
              className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Allow
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
