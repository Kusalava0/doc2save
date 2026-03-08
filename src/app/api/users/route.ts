import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search') || '';
    const blockedParam = searchParams.get('blocked');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { phone: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (blockedParam === 'true') {
      where.isBlocked = true;
    } else if (blockedParam === 'false') {
      where.isBlocked = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            select: {
              status: true,
              currentPeriodEnd: true,
            },
          },
          _count: {
            select: { documents: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      isBlocked: user.isBlocked,
      freeUploadUsed: user.freeUploadUsed,
      createdAt: user.createdAt.toISOString(),
      documentCount: user._count.documents,
      subscription: user.subscription
        ? {
            status: user.subscription.status,
            currentPeriodEnd: user.subscription.currentPeriodEnd?.toISOString() ?? null,
          }
        : null,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET /api/users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
