export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const MIME_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/heic': 'HEIC',
  'image/heif': 'HEIF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

export const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

export const MAX_CONCURRENT_UPLOADS = 3;

export const SESSION_COOKIE_NAME = 'doc2save_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export const SUBSCRIPTION_AMOUNT = 500;
export const SUBSCRIPTION_AMOUNT_PAISE = 50000;
