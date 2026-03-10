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

    if (!razorpayPaymentId || !razorpaySubscriptionId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment details or signature' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature (mandatory)
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[Subscription Verify] RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json(
        { error: 'Payment verification unavailable' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpaySignature, 'hex')
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
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
