import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { deleteObject } from '@/lib/r2/client';

function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

function serializeDocument(doc: { size: bigint; [key: string]: unknown }) {
  return { ...doc, size: Number(doc.size) };
}

// GET /api/documents/[documentId] — Get single document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const userId = getUserId(request);
    const { documentId } = await params;

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document: serializeDocument(document) });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/documents/[documentId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/documents/[documentId] — Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const userId = getUserId(request);
    const { documentId } = await params;

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from R2 first
    await deleteObject(document.r2Key);

    // Then delete from DB
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('DELETE /api/documents/[documentId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
