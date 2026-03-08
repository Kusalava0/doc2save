import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const role = request.headers.get('x-user-role');

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get storage used
    const storageResult = await prisma.document.aggregate({
      where: { userId },
      _sum: { size: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isBlocked: user.isBlocked,
        freeUploadUsed: user.freeUploadUsed,
        createdAt: user.createdAt.toISOString(),
        documentCount: user._count.documents,
        storageUsedBytes: Number(storageResult._sum.size ?? 0),
        subscription: user.subscription
          ? {
              id: user.subscription.id,
              status: user.subscription.status,
              razorpaySubscriptionId: user.subscription.razorpaySubscriptionId,
              currentPeriodStart: user.subscription.currentPeriodStart?.toISOString() ?? null,
              currentPeriodEnd: user.subscription.currentPeriodEnd?.toISOString() ?? null,
              cancelledAt: user.subscription.cancelledAt?.toISOString() ?? null,
              createdAt: user.subscription.createdAt.toISOString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[GET /api/users/[userId]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const role = request.headers.get('x-user-role');

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await context.params;
    const body = await request.json();

    // Validate allowed fields
    const allowedFields: Record<string, boolean> = {
      name: true,
      role: true,
      isBlocked: true,
    };

    const updateData: Record<string, unknown> = {};

    for (const key of Object.keys(body)) {
      if (allowedFields[key]) {
        updateData[key] = body[key];
      }
    }

    // Validate role if provided
    if (updateData.role && !['USER', 'ADMIN'].includes(updateData.role as string)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be USER or ADMIN.' },
        { status: 400 }
      );
    }

    // Validate isBlocked if provided
    if (updateData.isBlocked !== undefined && typeof updateData.isBlocked !== 'boolean') {
      return NextResponse.json(
        { error: 'isBlocked must be a boolean' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    });

    return NextResponse.json({
      user: {
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
      },
    });
  } catch (error) {
    console.error('[PATCH /api/users/[userId]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
