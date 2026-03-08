import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      razorpayPaymentId,
      razorpaySubscriptionId,
      razorpaySignature,
    } = body;

    if (!razorpayPaymentId || !razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify signature if webhook secret is configured
    const webhookSecret = process.env.RAZORPAY_KEY_SECRET;
    if (webhookSecret && razorpaySignature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    }

    // Update subscription status to ACTIVE
    const now = new Date();
    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    await prisma.subscription.updateMany({
      where: {
        userId,
        razorpaySubscriptionId,
      },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/subscription/verify] Error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
