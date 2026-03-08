import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { generateUploadUrl } from '@/lib/r2/client';
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '@/lib/constants';

function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// POST /api/documents/upload — Request a presigned upload URL
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const { name, mimeType, size, folderId } = body;

    // Validate required fields
    if (!name || !mimeType || size === undefined || size === null) {
      return NextResponse.json(
        { error: 'name, mimeType, and size are required' },
        { status: 400 },
      );
    }

    // Validate mimeType
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    // Validate size
    if (typeof size !== 'number' || size <= 0) {
      return NextResponse.json({ error: 'Invalid file size' }, { status: 400 });
    }

    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    // If folderId is provided, verify it belongs to the user
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
    }

    // Check upload permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.freeUploadUsed) {
      // Must have an active subscription
      const subscription = user.subscription;

      if (!subscription) {
        return NextResponse.json(
          { error: 'Subscription required to upload more files' },
          { status: 403 },
        );
      }

      const hasActiveStatus =
        subscription.status === 'ACTIVE' || subscription.status === 'AUTHENTICATED';
      const isPeriodValid =
        subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date();

      if (!hasActiveStatus || !isPeriodValid) {
        return NextResponse.json(
          { error: 'Active subscription required to upload more files' },
          { status: 403 },
        );
      }
    }

    // Generate R2 key
    const sanitizedName = sanitizeFilename(name);
    const r2Key = `${userId}/${crypto.randomUUID()}-${sanitizedName}`;

    // Create document record in DB
    const document = await prisma.document.create({
      data: {
        name,
        mimeType,
        size: BigInt(size),
        r2Key,
        folderId: folderId || null,
        userId,
      },
    });

    // Generate presigned upload URL
    const uploadUrl = await generateUploadUrl(r2Key, mimeType);

    return NextResponse.json(
      {
        uploadUrl,
        documentId: document.id,
        r2Key,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/documents/upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
