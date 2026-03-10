export interface UserProfile {
  userId: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: 'USER' | 'ADMIN';
  freeUploadUsed: boolean;
  hasPhone: boolean;
  hasGoogle: boolean;
  createdAt: string;
  documentCount: number;
  storageUsedBytes: number;
}

export type SubscriptionStatusType =
  | 'NONE'
  | 'CREATED'
  | 'AUTHENTICATED'
  | 'ACTIVE'
  | 'PENDING'
  | 'HALTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'EXPIRED';

export interface SubscriptionData {
  id: string | null;
  status: SubscriptionStatusType;
  currentPeriodEnd: string | null;
  razorpaySubscriptionId: string | null;
}

export interface DocumentMetadata {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
  cameraMake?: string;
  cameraModel?: string;
  dateTaken?: string;
  gpsDirection?: number;
  imageWidth?: number;
  imageHeight?: number;
}

export interface DocumentData {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  folderId: string | null;
  isFavorite: boolean;
  metadata: DocumentMetadata | null;
  uploadedAt: string;
}

export interface FolderData {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  _count: { documents: number; children: number };
}

export interface FolderContents {
  folder: FolderData;
  breadcrumbs: { id: string; name: string }[];
  subfolders: FolderData[];
  documents: DocumentData[];
}

export interface UploadUrlResponse {
  uploadUrl: string;
  documentId: string;
  r2Key: string;
}

export interface ApiError {
  error: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  totalDocuments: number;
  totalStorageBytes: number;
}

export interface AdminUser {
  id: string;
  phone: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  freeUploadUsed: boolean;
  createdAt: string;
  documentCount: number;
  subscription: { status: string; currentPeriodEnd: string | null } | null;
}

export interface RevenueData {
  month: string;
  total: number;
  transactionCount: number;
}
