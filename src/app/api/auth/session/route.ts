import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Fetch user and subscription from database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "Account is blocked" },
        { status: 403 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: {
        userId: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        freeUploadUsed: user.freeUploadUsed,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            razorpaySubscriptionId: subscription.razorpaySubscriptionId,
          }
        : null,
    });
  } catch (error) {
    console.error("[AUTH SESSION]", error);
    return NextResponse.json(
      { error: "Session verification failed" },
      { status: 500 }
    );
  }
}
