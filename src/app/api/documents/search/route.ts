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

// GET /api/documents/search — Search documents and folders by name
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const trimmed = q.trim();

    const [documents, folders] = await Promise.all([
      prisma.document.findMany({
        where: {
          userId,
          name: { contains: trimmed, mode: 'insensitive' },
        },
        orderBy: { uploadedAt: 'desc' },
        take: 50,
      }),
      prisma.folder.findMany({
        where: {
          userId,
          name: { contains: trimmed, mode: 'insensitive' },
        },
        include: {
          _count: { select: { documents: true, children: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      documents: documents.map(serializeDocument),
      folders,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/documents/search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
