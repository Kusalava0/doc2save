import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma/client";

/**
 * Merge another account into the current user's account.
 * Transfers all folders, documents, payments from the source account.
 * Keeps the better subscription (active > inactive, longer period wins).
 * Then deletes the source account.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid idToken" },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token from the other account
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const phone = decodedToken.phone_number || null;
    const email = decodedToken.email || null;

    if (!phone && !email) {
      return NextResponse.json(
        { error: "No phone or email found in token" },
        { status: 400 }
      );
    }

    // Find the source account to merge from
    let sourceUser = null;
    if (phone) {
      sourceUser = await prisma.user.findUnique({ where: { phone } });
    }
    if (!sourceUser && email) {
      sourceUser = await prisma.user.findUnique({ where: { email } });
    }

    if (!sourceUser) {
      return NextResponse.json(
        { error: "No existing account found to merge" },
        { status: 404 }
      );
    }

    if (sourceUser.id === userId) {
      return NextResponse.json(
        { error: "Cannot merge an account with itself" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      );
    }

    // Perform merge in a transaction
    const mergedUser = await prisma.$transaction(async (tx) => {
      // 1. Transfer all root folders (parentId = null) from source to current user
      await tx.folder.updateMany({
        where: { userId: sourceUser.id },
        data: { userId },
      });

      // 2. Transfer all documents from source to current user
      await tx.document.updateMany({
        where: { userId: sourceUser.id },
        data: { userId },
      });

      // 3. Transfer payments from source to current user
      await tx.payment.updateMany({
        where: { userId: sourceUser.id },
        data: { userId },
      });

      // 4. Handle subscription: keep the better one
      const currentSub = await tx.subscription.findUnique({
        where: { userId },
      });
      const sourceSub = await tx.subscription.findUnique({
        where: { userId: sourceUser.id },
      });

      if (sourceSub) {
        const activeStatuses = ["ACTIVE", "AUTHENTICATED"];
        const sourceIsActive = activeStatuses.includes(sourceSub.status);
        const currentIsActive = currentSub
          ? activeStatuses.includes(currentSub.status)
          : false;

        if (sourceIsActive && !currentIsActive) {
          // Source has active sub, current doesn't — transfer it
          if (currentSub) {
            await tx.subscription.delete({ where: { id: currentSub.id } });
          }
          await tx.subscription.update({
            where: { id: sourceSub.id },
            data: { userId },
          });
        } else {
          // Current sub is better or equal — delete source sub
          await tx.subscription.delete({ where: { id: sourceSub.id } });
        }
      }

      // 5. Update current user with info from source
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          ...(phone && !currentUser.phone && { phone }),
          ...(email && !currentUser.email && { email }),
          ...(sourceUser.name && !currentUser.name && {
            name: sourceUser.name,
          }),
          // If either account used the free upload, mark it
          freeUploadUsed:
            currentUser.freeUploadUsed || sourceUser.freeUploadUsed,
        },
      });

      // 6. Delete the source user (cascades won't affect transferred data)
      await tx.user.delete({ where: { id: sourceUser.id } });

      return updated;
    });

    return NextResponse.json({
      user: {
        userId: mergedUser.id,
        phone: mergedUser.phone,
        email: mergedUser.email,
        name: mergedUser.name,
      },
    });
  } catch (error) {
    console.error("[AUTH MERGE-ACCOUNT]", error);
    return NextResponse.json(
      { error: "Failed to merge accounts" },
      { status: 500 }
    );
  }
}
