import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: NextRequest) {
  try {
    const receivedSignature = request.headers.get('x-razorpay-signature');

    if (!receivedSignature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Read raw body for signature verification
    const body = await request.text();

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== receivedSignature) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(body);
    const event = payload.event as string;

    console.log(`[Webhook] Received event: ${event}`);

    // Handle subscription events
    if (event.startsWith('subscription.')) {
      await handleSubscriptionEvent(event, payload);
    }

    // Handle payment events
    if (event.startsWith('payment.')) {
      await handlePaymentEvent(event, payload);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[POST /api/payments/webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionEvent(event: string, payload: Record<string, unknown>) {
  const entity = (
    (payload.payload as Record<string, unknown>)?.subscription as Record<string, unknown>
  )?.entity as Record<string, unknown>;

  if (!entity) {
    console.error('[Webhook] No subscription entity in payload');
    return;
  }

  const razorpaySubscriptionId = entity.id as string;

  const subscription = await prisma.subscription.findUnique({
    where: { razorpaySubscriptionId },
  });

  if (!subscription) {
    console.error(
      `[Webhook] Subscription not found for razorpaySubscriptionId: ${razorpaySubscriptionId}`
    );
    return;
  }

  // Store customer ID if available
  const razorpayCustomerId = (entity.customer_id as string) || subscription.razorpayCustomerId;

  switch (event) {
    case 'subscription.authenticated': {
      await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: {
          status: 'AUTHENTICATED',
          razorpayCustomerId,
        },
      });
      break;
    }

    case 'subscription.activated': {
      const currentStart = entity.current_start
        ? new Date((entity.current_start as number) * 1000)
        : new Date();
      const currentEnd = entity.current_end
        ? new Date((entity.current_end as number) * 1000)
        : null;

      await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: {
          status: 'ACTIVE',
          razorpayCustomerId,
          currentPeriodStart: currentStart,
          currentPeriodEnd: currentEnd,
        },
      });
      break;
    }

    case 'subscription.charged': {
      const currentStart = entity.current_start
        ? new Date((entity.current_start as number) * 1000)
        : new Date();
      const currentEnd = entity.current_end
        ? new Date((entity.current_end as number) * 1000)
        : null;

      await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: {
          status: 'ACTIVE',
          razorpayCustomerId,
          currentPeriodStart: currentStart,
          currentPeriodEnd: currentEnd,
        },
      });

      // Create payment record for the charge
      const paymentEntity = (
        (payload.payload as Record<string, unknown>)?.payment as Record<string, unknown>
      )?.entity as Record<string, unknown> | undefined;

      if (paymentEntity) {
        await prisma.payment.upsert({
          where: {
            razorpayPaymentId: paymentEntity.id as string,
          },
          create: {
            userId: subscription.userId,
            razorpayPaymentId: paymentEntity.id as string,
            razorpayOrderId: (paymentEntity.order_id as string) || null,
            amount: (paymentEntity.amount as number) || 0,
            currency: (paymentEntity.currency as string) || 'INR',
            status: 'CAPTURED',
            method: (paymentEntity.method as string) || null,
            paidAt: new Date(),
          },
          update: {
            status: 'CAPTURED',
            method: (paymentEntity.method as string) || null,
            paidAt: new Date(),
          },
        });
      }
      break;
    }

    case 'subscription.pending': {
      await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: { status: 'PENDING' },
      });
      break;
    }

    case 'subscription.halted': {
      await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: { status: 'HALTED' },
      });
      break;
    }

    case 'subscription.cancelled': {
      await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: {
          status: 'CANCELLED',
          cancelledAt: subscription.cancelledAt ?? new Date(),
        },
      });
      break;
    }

    case 'subscription.completed': {
      await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: { status: 'COMPLETED' },
      });
      break;
    }

    case 'subscription.expired': {
      await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: { status: 'EXPIRED' },
      });
      break;
    }

    default:
      console.log(`[Webhook] Unhandled subscription event: ${event}`);
  }
}

async function handlePaymentEvent(event: string, payload: Record<string, unknown>) {
  const entity = (
    (payload.payload as Record<string, unknown>)?.payment as Record<string, unknown>
  )?.entity as Record<string, unknown>;

  if (!entity) {
    console.error('[Webhook] No payment entity in payload');
    return;
  }

  const razorpayPaymentId = entity.id as string;

  // Try to find the associated user via subscription notes or existing payment
  let userId: string | null = null;

  // Check notes for userId
  const notes = entity.notes as Record<string, string> | undefined;
  if (notes?.userId) {
    userId = notes.userId;
  }

  // Fallback: look up existing payment record
  if (!userId) {
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayPaymentId },
    });
    userId = existingPayment?.userId ?? null;
  }

  // Fallback: look up via subscription
  if (!userId && entity.subscription_id) {
    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: entity.subscription_id as string },
    });
    userId = subscription?.userId ?? null;
  }

  if (!userId) {
    console.error(
      `[Webhook] Could not determine userId for payment: ${razorpayPaymentId}`
    );
    return;
  }

  switch (event) {
    case 'payment.authorized': {
      await prisma.payment.upsert({
        where: { razorpayPaymentId },
        create: {
          userId,
          razorpayPaymentId,
          razorpayOrderId: (entity.order_id as string) || null,
          amount: (entity.amount as number) || 0,
          currency: (entity.currency as string) || 'INR',
          status: 'AUTHORIZED',
          method: (entity.method as string) || null,
        },
        update: {
          status: 'AUTHORIZED',
          method: (entity.method as string) || null,
        },
      });
      break;
    }

    case 'payment.captured': {
      await prisma.payment.upsert({
        where: { razorpayPaymentId },
        create: {
          userId,
          razorpayPaymentId,
          razorpayOrderId: (entity.order_id as string) || null,
          amount: (entity.amount as number) || 0,
          currency: (entity.currency as string) || 'INR',
          status: 'CAPTURED',
          method: (entity.method as string) || null,
          paidAt: new Date(),
        },
        update: {
          status: 'CAPTURED',
          paidAt: new Date(),
        },
      });
      break;
    }

    case 'payment.failed': {
      await prisma.payment.upsert({
        where: { razorpayPaymentId },
        create: {
          userId,
          razorpayPaymentId,
          razorpayOrderId: (entity.order_id as string) || null,
          amount: (entity.amount as number) || 0,
          currency: (entity.currency as string) || 'INR',
          status: 'FAILED',
          method: (entity.method as string) || null,
          failedAt: new Date(),
        },
        update: {
          status: 'FAILED',
          failedAt: new Date(),
        },
      });
      break;
    }

    default:
      console.log(`[Webhook] Unhandled payment event: ${event}`);
  }
}
