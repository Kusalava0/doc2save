Now I have a thorough understanding of the project requirements. Let me deliver the complete implementation plan.

---

# Doc2Save -- Complete Implementation Blueprint

## 1. Project Structure

```
doc2save/
├── .env.local                          # Local environment variables
├── .env.example                        # Template for env vars
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── package.json
├── prisma/
│   ├── schema.prisma                   # Prisma schema (all models)
│   ├── migrations/                     # Auto-generated migrations
│   └── seed.ts                         # Seed admin user + test data
├── public/
│   ├── manifest.json                   # PWA manifest
│   ├── sw.js                           # Generated service worker (output)
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── images/
│       └── logo.svg
├── sentry.client.config.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx                    # Landing / marketing page (unauthenticated)
│   │   ├── loading.tsx                 # Global loading skeleton
│   │   ├── not-found.tsx
│   │   ├── error.tsx                   # Global error boundary
│   │   ├── global-error.tsx
│   │   ├── (auth)/
│   │   │   ├── layout.tsx              # Auth layout (centered card, no sidebar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Phone OTP login
│   │   │   └── verify/
│   │   │       └── page.tsx            # OTP verification step
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Dashboard layout (sidebar + topbar + main)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Home: recent uploads, storage stats, quick actions
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx            # Root folder view (all top-level folders + files)
│   │   │   │   └── [folderId]/
│   │   │   │       └── page.tsx        # Subfolder view (breadcrumbs + contents)
│   │   │   ├── favorites/
│   │   │   │   └── page.tsx            # Favorited documents list
│   │   │   ├── recent/
│   │   │   │   └── page.tsx            # Recent uploads list
│   │   │   ├── search/
│   │   │   │   └── page.tsx            # Search results page
│   │   │   ├── preview/
│   │   │   │   └── [documentId]/
│   │   │   │       └── page.tsx        # Full-screen document preview
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx            # Subscription status, manage, upgrade
│   │   │   └── settings/
│   │   │       └── page.tsx            # User profile, phone number display
│   │   ├── (admin)/
│   │   │   ├── layout.tsx              # Admin layout (admin sidebar)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx            # Admin dashboard (stats overview)
│   │   │   │   ├── users/
│   │   │   │   │   ├── page.tsx        # User list with filters
│   │   │   │   │   └── [userId]/
│   │   │   │   │       └── page.tsx    # Single user detail (docs, subscription, KYC)
│   │   │   │   ├── subscriptions/
│   │   │   │   │   └── page.tsx        # All subscriptions, extend/cancel
│   │   │   │   └── revenue/
│   │   │   │       └── page.tsx        # Revenue dashboard (charts, totals)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts        # POST: Verify Firebase token, create session
│   │       │   ├── logout/
│   │       │   │   └── route.ts        # POST: Clear session
│   │       │   ├── session/
│   │       │   │   └── route.ts        # GET: Validate current session
│   │       │   └── me/
│   │       │       └── route.ts        # GET: Current user profile
│   │       ├── users/
│   │       │   ├── route.ts            # GET: List users (admin)
│   │       │   ├── [userId]/
│   │       │   │   ├── route.ts        # GET/PATCH: User details (admin)
│   │       │   │   └── block/
│   │       │   │       └── route.ts    # POST: Block/unblock user (admin)
│   │       │   └── sync/
│   │       │       └── route.ts        # POST: Sync Firebase user to Supabase
│   │       ├── folders/
│   │       │   ├── route.ts            # GET: List root folders, POST: Create folder
│   │       │   └── [folderId]/
│   │       │       ├── route.ts        # GET: Folder contents, PATCH: Rename, DELETE
│   │       │       └── move/
│   │       │           └── route.ts    # PATCH: Move folder to new parent
│   │       ├── documents/
│   │       │   ├── route.ts            # GET: List documents (with filters)
│   │       │   ├── upload/
│   │       │   │   └── route.ts        # POST: Generate presigned upload URL
│   │       │   ├── confirm/
│   │       │   │   └── route.ts        # POST: Confirm upload completion, save metadata
│   │       │   ├── [documentId]/
│   │       │   │   ├── route.ts        # GET: Document metadata, DELETE: Permanent delete
│   │       │   │   ├── download/
│   │       │   │   │   └── route.ts    # GET: Generate presigned download URL
│   │       │   │   ├── preview/
│   │       │   │   │   └── route.ts    # GET: Generate presigned preview URL
│   │       │   │   ├── favorite/
│   │       │   │   │   └── route.ts    # POST: Toggle favorite
│   │       │   │   └── move/
│   │       │   │       └── route.ts    # PATCH: Move to folder
│   │       │   ├── recent/
│   │       │   │   └── route.ts        # GET: Recent uploads (last 30 days)
│   │       │   ├── favorites/
│   │       │   │   └── route.ts        # GET: All favorited documents
│   │       │   └── search/
│   │       │       └── route.ts        # GET: Search by filename
│   │       ├── subscription/
│   │       │   ├── route.ts            # GET: Current subscription status
│   │       │   ├── create/
│   │       │   │   └── route.ts        # POST: Create Razorpay subscription
│   │       │   ├── cancel/
│   │       │   │   └── route.ts        # POST: Cancel subscription
│   │       │   └── extend/
│   │       │       └── route.ts        # POST: Admin extend subscription
│   │       ├── payments/
│   │       │   └── webhook/
│   │       │       └── route.ts        # POST: Razorpay webhook handler
│   │       └── admin/
│   │           ├── stats/
│   │           │   └── route.ts        # GET: Dashboard stats (user count, revenue, etc.)
│   │           └── revenue/
│   │               └── route.ts        # GET: Revenue data (daily/monthly)
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   └── ...                     # Other shadcn components as needed
│   │   ├── layout/
│   │   │   ├── sidebar.tsx             # Dashboard sidebar navigation
│   │   │   ├── topbar.tsx              # Top bar (search, user menu)
│   │   │   ├── mobile-nav.tsx          # Mobile bottom navigation bar
│   │   │   ├── admin-sidebar.tsx       # Admin panel sidebar
│   │   │   └── breadcrumbs.tsx         # Folder breadcrumb trail
│   │   ├── auth/
│   │   │   ├── phone-input.tsx         # Phone number input with +91 prefix
│   │   │   ├── otp-input.tsx           # 6-digit OTP input
│   │   │   └── auth-guard.tsx          # Client-side auth wrapper
│   │   ├── documents/
│   │   │   ├── document-card.tsx       # File card (thumbnail, name, size, date, actions)
│   │   │   ├── document-list.tsx       # List/grid view of documents
│   │   │   ├── document-grid.tsx       # Grid view variant
│   │   │   ├── upload-button.tsx       # Upload trigger + paywall check
│   │   │   ├── upload-dialog.tsx       # Upload modal (dropzone, progress, folder select)
│   │   │   ├── upload-progress.tsx     # Individual file upload progress bar
│   │   │   ├── delete-dialog.tsx       # Permanent delete confirmation
│   │   │   ├── move-dialog.tsx         # Move file/folder to destination
│   │   │   ├── rename-dialog.tsx       # Rename file/folder
│   │   │   └── empty-state.tsx         # "No documents yet" placeholder
│   │   ├── folders/
│   │   │   ├── folder-card.tsx         # Folder card with icon, name, item count
│   │   │   ├── create-folder-dialog.tsx # New folder modal
│   │   │   └── folder-tree.tsx         # Folder tree for move operations
│   │   ├── preview/
│   │   │   ├── pdf-viewer.tsx          # PDF.js-based viewer
│   │   │   ├── image-viewer.tsx        # Image preview with zoom/pan
│   │   │   └── docx-viewer.tsx         # DOCX rendering (mammoth.js)
│   │   ├── subscription/
│   │   │   ├── paywall-modal.tsx       # "Subscribe to continue" modal
│   │   │   ├── plan-card.tsx           # Subscription plan display
│   │   │   ├── subscription-status.tsx # Current plan status badge
│   │   │   └── razorpay-button.tsx     # Razorpay checkout trigger
│   │   ├── admin/
│   │   │   ├── user-table.tsx          # Admin user list table
│   │   │   ├── stats-cards.tsx         # Admin dashboard stat cards
│   │   │   ├── revenue-chart.tsx       # Revenue chart (recharts)
│   │   │   └── user-detail-card.tsx    # User detail panel
│   │   ├── shared/
│   │   │   ├── search-bar.tsx          # Global search input
│   │   │   ├── file-icon.tsx           # File type icon mapper
│   │   │   ├── format-bytes.tsx        # File size formatter
│   │   │   ├── date-display.tsx        # Relative date display
│   │   │   ├── loading-spinner.tsx
│   │   │   └── pwa-install-prompt.tsx  # PWA install banner
│   │   └── providers/
│   │       ├── auth-provider.tsx       # Firebase auth context
│   │       ├── query-provider.tsx      # TanStack Query provider
│   │       └── theme-provider.tsx      # Dark theme provider (next-themes)
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts              # Firebase client SDK init (auth only)
│   │   │   └── admin.ts               # Firebase Admin SDK init (server-side token verify)
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase browser client
│   │   │   └── server.ts              # Supabase server client (for API routes)
│   │   ├── prisma/
│   │   │   └── client.ts              # Prisma client singleton
│   │   ├── r2/
│   │   │   └── client.ts              # AWS SDK S3Client configured for R2
│   │   ├── razorpay/
│   │   │   ├── client.ts              # Razorpay SDK instance
│   │   │   └── plans.ts               # Plan IDs and configuration
│   │   ├── sentry/
│   │   │   └── init.ts                # Sentry initialization
│   │   ├── auth.ts                    # Session creation/verification helpers
│   │   ├── constants.ts               # App-wide constants
│   │   └── utils.ts                   # Utility functions (cn, formatBytes, etc.)
│   ├── hooks/
│   │   ├── use-auth.ts                # Auth state hook (wraps context)
│   │   ├── use-upload.ts              # Upload logic hook (presigned URL, progress)
│   │   ├── use-documents.ts           # Document CRUD queries (TanStack Query)
│   │   ├── use-folders.ts             # Folder CRUD queries
│   │   ├── use-subscription.ts        # Subscription status hook
│   │   ├── use-search.ts              # Debounced search hook
│   │   ├── use-pwa-install.ts         # PWA install prompt hook
│   │   └── use-media-query.ts         # Responsive breakpoint hook
│   ├── middleware.ts                   # Next.js middleware (auth + paywall + admin guard)
│   ├── types/
│   │   ├── index.ts                   # Shared type exports
│   │   ├── database.ts                # DB model types (mirrors Prisma)
│   │   ├── api.ts                     # API request/response types
│   │   └── razorpay.ts                # Razorpay webhook event types
│   └── config/
│       ├── site.ts                    # Site metadata (name, description, URLs)
│       └── navigation.ts             # Sidebar nav items configuration
```

---

## 2. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // Supabase requires this for migrations
}

// ──────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────
model User {
  id              String    @id @default(cuid())
  firebaseUid     String    @unique @map("firebase_uid")
  phone           String    @unique              // +91XXXXXXXXXX
  name            String?
  role            UserRole  @default(USER)
  isBlocked       Boolean   @default(false) @map("is_blocked")
  freeUploadUsed  Boolean   @default(false) @map("free_upload_used")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  folders         Folder[]
  documents       Document[]
  subscription    Subscription?
  payments        Payment[]

  @@map("users")
}

enum UserRole {
  USER
  ADMIN
}

