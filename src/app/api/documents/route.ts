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

const VALID_SORT_FIELDS = ['uploadedAt', 'name', 'size'] as const;
const VALID_ORDERS = ['asc', 'desc'] as const;

// GET /api/documents — List documents for user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const { searchParams } = new URL(request.url);

    const folderId = searchParams.get('folderId');
    const sort = searchParams.get('sort') || 'uploadedAt';
    const order = searchParams.get('order') || 'desc';

    // Validate sort and order
    const validSort = VALID_SORT_FIELDS.includes(sort as (typeof VALID_SORT_FIELDS)[number])
      ? sort
      : 'uploadedAt';
    const validOrder = VALID_ORDERS.includes(order as (typeof VALID_ORDERS)[number])
      ? order
      : 'desc';

    const where: { userId: string; folderId?: string | null } = { userId };
    if (folderId !== null && folderId !== undefined) {
      where.folderId = folderId;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { [validSort]: validOrder },
    });

    return NextResponse.json({
      documents: documents.map(serializeDocument),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
