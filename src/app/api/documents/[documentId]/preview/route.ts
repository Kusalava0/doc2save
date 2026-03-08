import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { generatePreviewUrl } from '@/lib/r2/client';

function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET /api/documents/[documentId]/preview — Generate presigned preview URL
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

    const previewUrl = await generatePreviewUrl(document.r2Key);

    return NextResponse.json({ previewUrl });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/documents/[documentId]/preview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