// ──────────────────────────────────────────────
// FOLDERS
// ──────────────────────────────────────────────
model Folder {
  id          String    @id @default(cuid())
  name        String
  parentId    String?   @map("parent_id")
  userId      String    @map("user_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent      Folder?   @relation("FolderToFolder", fields: [parentId], references: [id], onDelete: Cascade)
  children    Folder[]  @relation("FolderToFolder")
  documents   Document[]

  @@index([userId])
  @@index([parentId])
  @@index([userId, parentId])
  @@map("folders")
}

// ──────────────────────────────────────────────
// DOCUMENTS
// ──────────────────────────────────────────────
model Document {
  id            String        @id @default(cuid())
  name          String                              // Original filename
  mimeType      String        @map("mime_type")     // application/pdf, image/jpeg, etc.
  size          BigInt                               // File size in bytes
  r2Key         String        @unique @map("r2_key") // Cloudflare R2 object key
  folderId      String?       @map("folder_id")
  userId        String        @map("user_id")
  isFavorite    Boolean       @default(false) @map("is_favorite")
  uploadedAt    DateTime      @default(now()) @map("uploaded_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  // Relations
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder        Folder?       @relation(fields: [folderId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([folderId])
  @@index([userId, isFavorite])
  @@index([userId, uploadedAt(sort: Desc)])
  @@index([userId, name])                            // For search
  @@map("documents")
}

// ──────────────────────────────────────────────
// SUBSCRIPTIONS
// ──────────────────────────────────────────────
model Subscription {
  id                    String              @id @default(cuid())
  userId                String              @unique @map("user_id")
  razorpaySubscriptionId String?            @unique @map("razorpay_subscription_id")
  razorpayCustomerId    String?             @map("razorpay_customer_id")
  planId                String              @map("plan_id")       // Razorpay plan ID
  status                SubscriptionStatus  @default(CREATED)
  currentPeriodStart    DateTime?           @map("current_period_start")
  currentPeriodEnd      DateTime?           @map("current_period_end")
  cancelledAt           DateTime?           @map("cancelled_at")
  createdAt             DateTime            @default(now()) @map("created_at")
  updatedAt             DateTime            @updatedAt @map("updated_at")

  // Relations
  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status])
  @@index([currentPeriodEnd])
  @@map("subscriptions")
}

enum SubscriptionStatus {
  CREATED       // Subscription created, payment pending
  AUTHENTICATED // Mandate authenticated (UPI/Card)
  ACTIVE        // Currently active and paid
  PENDING       // Payment pending for current cycle
  HALTED        // Payment failed, grace period
  CANCELLED     // User cancelled
  COMPLETED     // Subscription completed (not renewed)
  EXPIRED       // Admin/system expired
}

// ──────────────────────────────────────────────
// PAYMENTS
// ──────────────────────────────────────────────
model Payment {
  id                  String        @id @default(cuid())
  userId              String        @map("user_id")
  razorpayPaymentId   String?       @unique @map("razorpay_payment_id")
  razorpayOrderId     String?       @map("razorpay_order_id")
  razorpaySignature   String?       @map("razorpay_signature")
  amount              Int                                    // Amount in paise (59900 = Rs 599)
  currency            String        @default("INR")
  status              PaymentStatus @default(PENDING)
  method              String?                                // upi, card, netbanking, wallet
  paidAt              DateTime?     @map("paid_at")
  failedAt            DateTime?     @map("failed_at")
  createdAt           DateTime      @default(now()) @map("created_at")

  // Relations
  user                User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([paidAt])
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  FAILED
  REFUNDED
}
```

### Supabase-Specific Considerations

**Row Level Security (RLS) Policies** -- Since we are using Prisma as the ORM and Next.js API routes as the backend, RLS is not the primary access control mechanism. However, as a defense-in-depth measure, apply these RLS policies via raw SQL migration:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Service role bypass (Prisma connects with service role key)
-- The service_role key bypasses RLS by default in Supabase.
-- All access goes through API routes, so the service role is appropriate.

-- Optional additional safety: if you ever expose the Supabase client directly
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (firebase_uid = current_setting('app.current_user_firebase_uid', true));

CREATE POLICY "Users can read own folders" ON folders
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE firebase_uid = current_setting('app.current_user_firebase_uid', true)
  ));

CREATE POLICY "Users can read own documents" ON documents
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE firebase_uid = current_setting('app.current_user_firebase_uid', true)
  ));
```

**Indexes for Performance** (already declared in the Prisma schema above):

| Table | Index | Purpose |
|-------|-------|---------|
| `users` | `firebase_uid` (unique) | Firebase token lookup on every request |
| `folders` | `(user_id, parent_id)` | Folder listing for a user within a parent |
| `documents` | `(user_id, uploaded_at DESC)` | Recent uploads query |
| `documents` | `(user_id, is_favorite)` | Favorites filter |
| `documents` | `(user_id, name)` | Filename search |
| `subscriptions` | `razorpay_subscription_id` (unique) | Webhook lookup |
| `subscriptions` | `current_period_end` | Expiry checks |
| `payments` | `razorpay_payment_id` (unique) | Webhook deduplication |
| `payments` | `paid_at` | Revenue aggregation queries |

---

## 3. Authentication Flow

### Architecture: Firebase Phone OTP with Custom JWT Session

```
Client                    Server (API Routes)           Firebase Admin        Supabase (Prisma)
  |                             |                            |                     |
  |-- 1. Enter phone --------->|                             |                     |
  |    (Firebase client SDK     |                             |                     |
  |     sends OTP directly)    |                             |                     |
  |                             |                             |                     |
  |-- 2. Enter OTP ----------->|                             |                     |
  |    (Firebase client SDK     |                             |                     |
  |     verifies, returns       |                             |                     |
  |     idToken)               |                             |                     |
  |                             |                             |                     |
  |-- 3. POST /api/auth/login  |                             |                     |
  |    { idToken } ----------->|-- 4. verifyIdToken() ------>|                     |
  |                             |<-- firebaseUser ------------|                     |
  |                             |                             |                     |
  |                             |-- 5. upsert user -------------------------------->|
  |                             |    (find by firebase_uid,   |                     |
  |                             |     create if not exists)   |                     |
  |                             |<-- user record -----------------------------------|
  |                             |                             |                     |
  |                             |-- 6. Create session JWT     |                     |
  |                             |    (sign with app secret,   |                     |
  |                             |     contains: userId,       |                     |
  |                             |     role, phone)            |                     |
  |                             |                             |                     |
  |<-- 7. Set httpOnly cookie  |                             |                     |
  |    "doc2save_session"       |                             |                     |
  |    (maxAge: 7 days)         |                             |                     |
```

### Session Management Strategy

**Token**: Custom JWT signed with `SESSION_SECRET` env var (not Firebase token, which expires in 1 hour). The JWT contains:

```typescript
// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';

interface SessionPayload {
  userId: string;      // Prisma user.id (cuid)
  firebaseUid: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
}

// Create session: called after Firebase token verification
export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

// Verify session: called in middleware and API routes
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
```

**Cookie Configuration**:

```typescript
// In POST /api/auth/login route handler
cookies().set('doc2save_session', sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,  // 7 days
});
```

### Middleware for Protected Routes

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

const PUBLIC_PATHS = ['/', '/login', '/verify', '/api/auth/login', '/api/payments/webhook'];
const ADMIN_PATHS = ['/admin', '/api/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    // Exception: webhook must be public for Razorpay
    if (pathname === '/api/payments/webhook') return NextResponse.next();
    // Public pages
    if (!pathname.startsWith('/api/')) return NextResponse.next();
  }

  // Get session token
  const token = request.cookies.get('doc2save_session')?.value;
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify session
  const session = await verifySession(token);
  if (!session) {
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('doc2save_session');
    return response;
  }

  // Admin route guard
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    if (session.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Inject user info into headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.userId);
  requestHeaders.set('x-user-role', session.role);
  requestHeaders.set('x-user-phone', session.phone);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js).*)',
  ],
};
```

### Firebase Client-Side Integration

```typescript
// src/lib/firebase/client.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
```

```typescript
// src/lib/firebase/admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = getAuth();
```

---

## 4. File Storage Architecture

### Cloudflare R2 Bucket Structure

```
Bucket: doc2save-prod (or doc2save-dev)

Key format:
  users/{userId}/documents/{documentId}/{originalFilename}

Examples:
  users/clx1abc23def/documents/clx2ghi45jkl/property_deed.pdf
  users/clx1abc23def/documents/clx3mno67pqr/site_photo.jpg
```

Key design decisions:
- `userId` prefix enables per-user lifecycle policies if needed later
- `documentId` in path ensures uniqueness even if filenames collide
- Original filename preserved at the end for readability in R2 console

### R2 Client Configuration

```typescript
// src/lib/r2/client.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,           // https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;     // doc2save-prod

export async function generateUploadUrl(key: string, contentType: string, maxSize: number): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSize,   // Server-side size enforcement
  });
  return getSignedUrl(r2Client, command, { expiresIn: 600 }); // 10 minutes
}

export async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await r2Client.send(command);
}
```

### Upload Flow (Complete Sequence)

```
Client                         API Route                          R2
  |                              |                                 |
  |-- 1. Select file(s) ------->|                                 |
  |    (validate on client:      |                                 |
  |     type, size <= 50MB)      |                                 |
  |                              |                                 |
  |-- 2. POST /api/documents/upload                                |
  |    { fileName, mimeType,     |                                 |
  |      size, folderId? }       |                                 |
  |                              |-- 3. CHECK: user blocked?       |
  |                              |    CHECK: subscription active   |
  |                              |      OR freeUploadUsed=false?   |
  |                              |    CHECK: size <= 52428800?     |
  |                              |    CHECK: mimeType allowed?     |
  |                              |                                 |
  |                              |-- 4. Generate documentId (cuid) |
  |                              |    Build R2 key                 |
  |                              |    Generate presigned PUT URL   |
  |                              |                                 |
  |<-- 5. { uploadUrl,           |                                 |
  |         documentId, r2Key }  |                                 |
  |                              |                                 |
  |-- 6. PUT uploadUrl ------------------------------------------>|
  |    (direct upload to R2,     |                                 |
  |     with progress tracking   |                                 |
  |     via XMLHttpRequest)      |                                 |
  |                              |                                 |
  |-- 7. POST /api/documents/confirm                               |
  |    { documentId, r2Key,      |                                 |
  |      fileName, mimeType,     |                                 |
  |      size, folderId? }       |                                 |
  |                              |-- 8. HEAD object on R2 -------->|
  |                              |<-- Verify object exists --------|
  |                              |                                 |
  |                              |-- 9. Create Document record     |
  |                              |    in database.                 |
  |                              |    If first upload: set         |
  |                              |    freeUploadUsed = true        |
  |                              |                                 |
  |<-- 10. { document }          |                                 |
```

### 50MB Limit Enforcement

**Client-side** (first line of defense):
```typescript
// In upload-dialog.tsx
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return 'File exceeds 50MB limit';
  if (!ALLOWED_TYPES.includes(file.type)) return 'Unsupported file type';
  return null;
}
```

**Server-side** (in `/api/documents/upload`):
```typescript
if (size > 52_428_800) {
  return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 400 });
}
```

**R2 presigned URL** (ContentLength constraint in the PutObjectCommand).

### Preview / Download Flow

```typescript
// GET /api/documents/[documentId]/preview
// Returns a short-lived presigned GET URL (15 minutes for preview)
// The client uses this URL in:
//   - <iframe src={url}> for PDF (via PDF.js)
//   - <img src={url}> for images
//   - mammoth.js fetch(url) for DOCX

// GET /api/documents/[documentId]/download
// Returns a presigned GET URL (1 hour) with Content-Disposition: attachment
```

---

## 5. Subscription and Payment Flow

### Razorpay Integration Architecture

**Setup** (one-time, done in Razorpay Dashboard):
1. Create a Plan with `plan_id` = `plan_599_monthly`, amount = 59900 paise, period = monthly, interval = 1
2. Store the `plan_id` in environment variables

```typescript
// src/lib/razorpay/client.ts
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

```typescript
// src/lib/razorpay/plans.ts
export const PLAN = {
  id: process.env.RAZORPAY_PLAN_ID!,  // plan_XXXXXXXXXXXXX
  name: 'Doc2Save Monthly',
  amount: 59900,        // paise
  amountDisplay: 599,   // rupees
  currency: 'INR',
  period: 'monthly',
  interval: 1,
};
```

### Subscription Lifecycle

```
1. CREATE
   POST /api/subscription/create
   → razorpay.subscriptions.create({ plan_id, total_count: 120, customer_notify: 0 })
   → Save subscription record (status: CREATED)
   → Return subscription.id + subscription.short_url to client

2. AUTHENTICATE (Client-side)
   → Open Razorpay Checkout with subscription_id
   → User completes payment (UPI AutoPay mandate or card mandate)
   → Razorpay fires webhook: subscription.authenticated

3. ACTIVATE
   → Webhook: subscription.activated
   → Update status to ACTIVE
   → Set currentPeriodStart and currentPeriodEnd

4. CHARGE (recurring)
   → Webhook: subscription.charged
   → Create Payment record (status: CAPTURED)
   → Update currentPeriodEnd to next cycle

5. PAYMENT FAILURE
   → Webhook: subscription.pending
   → Update status to PENDING (grace period)
   → (Phase 2: send notification)

6. HALT (multiple failures)
   → Webhook: subscription.halted
   → Update status to HALTED
   → User enters read-only mode

7. CANCEL
   POST /api/subscription/cancel
   → razorpay.subscriptions.cancel(subscriptionId, { cancel_at_cycle_end: true })
   → Webhook: subscription.cancelled
   → User retains access until currentPeriodEnd
   → After that, read-only mode

8. COMPLETE
   → Webhook: subscription.completed
   → Update status to COMPLETED
   → Read-only mode
```

### Webhook Handler

```typescript
// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  // 1. Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);
  const eventType = event.event;

  // 2. Handle events
  switch (eventType) {
    case 'subscription.authenticated':
      await handleSubscriptionAuthenticated(event.payload);
      break;
    case 'subscription.activated':
      await handleSubscriptionActivated(event.payload);
      break;
    case 'subscription.charged':
      await handleSubscriptionCharged(event.payload);
      break;
    case 'subscription.pending':
      await handleSubscriptionPending(event.payload);
      break;
    case 'subscription.halted':
      await handleSubscriptionHalted(event.payload);
      break;
    case 'subscription.cancelled':
      await handleSubscriptionCancelled(event.payload);
      break;
    case 'subscription.completed':
      await handleSubscriptionCompleted(event.payload);
      break;
    case 'payment.captured':
      await handlePaymentCaptured(event.payload);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.payload);
      break;
    default:
      // Log unknown events but return 200 to prevent retries
      console.log(`Unhandled webhook event: ${eventType}`);
  }

  return NextResponse.json({ status: 'ok' });
}
```

### Free Tier Logic and Paywall Enforcement

The logic centers on two fields: `user.freeUploadUsed` and the subscription status.

```typescript
// Helper: called in POST /api/documents/upload
export function canUpload(user: User, subscription: Subscription | null): { allowed: boolean; reason?: string } {
  if (user.isBlocked) {
    return { allowed: false, reason: 'Account is blocked' };
  }

  // Free upload: user hasn't used their one free upload yet
  if (!user.freeUploadUsed) {
    return { allowed: true };
  }

  // Must have active subscription
  if (!subscription) {
    return { allowed: false, reason: 'Subscription required' };
  }

  if (subscription.status === 'ACTIVE') {
    return { allowed: true };
  }

  if (subscription.status === 'PENDING') {
    // Grace period: allow upload during pending payment
    return { allowed: true };
  }

  // HALTED, CANCELLED, COMPLETED, EXPIRED = read-only
  return { allowed: false, reason: 'Subscription expired. Renew to upload.' };
}
```

**Read-only mode** for expired subscriptions means:
- Can view/list all documents and folders
- Can download documents (presigned GET URL still generated)
- Can preview documents
- CANNOT upload new documents
- CANNOT create folders (optional: could allow, but keeping it strict)
- CAN delete documents (they own the data)
- CAN toggle favorites / search

This is enforced in the `/api/documents/upload` route and in the client-side `upload-button.tsx` which checks subscription status before showing the upload dialog.

---

## 6. Core Features Implementation

### Folder/Subfolder CRUD

**Data model**: Self-referential `Folder` table with `parentId`. `parentId = null` means root-level folder.

