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

// GET /api/documents/expiring — Get documents expiring within N days
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const documents = await prisma.document.findMany({
      where: {
        userId,
        expiryDate: {
          not: null,
          lte: futureDate,
          gte: now,
        },
      },
      include: {
        folder: {
          select: { id: true, name: true },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return NextResponse.json({
      documents: documents.map(serializeDocument),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/documents/expiring error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
