import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { razorpay } from '@/lib/razorpay/client';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'No Razorpay subscription linked' },
        { status: 400 }
      );
    }

    if (subscription.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      );
    }

    // Cancel on Razorpay (at end of current billing cycle)
    await razorpay.subscriptions.cancel(
      subscription.razorpaySubscriptionId,
      true // cancel_at_cycle_end
    );

    // Update DB
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('[POST /api/subscription/cancel] Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