**API Routes**:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/folders` | GET | List root folders (`parentId IS NULL`) for the current user |
| `/api/folders` | POST | Create folder. Body: `{ name, parentId? }` |
| `/api/folders/[folderId]` | GET | Get folder details + children (subfolders and documents) |
| `/api/folders/[folderId]` | PATCH | Rename folder. Body: `{ name }` |
| `/api/folders/[folderId]` | DELETE | Delete folder + all nested contents (cascade) |
| `/api/folders/[folderId]/move` | PATCH | Move folder. Body: `{ newParentId }`. Must validate no circular references. |

**Breadcrumb Generation**: Query the folder and walk up via `parentId` to build the full path. Since nesting depth is practically limited (real estate agents won't nest more than 3-4 levels), a recursive CTE or simple loop is fine:

```typescript
async function getBreadcrumbs(folderId: string): Promise<{ id: string; name: string }[]> {
  const crumbs: { id: string; name: string }[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, parentId: true },
    });
    if (!folder) break;
    crumbs.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }

  return crumbs;
}
```

**Delete with cascade**: When deleting a folder, all sub-folders and documents within must also be deleted. Prisma's `onDelete: Cascade` handles the DB side. For R2, query all documents in the folder tree and delete their R2 objects:

```typescript
async function deletefolderContents(folderId: string): Promise<void> {
  // Get all document R2 keys in this folder tree (recursive)
  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { folderId },
        { folder: { parentId: folderId } },
        // For deeper nesting, use a recursive query or Prisma's nested relation
      ]
    },
    select: { r2Key: true },
  });

  // Delete from R2 in parallel (batches of 10)
  const batches = chunk(documents.map(d => d.r2Key), 10);
  for (const batch of batches) {
    await Promise.all(batch.map(key => deleteObject(key)));
  }

  // Prisma cascade handles DB deletion
  await prisma.folder.delete({ where: { id: folderId } });
}
```

### Document Preview

**PDF Preview** -- Use `react-pdf` (wrapper around PDF.js):

```typescript
// src/components/preview/pdf-viewer.tsx
'use client';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string; // presigned R2 URL
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);

  return (
    <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
      {Array.from({ length: numPages }, (_, i) => (
        <Page key={i + 1} pageNumber={i + 1} width={Math.min(window.innerWidth - 32, 800)} />
      ))}
    </Document>
  );
}
```

**Image Preview** -- Native `<img>` with zoom/pan via CSS transforms or a lightweight library like `react-zoom-pan-pinch`.

**DOCX Preview** -- Use `mammoth.js` to convert DOCX to HTML on the client:

```typescript
// src/components/preview/docx-viewer.tsx
'use client';
import mammoth from 'mammoth';

export function DocxViewer({ url }: { url: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch(url)
      .then(r => r.arrayBuffer())
      .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
      .then(result => setHtml(result.value));
  }, [url]);

  return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Search Implementation

Simple `ILIKE` search on the `documents.name` column (sufficient for Phase 1 with the index on `(user_id, name)`):

```typescript
// GET /api/documents/search?q=property+deed
const documents = await prisma.document.findMany({
  where: {
    userId: userId,
    name: { contains: query, mode: 'insensitive' },
  },
  orderBy: { uploadedAt: 'desc' },
  take: 50,
});
```

Client-side: Debounced search input (300ms) in the topbar that navigates to `/search?q=...`.

### Favorites System

Toggle endpoint `POST /api/documents/[documentId]/favorite`:

```typescript
await prisma.document.update({
  where: { id: documentId, userId },
  data: { isFavorite: { set: !currentValue } },  // Toggle
});
```

Favorites page queries: `where: { userId, isFavorite: true }`.

### Recent Uploads

Query: `where: { userId }, orderBy: { uploadedAt: 'desc' }, take: 20`.

No separate table needed. The `uploadedAt` index makes this fast.

---

## 7. Admin Panel

### Admin Authentication/Authorization

Admins are identified by `role: 'ADMIN'` in the `users` table. The first admin is created via `prisma/seed.ts`:

```typescript
// prisma/seed.ts
await prisma.user.upsert({
  where: { phone: '+91XXXXXXXXXX' },
  update: { role: 'ADMIN' },
  create: {
    firebaseUid: 'manually-set-firebase-uid',
    phone: '+91XXXXXXXXXX',
    name: 'Admin',
    role: 'ADMIN',
  },
});
```

The middleware (section 3) blocks non-ADMIN users from all `/admin/*` routes and `/api/admin/*` API routes.

### User Management

`GET /api/users` (admin only) -- Paginated user list with filters:

```typescript
const users = await prisma.user.findMany({
  where: {
    ...(search ? { phone: { contains: search } } : {}),
    ...(blocked !== undefined ? { isBlocked: blocked } : {}),
  },
  include: {
    subscription: { select: { status: true, currentPeriodEnd: true } },
    _count: { select: { documents: true } },
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * perPage,
  take: perPage,
});
```

`POST /api/users/[userId]/block` -- Toggle `isBlocked` flag.

`PATCH /api/users/[userId]` -- Admin can update user fields (name, role).

### Revenue Dashboard Data Aggregation

```typescript
// GET /api/admin/revenue?period=monthly&year=2026
// Returns aggregated revenue data

// Total revenue
const totalRevenue = await prisma.payment.aggregate({
  where: { status: 'CAPTURED' },
  _sum: { amount: true },
});

// Monthly breakdown
const monthlyRevenue = await prisma.$queryRaw`
  SELECT
    DATE_TRUNC('month', paid_at) as month,
    SUM(amount) as total,
    COUNT(*) as transaction_count
  FROM payments
  WHERE status = 'CAPTURED'
    AND EXTRACT(YEAR FROM paid_at) = ${year}
  GROUP BY DATE_TRUNC('month', paid_at)
  ORDER BY month
`;

// Active subscribers count
const activeSubscribers = await prisma.subscription.count({
  where: { status: 'ACTIVE' },
});

// New users this month
const newUsersThisMonth = await prisma.user.count({
  where: {
    createdAt: { gte: startOfMonth },
  },
});
```

### Report Export

CSV export via API route that streams data:

```typescript
// GET /api/admin/revenue?export=csv
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  if (searchParams.get('export') === 'csv') {
    const payments = await prisma.payment.findMany({
      where: { status: 'CAPTURED' },
      include: { user: { select: { phone: true, name: true } } },
      orderBy: { paidAt: 'desc' },
    });

    const csv = [
      'Date,User Phone,User Name,Amount (Rs),Method,Razorpay ID',
      ...payments.map(p =>
        `${p.paidAt?.toISOString()},${p.user.phone},${p.user.name || ''},${p.amount / 100},${p.method},${p.razorpayPaymentId}`
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="revenue-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  }
  // ... normal JSON response
}
```

---

## 8. PWA Configuration

### next.config.ts with Serwist

```typescript
// next.config.ts
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // ... other config
};

export default withSerwist(nextConfig);
```

### Service Worker Strategy

```typescript
// src/sw.ts
import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,  // Auto-injected by Serwist
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      // Cache API responses for offline viewing of document metadata
      urlPattern: /^\/api\/documents/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-documents',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 hour
      },
    },
    {
      // Cache static assets aggressively
      urlPattern: /\.(?:js|css|woff2?)$/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-assets' },
    },
  ],
});

serwist.addEventListeners();
```

### Manifest Configuration

```json
// public/manifest.json
{
  "name": "Doc2Save",
  "short_name": "Doc2Save",
  "description": "Cloud document storage for real estate professionals",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["business", "productivity"],
  "lang": "en-IN"
}
```

### Offline Behavior

- **Cached pages**: Dashboard, documents list, favorites (via NetworkFirst strategy -- show cached if offline, refresh when online)
- **Upload queue**: NOT in Phase 1. If offline, show a message "You are offline. Uploads require an internet connection."
- **Document preview**: Only works online (presigned URLs require network). Show clear offline indicator.
- **Navigation**: Shell (sidebar, topbar) cached via precache, so navigation works offline even if content is stale.

### Install Prompt Handling

```typescript
// src/hooks/use-pwa-install.ts
'use client';
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return { canInstall: !!deferredPrompt && !isInstalled, isInstalled, install };
}
```

Show a banner on the dashboard: "Install Doc2Save on your home screen for quick access" with an "Install" button. Dismiss after install or after 3 dismissals (tracked in localStorage).

---

## 9. Complete API Routes Reference

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/login` | POST | Public | Verify Firebase idToken, create session cookie |
| `/api/auth/logout` | POST | User | Clear session cookie |
| `/api/auth/session` | GET | User | Validate current session, return basic user info |
| `/api/auth/me` | GET | User | Full current user profile + subscription status |
| `/api/users/sync` | POST | User | Sync Firebase user to Supabase (called after first login) |
| `/api/users` | GET | Admin | List all users (paginated, filterable) |
| `/api/users/[userId]` | GET | Admin | Get single user detail |
| `/api/users/[userId]` | PATCH | Admin | Update user (name, role) |
| `/api/users/[userId]/block` | POST | Admin | Toggle block status |
| `/api/folders` | GET | User | List root folders for current user |
| `/api/folders` | POST | User | Create new folder |
| `/api/folders/[folderId]` | GET | User | Get folder contents (subfolders + documents) |
| `/api/folders/[folderId]` | PATCH | User | Rename folder |
| `/api/folders/[folderId]` | DELETE | User | Delete folder + all contents |
| `/api/folders/[folderId]/move` | PATCH | User | Move folder to new parent |
| `/api/documents` | GET | User | List documents (with optional folderId filter) |
| `/api/documents/upload` | POST | User | Get presigned upload URL (paywall checked) |
| `/api/documents/confirm` | POST | User | Confirm upload completed, save metadata |
| `/api/documents/recent` | GET | User | Get recent uploads (last 20) |
| `/api/documents/favorites` | GET | User | Get all favorited documents |
| `/api/documents/search` | GET | User | Search documents by name (?q=...) |
| `/api/documents/[documentId]` | GET | User | Get document metadata |
| `/api/documents/[documentId]` | DELETE | User | Permanently delete document |
| `/api/documents/[documentId]/download` | GET | User | Get presigned download URL |
| `/api/documents/[documentId]/preview` | GET | User | Get presigned preview URL |
| `/api/documents/[documentId]/favorite` | POST | User | Toggle favorite status |
| `/api/documents/[documentId]/move` | PATCH | User | Move document to folder |
| `/api/subscription` | GET | User | Get current subscription status |
| `/api/subscription/create` | POST | User | Create Razorpay subscription |
| `/api/subscription/cancel` | POST | User | Cancel subscription (at cycle end) |
| `/api/subscription/extend` | POST | Admin | Manually extend subscription |
| `/api/payments/webhook` | POST | Public | Razorpay webhook handler |
| `/api/admin/stats` | GET | Admin | Dashboard stats (user count, revenue, active subs) |
| `/api/admin/revenue` | GET | Admin | Revenue data (daily/monthly, CSV export) |

---

## 10. Phase-wise Implementation Order

### Week 1: Foundation

**Day 1-2: Project Setup**
1. `npx create-next-app@latest doc2save --typescript --tailwind --app --src-dir`
2. Install dependencies: `@supabase/supabase-js`, `prisma`, `@prisma/client`, `firebase`, `firebase-admin`, `jose`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `razorpay`, `@serwist/next`, `serwist`, `@tanstack/react-query`, `react-dropzone`, `react-pdf`, `mammoth`, `recharts`, `lucide-react`, `zod`
3. `npx shadcn@latest init` -- configure dark theme (zinc base, slate accent)
4. Add shadcn components: button, dialog, dropdown-menu, input, sheet, skeleton, toast, badge, card, table, separator, progress, alert-dialog, tabs, avatar, command, popover
5. Create `/src/lib/prisma/client.ts` (Prisma singleton)
6. Create `/prisma/schema.prisma` (full schema from section 2)
7. Run `npx prisma migrate dev --name init`
8. Create `.env.local` with all environment variables
9. Create `/src/lib/constants.ts` and `/src/config/site.ts`
10. Create `/src/types/index.ts`, `/src/types/database.ts`, `/src/types/api.ts`

**Day 3-4: Authentication**
11. Create `/src/lib/firebase/client.ts`
12. Create `/src/lib/firebase/admin.ts`
13. Create `/src/lib/auth.ts` (JWT session helpers)
14. Create `/src/middleware.ts`
15. Create `/src/app/api/auth/login/route.ts`
16. Create `/src/app/api/auth/logout/route.ts`
17. Create `/src/app/api/auth/session/route.ts`
18. Create `/src/app/api/auth/me/route.ts`
19. Create `/src/app/api/users/sync/route.ts`
20. Create `/src/components/providers/auth-provider.tsx`
21. Create `/src/hooks/use-auth.ts`
22. Create `/src/components/auth/phone-input.tsx`
23. Create `/src/components/auth/otp-input.tsx`
24. Create `/src/app/(auth)/layout.tsx`
25. Create `/src/app/(auth)/login/page.tsx`
26. Create `/src/app/(auth)/verify/page.tsx`

**Day 5: Layout Shell**
27. Create `/src/app/layout.tsx` (root: fonts, providers, metadata)
28. Create `/src/components/providers/query-provider.tsx`
29. Create `/src/components/providers/theme-provider.tsx`
30. Create `/src/components/layout/sidebar.tsx`
31. Create `/src/components/layout/topbar.tsx`
32. Create `/src/components/layout/mobile-nav.tsx`
33. Create `/src/components/layout/breadcrumbs.tsx`
34. Create `/src/app/(dashboard)/layout.tsx`
35. Create `/src/config/navigation.ts`
36. Create `/src/app/(dashboard)/dashboard/page.tsx` (placeholder)

### Week 2: File Storage and Upload

**Day 6-7: R2 + Upload**
37. Create `/src/lib/r2/client.ts`
38. Create `/src/app/api/documents/upload/route.ts`
39. Create `/src/app/api/documents/confirm/route.ts`
40. Create `/src/hooks/use-upload.ts`
41. Create `/src/components/documents/upload-dialog.tsx`
42. Create `/src/components/documents/upload-button.tsx`
43. Create `/src/components/documents/upload-progress.tsx`

**Day 8-9: Folder CRUD**
44. Create `/src/app/api/folders/route.ts`
45. Create `/src/app/api/folders/[folderId]/route.ts`
46. Create `/src/app/api/folders/[folderId]/move/route.ts`
47. Create `/src/hooks/use-folders.ts`
48. Create `/src/components/folders/folder-card.tsx`
49. Create `/src/components/folders/create-folder-dialog.tsx`
50. Create `/src/components/folders/folder-tree.tsx`
51. Create `/src/app/(dashboard)/documents/page.tsx`
52. Create `/src/app/(dashboard)/documents/[folderId]/page.tsx`

**Day 10: Document Operations**
53. Create `/src/app/api/documents/route.ts`
54. Create `/src/app/api/documents/[documentId]/route.ts`
55. Create `/src/app/api/documents/[documentId]/download/route.ts`
56. Create `/src/app/api/documents/[documentId]/preview/route.ts`
57. Create `/src/app/api/documents/[documentId]/favorite/route.ts`
58. Create `/src/app/api/documents/[documentId]/move/route.ts`
59. Create `/src/hooks/use-documents.ts`
60. Create `/src/components/documents/document-card.tsx`
61. Create `/src/components/documents/document-list.tsx`
62. Create `/src/components/documents/delete-dialog.tsx`
63. Create `/src/components/documents/move-dialog.tsx`
64. Create `/src/components/documents/rename-dialog.tsx`
65. Create `/src/components/documents/empty-state.tsx`
66. Create `/src/components/shared/file-icon.tsx`

### Week 3: Preview, Search, Subscription

**Day 11-12: Document Preview**
67. Create `/src/components/preview/pdf-viewer.tsx`
68. Create `/src/components/preview/image-viewer.tsx`
69. Create `/src/components/preview/docx-viewer.tsx`
70. Create `/src/app/(dashboard)/preview/[documentId]/page.tsx`

**Day 13: Search, Favorites, Recent**
71. Create `/src/app/api/documents/search/route.ts`
72. Create `/src/app/api/documents/recent/route.ts`
73. Create `/src/app/api/documents/favorites/route.ts`
74. Create `/src/hooks/use-search.ts`
75. Create `/src/components/shared/search-bar.tsx`
76. Create `/src/app/(dashboard)/search/page.tsx`
77. Create `/src/app/(dashboard)/favorites/page.tsx`
78. Create `/src/app/(dashboard)/recent/page.tsx`

**Day 14-15: Razorpay Subscription**
79. Create `/src/lib/razorpay/client.ts`
80. Create `/src/lib/razorpay/plans.ts`
81. Create `/src/app/api/subscription/route.ts`
82. Create `/src/app/api/subscription/create/route.ts`
83. Create `/src/app/api/subscription/cancel/route.ts`
84. Create `/src/app/api/payments/webhook/route.ts`
85. Create `/src/hooks/use-subscription.ts`
86. Create `/src/components/subscription/paywall-modal.tsx`
87. Create `/src/components/subscription/plan-card.tsx`
88. Create `/src/components/subscription/subscription-status.tsx`
89. Create `/src/components/subscription/razorpay-button.tsx`
90. Create `/src/app/(dashboard)/subscription/page.tsx`

### Week 4: Admin Panel, PWA, Polish

**Day 16-17: Admin Panel**
91. Create `/src/app/(admin)/layout.tsx`
92. Create `/src/components/layout/admin-sidebar.tsx`
93. Create `/src/app/api/admin/stats/route.ts`
94. Create `/src/app/api/admin/revenue/route.ts`
95. Create `/src/app/api/users/route.ts`
96. Create `/src/app/api/users/[userId]/route.ts`
97. Create `/src/app/api/users/[userId]/block/route.ts`
98. Create `/src/app/api/subscription/extend/route.ts`
99. Create `/src/components/admin/stats-cards.tsx`
100. Create `/src/components/admin/user-table.tsx`
101. Create `/src/components/admin/revenue-chart.tsx`
102. Create `/src/components/admin/user-detail-card.tsx`
103. Create `/src/app/(admin)/admin/page.tsx`
104. Create `/src/app/(admin)/admin/users/page.tsx`
105. Create `/src/app/(admin)/admin/users/[userId]/page.tsx`
106. Create `/src/app/(admin)/admin/subscriptions/page.tsx`
107. Create `/src/app/(admin)/admin/revenue/page.tsx`

**Day 18-19: PWA + Dashboard**
108. Create `/public/manifest.json`
109. Create `/src/sw.ts`
110. Configure `next.config.ts` with Serwist
111. Create PWA icons (all sizes)
112. Create `/src/hooks/use-pwa-install.ts`
113. Create `/src/components/shared/pwa-install-prompt.tsx`
114. Finalize `/src/app/(dashboard)/dashboard/page.tsx` (stats, recent files, quick actions)
115. Create `/src/app/(dashboard)/settings/page.tsx`

**Day 20: Sentry + Error Handling + Final Polish**
116. Configure Sentry (client, server, edge configs)
117. Create `/src/app/error.tsx` and `/src/app/global-error.tsx`
118. Create `/src/app/not-found.tsx`
119. Create `/src/app/loading.tsx`
120. Create `/src/app/page.tsx` (landing page -- simple marketing page with install CTA)
121. Create `prisma/seed.ts` (admin user)
122. Test full flow: signup, upload, preview, subscribe, admin

### Week 5: Testing, Deployment, Hardening

123. Write Zod validation schemas for all API request bodies
124. Add rate limiting to auth endpoints (simple in-memory or via Vercel edge config)
125. Test Razorpay webhooks with test mode
126. Test R2 uploads with various file types and sizes
127. Cross-browser testing (Chrome, Safari on iOS, Samsung Internet)
128. Lighthouse audit for PWA score
129. Deploy to Vercel
130. Configure Cloudflare DNS
131. Configure Razorpay production mode + webhook URL
132. Final smoke test on production

---

### Environment Variables Reference

```bash
# .env.local

