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

// Build breadcrumbs by walking the parent chain
async function buildBreadcrumbs(folderId: string) {
  const breadcrumbs: { id: string; name: string }[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const found: { id: string; name: string; parentId: string | null } | null =
      await prisma.folder.findUnique({
        where: { id: currentId },
        select: { id: true, name: true, parentId: true },
      });

    if (!found) break;
    breadcrumbs.unshift({ id: found.id, name: found.name });
    currentId = found.parentId;
  }

  return breadcrumbs;
}

// Recursively collect all document r2Keys from a folder and its descendants
async function collectR2Keys(folderId: string): Promise<string[]> {
  const keys: string[] = [];

  const documents = await prisma.document.findMany({
    where: { folderId },
    select: { r2Key: true },
  });
  keys.push(...documents.map((d) => d.r2Key));

  const children = await prisma.folder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });

  for (const child of children) {
    const childKeys = await collectR2Keys(child.id);
    keys.push(...childKeys);
  }

  return keys;
}

// GET /api/folders/[folderId] — Get folder with breadcrumbs, subfolders, and documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> },
) {
  try {
    const userId = getUserId(request);
    const { folderId } = await params;

    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
      include: {
        children: {
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                documents: true,
                children: true,
              },
            },
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const breadcrumbs = await buildBreadcrumbs(folderId);

    return NextResponse.json({
      folder: {
        ...folder,
        documents: folder.documents.map(serializeDocument),
      },
      breadcrumbs,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/folders/[folderId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/folders/[folderId] — Rename folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> },
) {
  try {
    const userId = getUserId(request);
    const { folderId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const updated = await prisma.folder.update({
      where: { id: folderId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ folder: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('PATCH /api/folders/[folderId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/folders/[folderId] — Delete folder and all contents
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> },
) {
  try {
    const userId = getUserId(request);
    const { folderId } = await params;

    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Collect all r2Keys from this folder and its descendants
    const r2Keys = await collectR2Keys(folderId);

    // Delete all files from R2
    await Promise.all(r2Keys.map((key) => deleteObject(key)));

    // Delete the folder (cascade will delete children and documents)
    await prisma.folder.delete({
      where: { id: folderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('DELETE /api/folders/[folderId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
