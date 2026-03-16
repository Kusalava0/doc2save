const PERMISSION_KEY = 'doc2save-notif-asked';
const LOCATION_PERMISSION_KEY = 'doc2save-location-asked';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  localStorage.setItem(PERMISSION_KEY, 'true');
  return result === 'granted';
}

export function hasAskedPermission(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PERMISSION_KEY) === 'true';
}

export function canNotify(): boolean {
  return typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted';
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (!canNotify()) return;

  // Use service worker registration if available for better PWA support
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      });
    });
  } else {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      ...options,
    });
  }
}

export function hasAskedLocationPermission(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LOCATION_PERMISSION_KEY) === 'true';
}

export async function requestLocationPermission(): Promise<boolean> {
  if (!('geolocation' in navigator)) return false;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => {
        localStorage.setItem(LOCATION_PERMISSION_KEY, 'true');
        resolve(true);
      },
      () => {
        localStorage.setItem(LOCATION_PERMISSION_KEY, 'true');
        resolve(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

export function notifyUploadComplete(fileName: string) {
  sendNotification('Upload Complete', {
    body: `"${fileName}" has been uploaded successfully.`,
    tag: 'upload-complete',
  });
}

export function notifyUploadFailed(fileName: string) {
  sendNotification('Upload Failed', {
    body: `"${fileName}" could not be uploaded. Please try again.`,
    tag: 'upload-failed',
  });
}

export function notifySubscriptionExpiring(daysLeft: number) {
  sendNotification('Subscription Expiring Soon', {
    body: daysLeft <= 0
      ? 'Your subscription has expired. Renew to continue uploading.'
      : `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew to avoid interruption.`,
    tag: 'subscription-expiring',
  });
}

export function notifyEmdExpiring(documentName: string, daysLeft: number) {
  sendNotification('EMD Expiring Soon', {
    body: daysLeft <= 0
      ? `EMD "${documentName}" has expired. Take action immediately.`
      : `EMD "${documentName}" expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew or take action.`,
    tag: `emd-expiring-${documentName}`,
  });
}

export function notifyStorageWarning(usedPercent: number) {
  sendNotification('Storage Almost Full', {
    body: `You've used ${usedPercent}% of your storage. Consider deleting old documents.`,
    tag: 'storage-warning',
  });
}