# Supabase
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="doc2save.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="doc2save"

# Firebase Admin (server only)
FIREBASE_PROJECT_ID="doc2save"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@doc2save.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Session
SESSION_SECRET="a-long-random-string-at-least-32-chars"

# Cloudflare R2
R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="doc2save-prod"

# Razorpay
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
RAZORPAY_PLAN_ID="plan_..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."

# Sentry
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="sntrys_..."

# App
NEXT_PUBLIC_APP_URL="https://doc2save.in"
```

---

### Key Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.2",
    "@supabase/supabase-js": "^2",
    "@prisma/client": "^5",
    "firebase": "^10",
    "firebase-admin": "^12",
    "jose": "^5",
    "@aws-sdk/client-s3": "^3",
    "@aws-sdk/s3-request-presigner": "^3",
    "razorpay": "^2",
    "@serwist/next": "^9",
    "serwist": "^9",
    "@tanstack/react-query": "^5",
    "react-dropzone": "^14",
    "react-pdf": "^9",
    "mammoth": "^1",
    "recharts": "^2",
    "lucide-react": "^0.400",
    "zod": "^3",
    "next-themes": "^0.3",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "date-fns": "^3"
  },
  "devDependencies": {
    "prisma": "^5",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "tailwindcss": "^3.4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "^14",
    "@sentry/nextjs": "^8"
  }
}
```

---

### Critical Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ORM | Prisma over raw Supabase client | Type safety, migration management, query builder. Supabase client SDK used only for real-time if needed later. |
| Session | Custom JWT in httpOnly cookie | Firebase tokens expire in 1 hour, too short. Custom JWT gives us 7-day sessions with full control. |
| File upload | Presigned URL (direct to R2) | Avoids funneling file bytes through Next.js API routes. No 4.5MB Vercel body limit issue. Progress tracking works natively with XMLHttpRequest. |
| Search | PostgreSQL ILIKE | Sufficient for filename search at this scale. Full-text search (pg_trgm) can be added in Phase 2 if needed. |
| State management | TanStack Query + React Context | TanStack Query for server state (documents, folders, subscriptions). React Context only for auth state. No Zustand needed at this scale. |
| PWA framework | Serwist | Active maintenance (next-pwa is essentially unmaintained). Serwist is the spiritual successor with better Next.js App Router support. |
| Admin panel | Same Next.js app, route group | No separate admin app. Route group `(admin)` with middleware guard. Simpler deployment and shared auth. |
| DOCX preview | mammoth.js (client-side) | Converts DOCX to HTML in the browser. No server processing needed. Lightweight. |
| Delete strategy | Permanent delete, no trash | Client requirement. Confirmation dialog with document name re-typing for critical safety. |

### Critical Files for Implementation

- `/prisma/schema.prisma` - Core data model defining all tables, relationships, indexes, and enums for the entire application
- `/src/middleware.ts` - Central request interceptor handling authentication, admin authorization, and paywall enforcement across all routes
- `/src/app/api/payments/webhook/route.ts` - Razorpay webhook handler managing the entire subscription lifecycle (activation, charging, cancellation, failures)
- `/src/lib/r2/client.ts` - Cloudflare R2 integration providing presigned URL generation for uploads, downloads, and deletions
- `/src/app/api/documents/upload/route.ts` - Upload orchestrator that enforces file validation, free tier limits, subscription checks, and presigned URL generation

---

# Doc2Save -- Complete Frontend State Management & Component Architecture Plan

---

## 1. State Management Architecture

### 1.1 Decision: Zustand for Client State

**Recommendation: Zustand (not React Context, not both)**

**Justification:**

- **React Context** re-renders every consumer when any value in the context changes. For a mobile-first PWA where performance matters, this is a real problem. You would need to split into 5-6 separate contexts to avoid unnecessary re-renders, which adds boilerplate and nesting hell in the provider tree.
- **Zustand** provides selector-based subscriptions out of the box. Components only re-render when the specific slice of state they select changes. It requires zero providers (no wrapper components), works outside React (useful for utility functions), and has a tiny bundle size (~1KB).
- **Not both**: Using both Zustand and Context for different things creates confusion about where state lives. A single pattern is easier to maintain. TanStack Query handles all server state; Zustand handles all client-only state. Clean separation.

### 1.2 State Ownership Matrix

| State Category | Owner | Examples |
|---|---|---|
| Server data (documents, folders, users, subscription) | TanStack Query | Document lists, folder contents, user profile, subscription status |
| Auth session (current user identity) | Zustand `authStore` | userId, role, phone, isAuthenticated |
| UI state (modals, sidebars, view modes) | Zustand `uiStore` | sidebar open/closed, current modal, grid/list view |
| Upload state (active uploads, progress) | Zustand `uploadStore` | Upload queue, per-file progress, upload FSM state |
| Subscription client state (checkout flow) | Zustand `subscriptionStore` | Checkout open, Razorpay instance, FSM state |

### 1.3 Zustand Store Definitions

```typescript
// src/stores/auth-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  userId: string;
  firebaseUid: string;
  phone: string;
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
      auth: { status: 'idle' },

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
          : { auth: { status: 'unauthenticated' } },
    }
  )
);
```

```typescript
// src/stores/ui-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size';
type SortOrder = 'asc' | 'desc';

type ModalType =
  | { type: 'none' }
  | { type: 'upload'; folderId?: string }
  | { type: 'create-folder'; parentId?: string }
  | { type: 'rename-folder'; folderId: string; currentName: string }
  | { type: 'rename-document'; documentId: string; currentName: string }
  | { type: 'delete-document'; documentId: string; documentName: string }
  | { type: 'delete-folder'; folderId: string; folderName: string }
  | { type: 'move-document'; documentId: string }
  | { type: 'move-folder'; folderId: string }
  | { type: 'paywall' }
  | { type: 'pwa-install' };

interface UIStore {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // View preferences
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  setSort: (by: SortBy, order: SortOrder) => void;

  // Modal management
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Mobile bottom sheet
  mobileSheetOpen: boolean;
  mobileSheetContent: 'none' | 'folder-actions' | 'document-actions' | 'sort-options';
  openMobileSheet: (content: UIStore['mobileSheetContent']) => void;
  closeMobileSheet: () => void;

  // Selected items (for context menu, batch operations later)
  selectedDocumentId: string | null;
  selectedFolderId: string | null;
  selectDocument: (id: string | null) => void;
  selectFolder: (id: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
      sortBy: 'date',
      sortOrder: 'desc',
      setSort: (by, order) => set({ sortBy: by, sortOrder: order }),

      activeModal: { type: 'none' },
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: { type: 'none' } }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      mobileSheetOpen: false,
      mobileSheetContent: 'none',
      openMobileSheet: (content) =>
        set({ mobileSheetOpen: true, mobileSheetContent: content }),
      closeMobileSheet: () =>
        set({ mobileSheetOpen: false, mobileSheetContent: 'none' }),

      selectedDocumentId: null,
      selectedFolderId: null,
      selectDocument: (id) => set({ selectedDocumentId: id }),
      selectFolder: (id) => set({ selectedFolderId: id }),
    }),
    {
      name: 'doc2save-ui',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
```

