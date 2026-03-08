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

// GET /api/documents/favorites — Get all favorite documents
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);

    const documents = await prisma.document.findMany({
      where: { userId, isFavorite: true },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({
      documents: documents.map(serializeDocument),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/documents/favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
