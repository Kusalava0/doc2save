import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// Check if targetId is a descendant of folderId
async function isDescendant(folderId: string, targetId: string): Promise<boolean> {
  const children = await prisma.folder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });

  for (const child of children) {
    if (child.id === targetId) return true;
    if (await isDescendant(child.id, targetId)) return true;
  }

  return false;
}

// POST /api/folders/[folderId]/move — Move folder to a new parent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> },
) {
  try {
    const userId = getUserId(request);
    const { folderId } = await params;
    const body = await request.json();
    const { targetParentId } = body;

    // Verify the folder belongs to the user
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Cannot move a folder into itself
    if (targetParentId === folderId) {
      return NextResponse.json(
        { error: 'Cannot move a folder into itself' },
        { status: 400 },
      );
    }

    // If targetParentId is provided (not null), verify ownership and prevent circular move
    if (targetParentId !== null && targetParentId !== undefined) {
      const targetFolder = await prisma.folder.findFirst({
        where: { id: targetParentId, userId },
      });

      if (!targetFolder) {
        return NextResponse.json({ error: 'Target folder not found' }, { status: 404 });
      }

      // Prevent moving a folder into one of its own descendants
      const isDesc = await isDescendant(folderId, targetParentId);
      if (isDesc) {
        return NextResponse.json(
          { error: 'Cannot move a folder into one of its descendants' },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.folder.update({
      where: { id: folderId },
      data: { parentId: targetParentId ?? null },
    });

    return NextResponse.json({ folder: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/folders/[folderId]/move error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