```typescript
// src/stores/upload-store.ts

import { create } from 'zustand';

type UploadFileStatus =
  | 'pending'
  | 'validating'
  | 'requesting_url'
  | 'uploading'
  | 'confirming'
  | 'success'
  | 'error';

interface UploadFile {
  id: string;                    // client-generated UUID
  file: File;
  fileName: string;
  mimeType: string;
  size: number;
  folderId: string | null;
  status: UploadFileStatus;
  progress: number;              // 0-100
  error: string | null;
  documentId: string | null;     // set after presigned URL response
  r2Key: string | null;
  uploadUrl: string | null;
  abortController: AbortController | null;
}

type UploadFlowState =
  | 'idle'
  | 'selecting_files'
  | 'uploading'
  | 'complete';

interface UploadStore {
  flowState: UploadFlowState;
  files: UploadFile[];
  targetFolderId: string | null;

  // Actions
  setFlowState: (state: UploadFlowState) => void;
  setTargetFolder: (folderId: string | null) => void;
  addFiles: (files: UploadFile[]) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, update: Partial<UploadFile>) => void;
  clearCompleted: () => void;
  resetAll: () => void;

  // Computed
  hasActiveUploads: () => boolean;
  completedCount: () => number;
  totalCount: () => number;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  flowState: 'idle',
  files: [],
  targetFolderId: null,

  setFlowState: (state) => set({ flowState: state }),
  setTargetFolder: (folderId) => set({ targetFolderId: folderId }),

  addFiles: (files) =>
    set((s) => ({ files: [...s.files, ...files], flowState: 'uploading' })),

  removeFile: (id) => {
    const file = get().files.find((f) => f.id === id);
    if (file?.abortController) file.abortController.abort();
    set((s) => ({ files: s.files.filter((f) => f.id !== id) }));
  },

  updateFile: (id, update) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, ...update } : f)),
    })),

  clearCompleted: () =>
    set((s) => ({
      files: s.files.filter((f) => f.status !== 'success'),
      flowState: s.files.every((f) => f.status === 'success') ? 'idle' : s.flowState,
    })),

  resetAll: () =>
    set({ files: [], flowState: 'idle', targetFolderId: null }),

  hasActiveUploads: () =>
    get().files.some((f) =>
      ['pending', 'validating', 'requesting_url', 'uploading', 'confirming'].includes(f.status)
    ),

  completedCount: () =>
    get().files.filter((f) => f.status === 'success').length,

  totalCount: () => get().files.length,
}));
```

```typescript
// src/stores/subscription-store.ts

import { create } from 'zustand';

type CheckoutState =
  | 'idle'
  | 'creating_subscription'   // calling POST /api/subscription/create
  | 'checkout_open'            // Razorpay checkout modal is open
  | 'processing'               // payment submitted, waiting for confirmation
  | 'success'
  | 'error';

interface SubscriptionStore {
  checkoutState: CheckoutState;
  razorpaySubscriptionId: string | null;
  error: string | null;

  setCheckoutState: (state: CheckoutState) => void;
  setRazorpaySubscriptionId: (id: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  checkoutState: 'idle',
  razorpaySubscriptionId: null,
  error: null,

  setCheckoutState: (state) => set({ checkoutState: state }),
  setRazorpaySubscriptionId: (id) => set({ razorpaySubscriptionId: id }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ checkoutState: 'idle', razorpaySubscriptionId: null, error: null }),
}));
```

### 1.4 State Flow Between Components

The data flow follows a strict unidirectional pattern:

```
Server DB  <-->  API Routes  <-->  TanStack Query Cache  -->  Components
                                                                  |
                                                                  v
                                                          Zustand Stores (UI state)
                                                                  |
                                                                  v
                                                          User interactions --> Mutations --> Invalidate Queries
```

**Rules:**
1. Components NEVER directly call `fetch`. They use TanStack Query hooks or Zustand actions.
2. Mutations always go through TanStack Query `useMutation`, which handles optimistic updates and cache invalidation.
3. Zustand stores hold ONLY state that has no server representation: UI toggles, upload progress, modal state, view preferences.
4. The `authStore` is the single exception -- it mirrors server auth state on the client for immediate access without waiting for a query. It is hydrated on app mount by calling `GET /api/auth/me`.

---

## 2. Component State Machines (Finite State Machines)

### 2.1 Auth Flow FSM

**Implementation: `useReducer` inside `useAuthFlow` hook**

The auth flow is contained to the login/verify pages and runs once. A custom hook with `useReducer` is the right tool -- lightweight, no global store needed, and the flow is linear.

```typescript
// src/hooks/use-auth-flow.ts

type AuthFlowState =
  | { step: 'entering_phone' }
  | { step: 'sending_otp'; phone: string }
  | { step: 'waiting_otp'; phone: string; confirmationResult: ConfirmationResult }
  | { step: 'verifying_otp'; phone: string }
  | { step: 'syncing_session'; phone: string }
  | { step: 'authenticated' }
  | { step: 'error'; previousStep: string; error: string; phone?: string };

type AuthFlowEvent =
  | { type: 'SUBMIT_PHONE'; phone: string }
  | { type: 'OTP_SENT'; confirmationResult: ConfirmationResult }
  | { type: 'SUBMIT_OTP'; otp: string }
  | { type: 'OTP_VERIFIED'; idToken: string }
  | { type: 'SESSION_CREATED'; user: AuthUser }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'CHANGE_PHONE' };

// Transitions:
// entering_phone  --SUBMIT_PHONE-->      sending_otp
// sending_otp     --OTP_SENT-->          waiting_otp
// sending_otp     --ERROR-->             error
// waiting_otp     --SUBMIT_OTP-->        verifying_otp
// waiting_otp     --CHANGE_PHONE-->      entering_phone
// verifying_otp   --OTP_VERIFIED-->      syncing_session
// verifying_otp   --ERROR-->             error (can retry OTP)
// syncing_session --SESSION_CREATED-->   authenticated
// syncing_session --ERROR-->             error
// error           --RETRY-->             (returns to previousStep)
// error           --CHANGE_PHONE-->      entering_phone

// Side effects at transitions:
// SUBMIT_PHONE  -> call signInWithPhoneNumber(auth, phone, recaptchaVerifier)
// SUBMIT_OTP    -> call confirmationResult.confirm(otp)
// OTP_VERIFIED  -> call POST /api/auth/login { idToken }
// SESSION_CREATED -> update authStore, router.push('/dashboard')
// CHANGE_PHONE  -> reset RecaptchaVerifier
```

```typescript
function authFlowReducer(state: AuthFlowState, event: AuthFlowEvent): AuthFlowState {
  switch (state.step) {
    case 'entering_phone':
      if (event.type === 'SUBMIT_PHONE') {
        return { step: 'sending_otp', phone: event.phone };
      }
      break;

    case 'sending_otp':
      if (event.type === 'OTP_SENT') {
        return {
          step: 'waiting_otp',
          phone: state.phone,
          confirmationResult: event.confirmationResult,
        };
      }
      if (event.type === 'ERROR') {
        return { step: 'error', previousStep: 'sending_otp', error: event.error, phone: state.phone };
      }
      break;

    case 'waiting_otp':
      if (event.type === 'SUBMIT_OTP') {
        return { step: 'verifying_otp', phone: state.phone };
      }
      if (event.type === 'CHANGE_PHONE') {
        return { step: 'entering_phone' };
      }
      break;

    case 'verifying_otp':
      if (event.type === 'OTP_VERIFIED') {
        return { step: 'syncing_session', phone: state.phone };
      }
      if (event.type === 'ERROR') {
        return { step: 'error', previousStep: 'verifying_otp', error: event.error, phone: state.phone };
      }
      break;

    case 'syncing_session':
      if (event.type === 'SESSION_CREATED') {
        return { step: 'authenticated' };
      }
      if (event.type === 'ERROR') {
        return { step: 'error', previousStep: 'syncing_session', error: event.error, phone: state.phone };
      }
      break;

    case 'error':
      if (event.type === 'RETRY') {
        // Return to the step that failed
        if (state.previousStep === 'sending_otp') {
          return { step: 'sending_otp', phone: state.phone! };
        }
        if (state.previousStep === 'verifying_otp') {
          // Go back to waiting_otp so they can re-enter the code
          return { step: 'entering_phone' };
        }
        if (state.previousStep === 'syncing_session') {
          return { step: 'entering_phone' };
        }
      }
      if (event.type === 'CHANGE_PHONE') {
        return { step: 'entering_phone' };
      }
      break;
  }
  return state; // no-op for unhandled events
}
```

### 2.2 Upload Flow FSM

**Implementation: Zustand `uploadStore` (already defined above)**

The upload flow is global -- a user might navigate away from the upload dialog while uploads continue in the background. Zustand is the right choice.

Per-file state machine:

```
States: pending -> validating -> requesting_url -> uploading -> confirming -> success
                                                                           -> error
                       |              |               |            |
                       v              v               v            v
                     error          error           error        error

Events:
  START_VALIDATION   -> pending to validating
  VALIDATION_PASSED  -> validating to requesting_url
  VALIDATION_FAILED  -> validating to error { reason }
  URL_RECEIVED       -> requesting_url to uploading { uploadUrl, documentId, r2Key }
  URL_FAILED         -> requesting_url to error
  PROGRESS_UPDATE    -> uploading stays uploading { progress: 0-100 }
  UPLOAD_COMPLETE    -> uploading to confirming
  UPLOAD_FAILED      -> uploading to error
  CONFIRM_SUCCESS    -> confirming to success
  CONFIRM_FAILED     -> confirming to error
  RETRY              -> error to pending (re-queue)
  CANCEL             -> any to (removed from queue, abort controller fired)

Side effects:
  validating         -> check file type, size, check canUpload()
  requesting_url     -> POST /api/documents/upload
  uploading          -> XHR PUT to presigned URL, track progress via xhr.upload.onprogress
  confirming         -> POST /api/documents/confirm
  success            -> invalidate ['documents'] query, invalidate ['folders', folderId]
  error              -> toast notification
```

The actual upload orchestration lives in a custom hook:

```typescript
// src/hooks/use-upload.ts

import { useUploadStore } from '@/stores/upload-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface UseUploadReturn {
  addFilesToQueue: (files: File[], folderId?: string | null) => void;
  processQueue: () => Promise<void>;
  cancelUpload: (fileId: string) => void;
  retryUpload: (fileId: string) => void;
  clearCompleted: () => void;
}

export function useUpload(): UseUploadReturn {
  const store = useUploadStore();
  const queryClient = useQueryClient();

  const addFilesToQueue = (files: File[], folderId?: string | null) => {
    const uploadFiles: UploadFile[] = files.map((file) => ({
      id: uuidv4(),
      file,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      folderId: folderId ?? store.targetFolderId,
      status: 'pending',
      progress: 0,
      error: null,
      documentId: null,
      r2Key: null,
      uploadUrl: null,
      abortController: null,
    }));
    store.addFiles(uploadFiles);
  };

  const processQueue = async () => {
    const pending = store.files.filter((f) => f.status === 'pending');
    // Process up to 3 concurrent uploads
    const concurrency = 3;
    const batches = [];
    for (let i = 0; i < pending.length; i += concurrency) {
      batches.push(pending.slice(i, i + concurrency));
    }
    for (const batch of batches) {
      await Promise.allSettled(batch.map((f) => uploadSingleFile(f.id)));
    }
    store.setFlowState('complete');
  };

  // uploadSingleFile handles the full FSM for one file
  const uploadSingleFile = async (fileId: string) => {
    // 1. Validate
    store.updateFile(fileId, { status: 'validating' });
    const file = store.files.find((f) => f.id === fileId);
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      store.updateFile(fileId, { status: 'error', error: 'File exceeds 50MB limit' });
      return;
    }
    if (!ALLOWED_TYPES.includes(file.mimeType)) {
      store.updateFile(fileId, { status: 'error', error: 'Unsupported file type' });
      return;
    }

    // 2. Request presigned URL
    store.updateFile(fileId, { status: 'requesting_url' });
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.fileName,
          mimeType: file.mimeType,
          size: file.size,
          folderId: file.folderId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        store.updateFile(fileId, { status: 'error', error: data.error || 'Failed to get upload URL' });
        return;
      }
      const { uploadUrl, documentId, r2Key } = await res.json();
      store.updateFile(fileId, { uploadUrl, documentId, r2Key });
    } catch (err) {
      store.updateFile(fileId, { status: 'error', error: 'Network error' });
      return;
    }

    // 3. Upload to R2
    store.updateFile(fileId, { status: 'uploading', progress: 0 });
    const abortController = new AbortController();
    store.updateFile(fileId, { abortController });

    const currentFile = useUploadStore.getState().files.find((f) => f.id === fileId)!;
    try {
      await uploadWithProgress(
        currentFile.uploadUrl!,
        currentFile.file,
        currentFile.mimeType,
        abortController.signal,
        (progress) => store.updateFile(fileId, { progress })
      );
    } catch (err) {
      if (abortController.signal.aborted) return;
      store.updateFile(fileId, { status: 'error', error: 'Upload failed' });
      return;
    }

    // 4. Confirm
    store.updateFile(fileId, { status: 'confirming' });
    const latestFile = useUploadStore.getState().files.find((f) => f.id === fileId)!;
    try {
      const confirmRes = await fetch('/api/documents/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: latestFile.documentId,
          r2Key: latestFile.r2Key,
          fileName: latestFile.fileName,
          mimeType: latestFile.mimeType,
          size: latestFile.size,
          folderId: latestFile.folderId,
        }),
      });
      if (!confirmRes.ok) {
        store.updateFile(fileId, { status: 'error', error: 'Confirmation failed' });
        return;
      }
    } catch {
      store.updateFile(fileId, { status: 'error', error: 'Confirmation failed' });
      return;
    }

    // 5. Success
    store.updateFile(fileId, { status: 'success', progress: 100 });

    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    queryClient.invalidateQueries({ queryKey: ['folders', latestFile.folderId] });
    queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
    queryClient.invalidateQueries({ queryKey: ['user-profile'] }); // freeUploadUsed might have changed
  };

  // ... cancelUpload, retryUpload, clearCompleted implementations
  return { addFilesToQueue, processQueue, cancelUpload: store.removeFile, retryUpload: () => {}, clearCompleted: store.clearCompleted };
}

function uploadWithProgress(
  url: string,
  file: File,
  contentType: string,
  signal: AbortSignal,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error('Network error'));

    signal.addEventListener('abort', () => {
      xhr.abort();
      reject(new Error('Aborted'));
    });

    xhr.send(file);
  });
}
```

### 2.3 Subscription Flow FSM

**Implementation: Zustand `subscriptionStore` (already defined above)**

