import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { generateDownloadUrl } from '@/lib/r2/client';

function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET /api/documents/[documentId]/download — Generate presigned download URL
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

    const downloadUrl = await generateDownloadUrl(document.r2Key, document.name);

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/documents/[documentId]/download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
