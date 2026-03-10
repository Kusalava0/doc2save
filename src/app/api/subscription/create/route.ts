import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { razorpay } from '@/lib/razorpay/client';
import { PLAN, PLANS } from '@/lib/razorpay/plans';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (
      existingSubscription &&
      ['ACTIVE', 'AUTHENTICATED', 'PENDING'].includes(existingSubscription.status)
    ) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Get plan name and phone from request body
    const body = await request.json().catch(() => ({}));
    const phone = body.phone ?? '';
    const requestedPlanName = body.planName;

    // Resolve which plan to use (by name, since plan IDs are server-only env vars)
    const plan = requestedPlanName
      ? PLANS.find((p) => p.name === requestedPlanName)
      : PLAN;

    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Create Razorpay subscription
    // With 6-month interval, totalCount=4 allows up to 2 years of renewals
    const totalCount = 4;
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId,
        phone,
        planPeriod: plan.period,
      },
    });

    // Upsert subscription record in DB
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        razorpaySubscriptionId: razorpaySubscription.id,
        planId: plan.id,
        status: 'CREATED',
      },
      update: {
        razorpaySubscriptionId: razorpaySubscription.id,
        planId: plan.id,
        status: 'CREATED',
        cancelledAt: null,
      },
    });

    return NextResponse.json({
      subscriptionId: razorpaySubscription.id,
      shortUrl: (razorpaySubscription as unknown as Record<string, unknown>).short_url,
    });
  } catch (error) {
    console.error('[POST /api/subscription/create] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