```
States:
  idle                  -> user is on subscription page, no checkout active
  creating_subscription -> POST /api/subscription/create in flight
  checkout_open         -> Razorpay modal is visible to user
  processing            -> Razorpay modal closed, handler callback received, verifying
  success               -> subscription activated
  error                 -> any step failed

Transitions:
  idle                  --INITIATE_CHECKOUT-->    creating_subscription
  creating_subscription --SUBSCRIPTION_CREATED--> checkout_open
  creating_subscription --ERROR-->                error
  checkout_open         --PAYMENT_SUCCESS-->       processing
  checkout_open         --PAYMENT_DISMISSED-->     idle (user closed modal)
  checkout_open         --PAYMENT_FAILED-->        error
  processing            --VERIFIED-->              success
  processing            --ERROR-->                 error
  success               --RESET-->                 idle
  error                 --RETRY-->                 idle

Side effects:
  creating_subscription -> POST /api/subscription/create, receive { subscriptionId, razorpayKeyId }
  checkout_open         -> instantiate Razorpay checkout with subscription_id, attach handlers
  processing            -> invalidate ['subscription'] query, poll or wait for webhook
  success               -> invalidate ['subscription'], invalidate ['user-profile'], show success toast
  error                 -> show error toast
```

The checkout orchestration hook:

```typescript
// src/hooks/use-razorpay-checkout.ts

import { useSubscriptionStore } from '@/stores/subscription-store';
import { useQueryClient } from '@tanstack/react-query';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
  prefill?: { contact?: string };
  theme?: { color?: string };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

export function useRazorpayCheckout() {
  const store = useSubscriptionStore();
  const queryClient = useQueryClient();

  const initiateCheckout = async (userPhone: string) => {
    store.setCheckoutState('creating_subscription');
    store.setError(null);

    try {
      const res = await fetch('/api/subscription/create', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create subscription');
      }
      const { subscriptionId, razorpayKeyId } = await res.json();
      store.setRazorpaySubscriptionId(subscriptionId);
      store.setCheckoutState('checkout_open');

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: 'Doc2Save',
        description: 'Monthly Subscription - Rs 599/mo',
        handler: async (response: RazorpayResponse) => {
          store.setCheckoutState('processing');
          // The webhook will handle the server-side update
          // We poll the subscription status
          await pollSubscriptionStatus(queryClient);
          store.setCheckoutState('success');
        },
        modal: {
          ondismiss: () => {
            store.setCheckoutState('idle');
          },
        },
        prefill: { contact: userPhone },
        theme: { color: '#000000' },
      });

      rzp.open();
    } catch (err) {
      store.setCheckoutState('error');
      store.setError(err instanceof Error ? err.message : 'Checkout failed');
    }
  };

  return { initiateCheckout, checkoutState: store.checkoutState, error: store.error, reset: store.reset };
}

async function pollSubscriptionStatus(queryClient: ReturnType<typeof useQueryClient>) {
  // Poll up to 10 times with 2s interval
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch('/api/subscription');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ACTIVE' || data.status === 'AUTHENTICATED') {
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        return;
      }
    }
  }
}
```

### 2.4 Document Preview FSM

**Implementation: Simple `useState` inside each viewer component**

Preview is local to the preview page. No global state needed.

```typescript
type PreviewState =
  | { status: 'loading_url' }               // fetching presigned URL from API
  | { status: 'loading_document'; url: string } // URL received, document loading
  | { status: 'loaded'; url: string }
  | { status: 'error'; error: string };

// In PdfViewer:
//   loading_url       --URL_RECEIVED-->       loading_document
//   loading_document  --DOCUMENT_LOADED-->     loaded
//   loading_document  --DOCUMENT_ERROR-->      error { "PDF failed to parse" }
//   loading_url       --URL_ERROR-->           error { "Could not generate preview URL" }

// In ImageViewer:
//   loading_url       --URL_RECEIVED-->       loading_document
//   loading_document  --IMG_ONLOAD-->          loaded
//   loading_document  --IMG_ONERROR-->         error

// In DocxViewer:
//   loading_url       --URL_RECEIVED-->       loading_document
//   loading_document  --MAMMOTH_CONVERTED-->   loaded
//   loading_document  --MAMMOTH_ERROR-->        error
```

### 2.5 Folder Navigation FSM

**Implementation: Derived from TanStack Query state**

This does not need a separate FSM. The TanStack Query for folder contents already provides `isLoading`, `isError`, `data` (which can be empty). The component maps these directly:

```typescript
// In documents/[folderId]/page.tsx
const { data, isLoading, isError, error } = useFolderContents(folderId);

// Derived state:
// isLoading = true                    -> "loading" state (show skeletons)
// isError = true                      -> "error" state (show error + retry)
// data && data.items.length === 0     -> "empty" state (show empty illustration)
// data && data.items.length > 0       -> "loaded" state (show grid/list)
```

---

## 3. Data Flow Diagrams

### 3.1 Login to Dashboard

```
User enters phone
  |
  v
PhoneInput component
  |-- dispatch({ type: 'SUBMIT_PHONE', phone })
  |-- useAuthFlow calls signInWithPhoneNumber(firebase, phone, recaptcha)
  |
  v
OtpInput component (waiting_otp)
  |-- User enters 6-digit OTP
  |-- dispatch({ type: 'SUBMIT_OTP', otp })
  |-- confirmationResult.confirm(otp) -> gets Firebase idToken
  |
  v
syncing_session state
  |-- POST /api/auth/login { idToken }
  |-- Server: verifyIdToken -> upsert user in DB -> create JWT session -> set httpOnly cookie
  |-- Response: { user: { userId, phone, role, name, freeUploadUsed } }
  |
  v
useAuthStore.setAuthenticated(user)
  |-- Zustand auth state = { status: 'authenticated', user: {...} }
  |-- persist to localStorage (for instant hydration on next visit)
  |
  v
router.push('/dashboard')
  |
  v
DashboardLayout mounts
  |-- useQuery(['user-profile']) -> GET /api/auth/me (re-validates auth store from server)
  |-- useQuery(['subscription']) -> GET /api/subscription (determines paywall state)
  |-- useQuery(['recent-documents']) -> GET /api/documents/recent
  |-- All queries run in parallel
```

### 3.2 Upload a Document

```
User clicks "Upload" button
  |
  v
UploadButton component
  |-- Check: auth.user.freeUploadUsed && subscription.status !== 'ACTIVE'?
  |   YES -> openModal({ type: 'paywall' })
  |   NO  -> openModal({ type: 'upload', folderId: currentFolderId })
  |
  v
UploadDialog opens (react-dropzone)
  |-- User drops/selects files
  |-- addFilesToQueue(files, folderId)
  |-- processQueue() starts
  |
  v
Per file: pending -> validating -> requesting_url -> uploading -> confirming -> success
  |                                                     |
  |  XHR PUT to presigned URL                          |
  |  progress events -> updateFile(id, { progress })   |
  |  UploadProgress component re-renders               |
  |                                                     |
  v                                                     v
On success:
  |-- queryClient.invalidateQueries(['documents'])
  |-- queryClient.invalidateQueries(['folders', folderId])
  |-- queryClient.invalidateQueries(['recent-documents'])
  |-- queryClient.invalidateQueries(['user-profile'])  // freeUploadUsed changed
  |-- Toast: "filename.pdf uploaded successfully"
```

### 3.3 Navigate into a Folder

```
User clicks FolderCard (folderId = "clx123...")
  |
  v
router.push(`/documents/${folderId}`)
  |
  v
documents/[folderId]/page.tsx mounts
  |-- useQuery(['folders', folderId, 'contents']) -> GET /api/folders/[folderId]
  |   Response: { folder, breadcrumbs, subfolders, documents }
  |
  v
Breadcrumbs component
  |-- receives breadcrumbs: [{ id: 'root', name: 'My Documents' }, { id: 'clxABC', name: 'Properties' }, ...]
  |-- Each breadcrumb is a Link to /documents or /documents/[id]
  |
  v
DocumentGrid / DocumentList (conditional on viewMode from uiStore)
  |-- Maps subfolders -> FolderCard[]
  |-- Maps documents -> DocumentCard[]
```

### 3.4 Subscribe via Razorpay

```
User clicks "Subscribe" on SubscriptionPage or PaywallModal
  |
  v
useRazorpayCheckout().initiateCheckout(userPhone)
  |
  v
subscriptionStore.checkoutState = 'creating_subscription'
  |-- POST /api/subscription/create
  |-- Server: razorpay.subscriptions.create({...}), save to DB
  |-- Response: { subscriptionId, razorpayKeyId }
  |
  v
subscriptionStore.checkoutState = 'checkout_open'
  |-- new Razorpay({ subscription_id, handler, ... }).open()
  |-- Razorpay modal appears (UPI / Card / Netbanking)
  |
  v
User completes payment
  |-- handler callback fires with { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }
  |-- subscriptionStore.checkoutState = 'processing'
  |
  v  (in parallel)
Razorpay sends webhook -> POST /api/payments/webhook
  |-- Server validates signature, updates Subscription to ACTIVE, creates Payment record
  |
  v
Client polls GET /api/subscription every 2s (up to 10 times)
  |-- When status = ACTIVE detected:
  |   queryClient.invalidateQueries(['subscription'])
  |   queryClient.invalidateQueries(['user-profile'])
  |   subscriptionStore.checkoutState = 'success'
  |   Toast: "Subscription activated!"
```

### 3.5 Toggle Favorite (Optimistic Update)

```
User clicks heart icon on DocumentCard
  |
  v
useFavoriteMutation.mutate({ documentId, isFavorite: !current })
  |
  |-- onMutate (optimistic):
  |   queryClient.setQueryData(['documents', ...], old => {
  |     return old.map(d => d.id === documentId ? { ...d, isFavorite: !d.isFavorite } : d)
  |   })
  |   queryClient.setQueryData(['favorite-documents'], old => {
  |     if (newValue) return [...old, document]
  |     else return old.filter(d => d.id !== documentId)
  |   })
  |   return { previousDocuments, previousFavorites }  // for rollback
  |
  v
POST /api/documents/[documentId]/favorite
  |
  |-- onError (rollback):
  |   queryClient.setQueryData(['documents', ...], context.previousDocuments)
  |   queryClient.setQueryData(['favorite-documents'], context.previousFavorites)
  |   Toast: "Failed to update favorite"
  |
  |-- onSuccess:
  |   // No invalidation needed, optimistic update is already correct
  |   // Optionally: queryClient.invalidateQueries(['favorite-documents']) for safety
```

### 3.6 Delete a Document

```
User clicks delete icon on DocumentCard
  |
  v
openModal({ type: 'delete-document', documentId, documentName })
  |
  v
DeleteDialog renders with confirmation text
  |-- "Permanently delete {documentName}? This cannot be undone."
  |
  v
User clicks "Delete"
  |
  v
useDeleteDocumentMutation.mutate({ documentId })
  |
  |-- onMutate:
  |   // Optimistically remove from all relevant query caches
  |   queryClient.setQueryData(['documents', ...], old => old.filter(d => d.id !== documentId))
  |   queryClient.setQueryData(['recent-documents'], old => old?.filter(d => d.id !== documentId))
  |   queryClient.setQueryData(['favorite-documents'], old => old?.filter(d => d.id !== documentId))
  |   closeModal()
  |
  v
DELETE /api/documents/[documentId]
  |-- Server: delete from R2, delete from DB
  |
  |-- onError:
  |   // Rollback all caches
  |   Toast: "Failed to delete document"
  |
  |-- onSuccess:
  |   Toast: "Document deleted"
  |   // Invalidate to ensure consistency
  |   queryClient.invalidateQueries({ queryKey: ['documents'] })
```

### 3.7 Search (Debounced)

```
User types in SearchBar (topbar)
  |
  v
useSearchQuery hook
  |-- Internal useState for inputValue
  |-- useDebouncedValue(inputValue, 300ms) -> debouncedQuery
  |
  v
When debouncedQuery changes and length >= 2:
  |-- router.push(`/search?q=${debouncedQuery}`) (if not already on search page)
  |-- OR: useQuery(['search-documents', debouncedQuery], enabled: debouncedQuery.length >= 2)
  |        -> GET /api/documents/search?q={debouncedQuery}
  |
  v
SearchPage reads `searchParams.q`
  |-- useQuery(['search-documents', q])
  |-- Renders DocumentGrid/DocumentList with results
  |-- Shows "No results found for '{q}'" empty state
```

---

## 4. TanStack Query Configuration

### 4.1 Query Key Structure

```typescript
// src/lib/query-keys.ts

export const queryKeys = {
  // Auth / User
  userProfile: ['user-profile'] as const,

  // Documents
  documents: {
    all: ['documents'] as const,
    list: (folderId: string | null) => ['documents', 'list', folderId] as const,
    detail: (documentId: string) => ['documents', 'detail', documentId] as const,
    recent: ['recent-documents'] as const,
    favorites: ['favorite-documents'] as const,
    search: (query: string) => ['search-documents', query] as const,
  },

  // Folders
  folders: {
    all: ['folders'] as const,
    root: ['folders', 'root'] as const,
    contents: (folderId: string) => ['folders', folderId, 'contents'] as const,
    tree: ['folders', 'tree'] as const, // for move dialog
  },

  // Subscription
  subscription: ['subscription'] as const,

  // Admin
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
```

### 4.2 Query Provider Configuration

```typescript
// src/components/providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2,       // 2 minutes default
            gcTime: 1000 * 60 * 10,          // 10 minutes garbage collection
            refetchOnWindowFocus: true,       // re-validate when user returns to tab
            refetchOnReconnect: true,         // re-validate when network reconnects
            retry: 2,                         // retry failed requests twice
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
          },
          mutations: {
            retry: 0,                         // do not retry mutations
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

### 4.3 All Queries Defined

```typescript
// src/hooks/use-user-profile.ts

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

interface UserProfile {
  userId: string;
  phone: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  freeUploadUsed: boolean;
  createdAt: string;
  documentCount: number;
  storageUsedBytes: number;
}

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: async (): Promise<UserProfile> => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,       // 5 min - user profile rarely changes
    gcTime: 1000 * 60 * 30,          // keep in cache 30 min
    refetchOnWindowFocus: false,      // no need to refetch profile on focus
  });
}
```

```typescript
// src/hooks/use-subscription.ts

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

