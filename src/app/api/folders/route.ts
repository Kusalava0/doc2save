import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET /api/folders — List root folders for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);

    const folders = await prisma.folder.findMany({
      where: { userId, parentId: null },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    return NextResponse.json({ folders });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/folders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/folders — Create a new folder
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const { name, parentId } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // If parentId is provided, verify it belongs to the user
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, userId },
      });

      if (!parentFolder) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        parentId: parentId || null,
        userId,
      },
      include: {
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/folders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
