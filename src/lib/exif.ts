import exifr from 'exifr';
import type { DocumentMetadata } from '@/types/api';

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/webp',
];

export function isImageFile(mimeType: string): boolean {
  return IMAGE_MIME_TYPES.includes(mimeType.toLowerCase());
}

export async function extractImageMetadata(
  file: File,
): Promise<DocumentMetadata | null> {
  if (!isImageFile(file.type)) return null;

  try {
    const exif = await exifr.parse(file, {
      gps: true,
      tiff: true,
      exif: true,
      pick: [
        'GPSLatitude',
        'GPSLongitude',
        'GPSAltitude',
        'GPSImgDirection',
        'Make',
        'Model',
        'DateTimeOriginal',
        'CreateDate',
        'ImageWidth',
        'ImageHeight',
        'ExifImageWidth',
        'ExifImageHeight',
      ],
    } as any);

    if (!exif) return null;

    const metadata: DocumentMetadata = {};

    // GPS coordinates (exifr auto-converts to decimal degrees)
    if (typeof exif.latitude === 'number' && typeof exif.longitude === 'number') {
      metadata.latitude = Math.round(exif.latitude * 1000000) / 1000000;
      metadata.longitude = Math.round(exif.longitude * 1000000) / 1000000;
    }

    if (typeof exif.GPSAltitude === 'number') {
      metadata.altitude = Math.round(exif.GPSAltitude * 100) / 100;
    }

    if (typeof exif.GPSImgDirection === 'number') {
      metadata.gpsDirection = Math.round(exif.GPSImgDirection * 100) / 100;
    }

    // Camera info
    if (exif.Make) metadata.cameraMake = String(exif.Make).trim();
    if (exif.Model) metadata.cameraModel = String(exif.Model).trim();

    // Date taken
    const dateVal = exif.DateTimeOriginal || exif.CreateDate;
    if (dateVal instanceof Date) {
      metadata.dateTaken = dateVal.toISOString();
    }

    // Image dimensions
    const w = exif.ExifImageWidth || exif.ImageWidth;
    const h = exif.ExifImageHeight || exif.ImageHeight;
    if (typeof w === 'number') metadata.imageWidth = w;
    if (typeof h === 'number') metadata.imageHeight = h;

    // Only return if we got at least some data
    if (Object.keys(metadata).length === 0) return null;

    return metadata;
  } catch {
    // EXIF parsing failed — not all images have EXIF data
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address details.
 * Uses the free Nominatim API (OpenStreetMap).
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ city?: string; state?: string; country?: string; formattedAddress?: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: { 'User-Agent': 'AptsWorks/1.0' },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    const addr = data.address;
    if (!addr) return null;

    return {
      city: addr.city || addr.town || addr.village || addr.hamlet,
      state: addr.state,
      country: addr.country,
      formattedAddress: data.display_name,
    };
  } catch {
    return null;
  }
}
