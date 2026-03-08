import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

function serializeDocument(doc: { size: bigint; [key: string]: unknown }) {
  return { ...doc, size: Number(doc.size) };
}

// POST /api/documents/[documentId]/move — Move document to different folder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const userId = getUserId(request);
    const { documentId } = await params;
    const body = await request.json();
    const { folderId } = body;

    // Verify document belongs to user
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // If folderId is provided (not null), verify it belongs to the user
    if (folderId !== null && folderId !== undefined) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        return NextResponse.json({ error: 'Target folder not found' }, { status: 404 });
      }
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { folderId: folderId ?? null },
    });

    return NextResponse.json({ document: serializeDocument(updated) });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/documents/[documentId]/move error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
