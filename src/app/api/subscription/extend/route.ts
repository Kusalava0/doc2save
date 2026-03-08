import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId: targetUserId, days } = body as {
      userId: string;
      days: number;
    };

    if (!targetUserId || !days || typeof days !== 'number' || days <= 0) {
      return NextResponse.json(
        { error: 'Valid userId and positive days are required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: targetUserId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found for this user' },
        { status: 404 }
      );
    }

    // Calculate new end date
    const currentEnd = subscription.currentPeriodEnd ?? new Date();
    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + days);

    const updatedSubscription = await prisma.subscription.update({
      where: { userId: targetUserId },
      data: {
        currentPeriodEnd: newEnd,
      },
    });

    return NextResponse.json({
      message: `Subscription extended by ${days} days`,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('[POST /api/subscription/extend] Error:', error);
    return NextResponse.json(
      { error: 'Failed to extend subscription' },
      { status: 500 }
    );
  }
}