interface SubscriptionData {
  id: string | null;
  status: 'NONE' | 'CREATED' | 'AUTHENTICATED' | 'ACTIVE' | 'PENDING' | 'HALTED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
  currentPeriodEnd: string | null;
  razorpaySubscriptionId: string | null;
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: async (): Promise<SubscriptionData> => {
      const res = await fetch('/api/subscription');
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,       // 5 min
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,       // important: check subscription when user returns
    refetchInterval: 1000 * 60 * 10,  // poll every 10 min in case webhook updated it
  });
}

// Derived helper
export function useCanUpload(): { canUpload: boolean; reason?: string } {
  const { data: profile } = useUserProfile();
  const { data: subscription } = useSubscription();

  if (!profile) return { canUpload: false, reason: 'Loading...' };

  if (!profile.freeUploadUsed) return { canUpload: true };

  if (!subscription || subscription.status === 'NONE') {
    return { canUpload: false, reason: 'Subscribe to upload more documents' };
  }

  if (subscription.status === 'ACTIVE' || subscription.status === 'PENDING') {
    return { canUpload: true };
  }

  return { canUpload: false, reason: 'Your subscription has expired. Renew to upload.' };
}
```

```typescript
// src/hooks/use-documents.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

interface Document {
  id: string;
  name: string;
  mimeType: string;
  size: number;        // BigInt serialized as number
  folderId: string | null;
  isFavorite: boolean;
  uploadedAt: string;
  thumbnailUrl?: string;
}

