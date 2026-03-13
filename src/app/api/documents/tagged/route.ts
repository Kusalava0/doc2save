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

// GET /api/documents/tagged?tag=gst
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const tag = request.nextUrl.searchParams.get('tag');

    if (!tag) {
      return NextResponse.json(
        { error: 'tag parameter is required' },
        { status: 400 },
      );
    }

    const document = await prisma.document.findFirst({
      where: {
        userId,
        metadata: {
          path: ['dashboardTag'],
          equals: tag,
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({
      document: document ? serializeDocument(document) : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/documents/tagged error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
