import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { headObject } from '@/lib/r2/client';

function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

function serializeDocument(doc: { size: bigint; [key: string]: unknown }) {
  return { ...doc, size: Number(doc.size) };
}

// POST /api/documents/confirm — Confirm upload completed
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const { documentId, r2Key, metadata } = body;

    if (!documentId || !r2Key) {
      return NextResponse.json(
        { error: 'documentId and r2Key are required' },
        { status: 400 },
      );
    }

    // Verify document belongs to user and r2Key matches
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.r2Key !== r2Key) {
      return NextResponse.json({ error: 'r2Key does not match' }, { status: 400 });
    }

    // Verify the file exists in R2
    const exists = await headObject(r2Key);
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found in storage. Upload may not have completed.' },
        { status: 400 },
      );
    }

    // Store metadata if provided
    if (metadata && typeof metadata === 'object') {
      await prisma.document.update({
        where: { id: documentId },
        data: { metadata },
      });
    }

    // Update user's freeUploadUsed to true if not already
    await prisma.user.update({
      where: { id: userId },
      data: { freeUploadUsed: true },
    });

    // Re-fetch to include metadata
    const updatedDoc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    return NextResponse.json({ document: serializeDocument(updatedDoc || document) });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/documents/confirm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