// LIST documents in a folder (or root)
export function useDocuments(folderId: string | null) {
  return useQuery({
    queryKey: queryKeys.documents.list(folderId),
    queryFn: async (): Promise<Document[]> => {
      const url = folderId
        ? `/api/folders/${folderId}`
        : '/api/documents';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      return folderId ? data.documents : data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// RECENT documents
export function useRecentDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.recent,
    queryFn: async (): Promise<Document[]> => {
      const res = await fetch('/api/documents/recent');
      if (!res.ok) throw new Error('Failed to fetch recent documents');
      return res.json();
    },
    staleTime: 1000 * 60 * 1,  // 1 min - recent list changes often
  });
}

// FAVORITE documents
export function useFavoriteDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.favorites,
    queryFn: async (): Promise<Document[]> => {
      const res = await fetch('/api/documents/favorites');
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
}

// SEARCH documents
export function useSearchDocuments(query: string) {
  return useQuery({
    queryKey: queryKeys.documents.search(query),
    queryFn: async (): Promise<Document[]> => {
      const res = await fetch(`/api/documents/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 5,       // shorter GC for search results
  });
}

// TOGGLE FAVORITE mutation
export function useFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId }: { documentId: string }) => {
      const res = await fetch(`/api/documents/${documentId}/favorite`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to toggle favorite');
      return res.json();
    },
    onMutate: async ({ documentId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.favorites });

      // Snapshot previous values
      const previousFavorites = queryClient.getQueryData(queryKeys.documents.favorites);

      // Optimistically update across all document list caches
      queryClient.setQueriesData(
        { queryKey: queryKeys.documents.all },
        (old: Document[] | undefined) =>
          old?.map((d) =>
            d.id === documentId ? { ...d, isFavorite: !d.isFavorite } : d
          )
      );

      return { previousFavorites };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.documents.favorites, context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.favorites });
    },
  });
}

// DELETE document mutation
export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId }: { documentId: string }) => {
      const res = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete document');
    },
    onMutate: async ({ documentId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.all });

      // Snapshot for rollback
      const snapshots = new Map<readonly unknown[], Document[] | undefined>();

      queryClient.getQueriesData({ queryKey: queryKeys.documents.all }).forEach(([key, data]) => {
        snapshots.set(key, data as Document[] | undefined);
      });

      // Optimistically remove from all caches
      queryClient.setQueriesData(
        { queryKey: queryKeys.documents.all },
        (old: Document[] | undefined) => old?.filter((d) => d.id !== documentId)
      );
      queryClient.setQueryData(
        queryKeys.documents.recent,
        (old: Document[] | undefined) => old?.filter((d) => d.id !== documentId)
      );
      queryClient.setQueryData(
        queryKeys.documents.favorites,
        (old: Document[] | undefined) => old?.filter((d) => d.id !== documentId)
      );

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      // Rollback all snapshots
      context?.snapshots.forEach((data, key) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.recent });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.favorites });
    },
  });
}
```

```typescript
// src/hooks/use-folders.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  _count: { documents: number; children: number };
}

interface FolderContents {
  folder: Folder;
  breadcrumbs: { id: string; name: string }[];
  subfolders: Folder[];
  documents: Document[];
}

export function useRootFolders() {
  return useQuery({
    queryKey: queryKeys.folders.root,
    queryFn: async (): Promise<Folder[]> => {
      const res = await fetch('/api/folders');
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useFolderContents(folderId: string) {
  return useQuery({
    queryKey: queryKeys.folders.contents(folderId),
    queryFn: async (): Promise<FolderContents> => {
      const res = await fetch(`/api/folders/${folderId}`);
      if (!res.ok) throw new Error('Failed to fetch folder contents');
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Folder tree for move dialog
export function useFolderTree() {
  return useQuery({
    queryKey: queryKeys.folders.tree,
    queryFn: async (): Promise<Folder[]> => {
      const res = await fetch('/api/folders?tree=true');
      if (!res.ok) throw new Error('Failed to fetch folder tree');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId?: string | null }) => {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId }),
      });
      if (!res.ok) throw new Error('Failed to create folder');
      return res.json();
    },
    onSuccess: (_data, { parentId }) => {
      // Invalidate the parent's contents (or root list)
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.contents(parentId) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.root });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.tree });
    },
  });
}

export function useRenameFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, name }: { folderId: string; name: string }) => {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to rename folder');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useDeleteFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId }: { folderId: string }) => {
      const res = await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete folder');
    },
    onSuccess: () => {
      // Broad invalidation -- deleting a folder affects many caches
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.recent });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.favorites });
    },
  });
}
```

### 4.4 Cache Invalidation Cascade Table

| Action | Queries Invalidated |
|---|---|
| Upload document | `documents.list(folderId)`, `documents.recent`, `user-profile` |
| Delete document | `documents.list(folderId)`, `documents.recent`, `documents.favorites` |
| Toggle favorite | `documents.favorites` (optimistic + settle) |
| Create folder | `folders.root` OR `folders.contents(parentId)`, `folders.tree` |
| Rename folder | `folders.all` (broad) |
| Delete folder | `folders.all`, `documents.all`, `documents.recent`, `documents.favorites` |
| Move document | `documents.list(oldFolderId)`, `documents.list(newFolderId)` |
| Subscribe success | `subscription`, `user-profile` |
| Cancel subscription | `subscription` |
| Login | ALL (via `queryClient.clear()` before populating) |
| Logout | ALL (via `queryClient.clear()`) |

---

## 5. Component Hierarchy & Props Flow

### 5.1 Login Page

```
(auth)/login/page.tsx
  |-- LoginCard
  |   |-- PhoneInput
  |   |   props: { onSubmit: (phone: string) => void, disabled: boolean }
  |   |   hooks: none (controlled input)
  |   |
  |   |-- OtpInput (conditionally rendered when step = 'waiting_otp')
  |   |   props: { onSubmit: (otp: string) => void, onResend: () => void, onChangePhone: () => void, phone: string, disabled: boolean }
  |   |   hooks: none (controlled input, auto-focus)
  |   |
  |   |-- ErrorAlert (conditionally rendered when step = 'error')
  |   |   props: { message: string, onRetry: () => void }
  |   |
  |   hooks: useAuthFlow (manages the entire FSM)
  |          useRouter (redirect on success)
  |          useAuthStore (setAuthenticated on success)
```

### 5.2 Dashboard Page

```
(dashboard)/layout.tsx
  |-- AuthGuard (wraps children, redirects if unauthenticated)
  |   hooks: useAuthStore, useUserProfile
  |
  |-- Sidebar (desktop)
  |   props: none
  |   hooks: useUIStore (sidebarOpen), useAuthStore (user.role for admin link)
  |   children:
  |     |-- NavItem[] (Dashboard, Documents, Favorites, Recent, Subscription)
  |     |-- AdminNavItem (conditional on role === 'ADMIN')
  |
  |-- MobileNav (mobile bottom bar)
  |   props: none
  |   hooks: usePathname (active route highlighting)
  |
  |-- Topbar
  |   props: none
  |   hooks: useUIStore (toggleSidebar, searchQuery, setSearchQuery)
  |   children:
  |     |-- SidebarToggle
  |     |-- SearchBar
  |     |   props: none
  |     |   hooks: useUIStore (searchQuery, setSearchQuery), useRouter, useDebouncedValue
  |     |-- UserMenu (dropdown)
  |     |   hooks: useAuthStore (user), useRouter (logout redirect)
  |
  |-- {children} (page content)

(dashboard)/dashboard/page.tsx
  |-- DashboardContent
  |   hooks: useUserProfile, useSubscription, useRecentDocuments
  |   children:
  |     |-- WelcomeCard
  |     |   props: { userName: string | null, phone: string }
  |     |
  |     |-- StatsRow
  |     |   props: { documentCount: number, storageUsed: number, subscriptionStatus: string }
  |     |   children:
  |     |     |-- StatCard (x3)
  |     |     |   props: { label: string, value: string | number, icon: ReactNode }
  |     |
  |     |-- SubscriptionBanner (shown if not subscribed or expired)
  |     |   props: { status: SubscriptionStatus, onSubscribe: () => void }
  |     |   hooks: useUIStore (openModal({ type: 'paywall' }))
  |     |
  |     |-- RecentUploadsSection
  |     |   props: { documents: Document[], isLoading: boolean }
  |     |   children:
  |     |     |-- DocumentCard[]
  |     |         props: { document: Document, onFavorite: () => void, onDelete: () => void, onPreview: () => void }
  |     |
  |     |-- QuickActions
  |     |   props: none
  |     |   hooks: useCanUpload, useUIStore (openModal)
  |     |   children:
  |     |     |-- UploadButton
  |     |     |-- CreateFolderButton
  |     |
  |     |-- PwaInstallPrompt
  |     |   hooks: usePwaInstall
```

### 5.3 Documents Page (Folder View)

```
(dashboard)/documents/page.tsx  (root)
  |-- FolderView
  |   props: { folderId: null }
  |   hooks: useRootFolders, useDocuments(null), useUIStore (viewMode, sortBy, sortOrder)
  |   children: (same as below)

(dashboard)/documents/[folderId]/page.tsx
  |-- FolderView
  |   props: { folderId: string }
  |   hooks: useFolderContents(folderId), useUIStore
  |   children:
  |     |-- Breadcrumbs
  |     |   props: { breadcrumbs: { id: string, name: string }[] }
  |     |
  |     |-- FolderToolbar
  |     |   props: none
  |     |   hooks: useUIStore (viewMode, setViewMode, sortBy, setSort), useCanUpload
  |     |   children:
  |     |     |-- ViewModeToggle (grid/list)
  |     |     |-- SortDropdown
  |     |     |-- UploadButton
  |     |     |   props: { folderId: string | null }
  |     |     |   hooks: useCanUpload, useUIStore (openModal)
  |     |     |-- CreateFolderButton
  |     |
  |     |-- (conditional) EmptyState
  |     |   props: { type: 'folder' | 'documents' }
  |     |
  |     |-- FolderGrid (subfolders section)
  |     |   props: { folders: Folder[] }
  |     |   children:
  |     |     |-- FolderCard[]
  |     |         props: { folder: Folder, onRename: () => void, onDelete: () => void, onMove: () => void }
  |     |         hooks: useRouter (navigate on click), useUIStore (selectFolder, openMobileSheet)
  |     |
  |     |-- DocumentGrid / DocumentList (documents section)
  |     |   props: { documents: Document[], viewMode: 'grid' | 'list' }
  |     |   children:
  |     |     |-- DocumentCard[]
  |     |         props: { document: Document, viewMode: 'grid' | 'list' }
  |     |         hooks: useFavoriteMutation, useUIStore (selectDocument, openModal for delete/move)
  |     |         children:
  |     |           |-- FileIcon
  |     |           |   props: { mimeType: string }
  |     |           |-- DocumentActions (dropdown)
  |     |           |   props: { documentId: string, isFavorite: boolean, onFavorite, onDelete, onMove, onPreview, onDownload }
```

### 5.4 Document Preview Page

```
(dashboard)/preview/[documentId]/page.tsx
  |-- PreviewPage
  |   hooks: useQuery(['documents', 'detail', documentId]), useQuery for presigned preview URL
  |   children:
  |     |-- PreviewHeader
  |     |   props: { document: Document, onBack: () => void, onDownload: () => void }
  |     |
  |     |-- (conditional on mimeType)
  |     |   |-- PdfViewer
  |     |   |   props: { url: string }
  |     |   |   hooks: useState (numPages, currentPage, scale), react-pdf Document/Page
  |     |   |   state: PreviewState FSM (internal)
  |     |   |
  |     |   |-- ImageViewer
  |     |   |   props: { url: string, alt: string }
  |     |   |   hooks: useState (zoom, position)
  |     |   |   state: PreviewState FSM (internal)
  |     |   |
  |     |   |-- DocxViewer
  |     |       props: { url: string }
  |     |       hooks: useState (html content), useEffect (mammoth conversion)
  |     |       state: PreviewState FSM (internal)
  |     |
  |     |-- LoadingSkeleton (while preview state = loading)
  |     |-- ErrorState (while preview state = error)
  |     |   props: { error: string, onRetry: () => void }
```

### 5.5 Favorites Page

```
(dashboard)/favorites/page.tsx
  |-- FavoritesContent
  |   hooks: useFavoriteDocuments, useUIStore (viewMode)
  |   children:
  |     |-- PageHeader
  |     |   props: { title: "Favorites", count: number }
  |     |
  |     |-- (conditional) EmptyState
  |     |   props: { type: 'favorites', message: "No favorited documents yet" }
  |     |
  |     |-- DocumentGrid / DocumentList
  |         props: { documents: Document[], viewMode }
```

### 5.6 Search Page

```
(dashboard)/search/page.tsx
  |-- SearchContent
  |   hooks: useSearchParams, useSearchDocuments(q)
  |   children:
  |     |-- SearchHeader
  |     |   props: { query: string, resultCount: number }
  |     |
  |     |-- (conditional) EmptyState
  |     |   props: { type: 'search', message: "No results for '{q}'" }
  |     |
  |     |-- DocumentGrid / DocumentList
  |         props: { documents: Document[], viewMode }
```

### 5.7 Subscription Page

```
(dashboard)/subscription/page.tsx
  |-- SubscriptionContent
  |   hooks: useSubscription, useUserProfile, useRazorpayCheckout
  |   children:
  |     |-- (if no subscription or expired)
  |     |   PlanCard
  |     |     props: { plan: { name, price, features[] }, onSubscribe: () => void, isLoading: boolean }
  |     |
  |     |-- (if active)
  |     |   SubscriptionDetails
  |     |     props: { subscription: SubscriptionData }
  |     |     children:
  |     |       |-- StatusBadge
  |     |       |   props: { status: SubscriptionStatus }
  |     |       |-- PeriodInfo
  |     |       |   props: { currentPeriodEnd: string }
  |     |       |-- CancelButton
  |     |       |   props: { onCancel: () => void }
  |     |       |   hooks: useCancelSubscriptionMutation
  |     |
  |     |-- (if checkoutState !== 'idle')
  |     |   CheckoutOverlay
  |     |     props: { state: CheckoutState, error: string | null, onRetry: () => void }
```

### 5.8 Admin Dashboard Page

```
(admin)/admin/page.tsx
  |-- AdminDashboard
  |   hooks: useAdminStats
  |   children:
  |     |-- StatsCards
  |     |   props: { stats: { totalUsers, activeSubscribers, monthlyRevenue, totalDocuments } }
  |     |   children:
  |     |     |-- StatCard (x4)
  |     |
  |     |-- RevenueChart
  |     |   props: { data: { month: string, revenue: number }[] }
  |     |   hooks: useAdminRevenue (period, year)
  |     |   library: recharts (BarChart or LineChart)
  |     |
  |     |-- RecentUsersTable (mini)
  |     |   props: { users: AdminUser[], limit: 5 }
```

### 5.9 Admin Users Page

```
(admin)/admin/users/page.tsx
  |-- AdminUsersPage
  |   hooks: useAdminUsers({ page, search, blocked }), useState for filters
  |   children:
  |     |-- UserFilters
  |     |   props: { search, onSearchChange, blocked, onBlockedChange }
  |     |
  |     |-- UserTable
  |     |   props: { users: AdminUser[], isLoading: boolean }
  |     |   children:
  |     |     |-- UserTableRow[]
  |     |         props: { user: AdminUser, onBlock: () => void, onView: () => void }
  |     |
  |     |-- Pagination
  |         props: { page: number, totalPages: number, onPageChange: (page: number) => void }
```

---

## 6. Client-Side Route Guards & Middleware

### 6.1 Server-Side Middleware (already defined in the blueprint)

The Next.js `middleware.ts` (at `/Users/pulse/Desktop/doc2save/IMPLEMENTATION_BLUEPRINT.md`, section 3) handles:
- Redirecting unauthenticated users away from `/dashboard/*`
- Redirecting non-admin users away from `/admin/*`
- Injecting `x-user-id`, `x-user-role` headers into requests

### 6.2 Client-Side Auth Guard

The server middleware handles the hard redirect, but we also need a client-side guard for the app shell to avoid flash-of-wrong-content:

```typescript
// src/components/auth/auth-guard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUserProfile } from '@/hooks/use-user-profile';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);
  const { data: profile, isLoading, isError } = useUserProfile();

  useEffect(() => {
    // If Zustand says unauthenticated and we finished loading
    if (auth.status === 'unauthenticated' && !isLoading) {
      router.replace('/login');
      return;
    }

    // If server confirms no auth
    if (isError) {
      useAuthStore.getState().setUnauthenticated();
      router.replace('/login');
      return;
    }

    // Admin guard
    if (requireAdmin && profile && profile.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [auth.status, isLoading, isError, profile, requireAdmin, router]);

  // Sync server profile to Zustand on first load
  useEffect(() => {
    if (profile && auth.status !== 'authenticated') {
      useAuthStore.getState().setAuthenticated({
        userId: profile.userId,
        firebaseUid: '', // not needed client-side after login
        phone: profile.phone,
        role: profile.role,
        name: profile.name,
        freeUploadUsed: profile.freeUploadUsed,
      });
    }
  }, [profile, auth.status]);

  if (isLoading || auth.status === 'idle' || auth.status === 'loading') {
    return <DashboardSkeleton />;  // Full page skeleton
  }

  if (auth.status === 'unauthenticated' || isError) {
    return null; // Redirect is happening
  }

  return <>{children}</>;
}
```

### 6.3 Paywall Enforcement on Client

The paywall check is implemented as a hook, not a guard component. The reason: the paywall does not block page access, it blocks the upload action.

```typescript
// src/hooks/use-can-upload.ts (already shown in section 4.3)

// Usage in UploadButton:
function UploadButton({ folderId }: { folderId?: string }) {
  const { canUpload, reason } = useCanUpload();
  const { openModal } = useUIStore();

  const handleClick = () => {
    if (!canUpload) {
      openModal({ type: 'paywall' });
      return;
    }
    openModal({ type: 'upload', folderId });
  };

  return (
    <Button onClick={handleClick}>
      <UploadIcon className="mr-2 h-4 w-4" />
      Upload
    </Button>
  );
}
```

### 6.4 Subscription Status Propagation

Subscription status is available to every component through `useSubscription()`. Because TanStack Query is a singleton cache, every component calling `useSubscription()` reads from the same cache entry. When any mutation invalidates the `['subscription']` key, all consumers re-render with fresh data.

To handle **stale subscription status**, the subscription query is configured with:
1. `refetchOnWindowFocus: true` -- re-checks when user returns to the app (common on mobile PWA)
2. `refetchInterval: 10 * 60 * 1000` -- polls every 10 minutes as a backstop
3. After any payment flow, explicit `invalidateQueries(['subscription'])`

For truly critical checks (upload permission), the server re-validates on every `POST /api/documents/upload` call regardless of client state.

---

## 7. Responsive Layout State

### 7.1 Breakpoint Strategy

Use Tailwind's default breakpoints with a custom hook for JS-side decisions:

```typescript
// src/hooks/use-media-query.ts
'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 768px)');  // md breakpoint
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');  // lg breakpoint
}
```

### 7.2 Layout Behavior Matrix

| Component | Mobile (< 768px) | Tablet (768-1023px) | Desktop (>= 1024px) |
|---|---|---|---|
| Sidebar | Hidden, opens as Sheet overlay | Collapsed icon rail | Full sidebar, collapsible |
| Bottom Nav | Visible (5 icons) | Hidden | Hidden |
| Topbar | Search icon (expands), hamburger | Full search bar, hamburger | Full search bar, no hamburger |
| Document Grid | 1 column | 2 columns | 3-4 columns |
| Document List | Full width rows | Full width rows | Full width rows |
| Upload Dialog | Full-screen Sheet | Centered Dialog (lg) | Centered Dialog (lg) |
| Preview | Full-screen | Full-screen with sidebar | Side panel or full-screen |
| Folder Actions | Bottom Sheet | Dropdown menu | Dropdown menu |
| Document Actions | Bottom Sheet (long press) | Dropdown menu (right click/kebab) | Dropdown menu |

### 7.3 Sidebar Implementation

```typescript
// src/components/layout/sidebar.tsx
'use client';

import { useIsMobile } from '@/hooks/use-media-query';
import { useUIStore } from '@/stores/ui-store';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function Sidebar() {
  const isMobile = useIsMobile();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const sidebarContent = (
    <nav className="flex flex-col gap-1 p-4">
      {/* NavItems */}
    </nav>
  );

  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-background transition-all duration-200',
        sidebarOpen ? 'w-[240px]' : 'w-[60px]'
      )}
    >
      {sidebarContent}
    </aside>
  );
}
```

### 7.4 Bottom Navigation (Mobile)

```typescript
// src/components/layout/mobile-nav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, FileText, Star, Clock, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/documents', icon: FileText, label: 'Docs' },
  { href: '/favorites', icon: Star, label: 'Favorites' },
  { href: '/recent', icon: Clock, label: 'Recent' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 7.5 Mobile-First Approach

All layouts are built mobile-first. The CSS pattern is:

```
// Base = mobile
// md: = tablet adjustments
// lg: = desktop adjustments

className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
```

The dashboard layout adds `pb-20 md:pb-0` to the main content area to account for the bottom nav on mobile.

---

## 8. Error & Loading States

### 8.1 Global Error Boundary Strategy

Three levels of error boundaries:

```typescript
// Level 1: Root error boundary (catches everything)
// src/app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground mt-2">{error.message}</p>
            <Button onClick={reset} className="mt-4">Try again</Button>
          </div>
        </div>
      </body>
    </html>
  );
}

// Level 2: Dashboard layout error boundary
// src/app/(dashboard)/error.tsx
// Catches errors within the dashboard shell, sidebar remains functional

// Level 3: Per-page error boundary
// Each page directory can have its own error.tsx
```

### 8.2 Per-Component Loading Skeletons

Defined in each page's `loading.tsx`:

```typescript
// src/app/(dashboard)/documents/loading.tsx
export default function DocumentsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex justify-between">
        <Skeleton className="h-9 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
```

For inline loading (within components), use the `isLoading` state from TanStack Query:

```typescript
function RecentUploads() {
  const { data, isLoading } = useRecentDocuments();

  if (isLoading) {
    return <RecentUploadsSkeleton />;
  }

  return <DocumentGrid documents={data ?? []} />;
}
```

### 8.3 Toast Notification System

Use shadcn/ui's `toast` primitive via a Zustand-compatible approach:

```typescript
// src/components/ui/toaster.tsx  (from shadcn)
// Already in the component tree from shadcn installation

// Usage pattern:
import { toast } from '@/components/ui/use-toast';

// In mutation onSuccess:
toast({
  title: 'Document uploaded',
  description: `${fileName} has been uploaded successfully.`,
});

// In mutation onError:
toast({
  title: 'Upload failed',
  description: error.message,
  variant: 'destructive',
});
```

Toast types and when they appear:

| Event | Toast Type | Message |
|---|---|---|
| Upload success | success | "{filename} uploaded successfully" |
| Upload error | destructive | "Failed to upload {filename}: {reason}" |
| Delete success | default | "Document deleted" |
| Delete error | destructive | "Failed to delete document" |
| Favorite toggled | default | "Added to favorites" / "Removed from favorites" |
| Folder created | default | "Folder '{name}' created" |
| Subscription activated | success | "Subscription activated! You now have full access." |
| Subscription cancelled | default | "Subscription cancelled. Access continues until {date}." |
| Network error | destructive | "Network error. Please check your connection." |
| Session expired | destructive | "Session expired. Please log in again." |

### 8.4 Network Error Handling & Offline Detection

```typescript
// src/hooks/use-network-status.ts
'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // assume online during SSR
}

export function useNetworkStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

```typescript
// src/components/shared/offline-banner.tsx
'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground text-center py-2 text-sm">
      <WifiOff className="inline-block mr-2 h-4 w-4" />
      You are offline. Some features may be unavailable.
    </div>
  );
}
```

### 8.5 Retry Strategies

TanStack Query handles retries automatically with the global config:
- Queries: 2 retries with exponential backoff (1s, 2s, 4s, capped at 10s)
- Mutations: 0 retries (mutations should not auto-retry; the user should explicitly retry)

For manual retry, every error state includes a retry button:

```typescript
// Pattern used in all error states:
function QueryErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error.message}</p>
      <Button variant="outline" onClick={onRetry} className="mt-4">
        Try again
      </Button>
    </div>
  );
}

// Usage:
const { data, isError, error, refetch } = useDocuments(folderId);

if (isError) {
  return <QueryErrorState error={error} onRetry={() => refetch()} />;
}
```

---

## Complete Provider Tree

The root layout wires everything together:

```typescript
// src/app/layout.tsx

import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { OfflineBanner } from '@/components/shared/offline-banner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            <OfflineBanner />
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Note: Zustand stores require NO provider. They are imported directly in components. This is one of the key advantages over Context.

---

## Summary of Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Client state | Zustand | Selector subscriptions, no providers, tiny bundle, persist middleware |
| Server state | TanStack Query v5 | Cache management, background refetching, optimistic updates, devtools |
| Auth FSM | useReducer in hook | Scoped to login flow, does not need global state |
| Upload FSM | Zustand store | Global (uploads survive navigation), needs progress tracking |
| Subscription FSM | Zustand store | Global (checkout overlay needs to persist across components) |
| Preview FSM | useState | Local to preview component, no global visibility needed |
| Folder navigation FSM | TanStack Query derived | isLoading/isError/data already provides the states |
| Route guards | Server middleware + client AuthGuard | Defense in depth |
| Paywall enforcement | Server check + client useCanUpload hook | Server is authoritative, client is for UX |
| Responsive | Tailwind mobile-first + useMediaQuery hook | CSS handles layout, JS hook handles conditional rendering |
| Error handling | 3-level error boundaries + per-query error states + toasts | Granular error recovery |

---

### Critical Files for Implementation

- `/src/stores/auth-store.ts` - Core client auth state, used by every protected component and the AuthGuard
- `/src/hooks/use-upload.ts` - Most complex hook in the app: orchestrates file validation, presigned URLs, XHR uploads with progress, and cache invalidation
- `/src/lib/query-keys.ts` - Single source of truth for all TanStack Query cache keys; any mistake here causes stale data bugs across the app
- `/src/components/auth/auth-guard.tsx` - Client-side guard that syncs server auth state to Zustand and handles redirect logic
- `/src/hooks/use-razorpay-checkout.ts` - Razorpay integration FSM; handles the checkout modal lifecycle, payment verification polling, and cache invalidation on subscription activation
