import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        _count: { select: { documents: true } },
      },
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

    // Aggregate total storage used
    const storageResult = await prisma.document.aggregate({
      where: { userId },
      _sum: { size: true },
    });

    return NextResponse.json({
      user: {
        userId: user.id,
        firebaseUid: user.firebaseUid,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        isBlocked: user.isBlocked,
        freeUploadUsed: user.freeUploadUsed,
        hasPhone: !!user.phone,
        hasGoogle: !!user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      subscription: user.subscription
        ? {
            id: user.subscription.id,
            status: user.subscription.status,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            razorpaySubscriptionId: user.subscription.razorpaySubscriptionId,
          }
        : null,
      stats: {
        documentCount: user._count.documents,
        totalStorageUsed: Number(storageResult._sum.size ?? 0),
      },
    });
  } catch (error) {
    console.error("[AUTH ME]", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
