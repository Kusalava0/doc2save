import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma/client";

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

    // Verify the Firebase ID token from the new provider
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const phone = decodedToken.phone_number || null;
    const email = decodedToken.email || null;
    const displayName = decodedToken.name || null;

    if (!phone && !email) {
      return NextResponse.json(
        { error: "No phone or email found in the linked account" },
        { status: 400 }
      );
    }

    // Check if phone or email is already taken by a different user
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing && existing.id !== userId) {
        return NextResponse.json(
          {
            error: "This phone number is already linked to another account",
            code: "CONFLICT_PHONE",
            conflictAccount: {
              hasDocuments: await prisma.document.count({ where: { userId: existing.id } }) > 0,
              hasFolders: await prisma.folder.count({ where: { userId: existing.id } }) > 0,
            },
          },
          { status: 409 }
        );
      }
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return NextResponse.json(
          {
            error: "This email is already linked to another account",
            code: "CONFLICT_EMAIL",
            conflictAccount: {
              hasDocuments: await prisma.document.count({ where: { userId: existing.id } }) > 0,
              hasFolders: await prisma.folder.count({ where: { userId: existing.id } }) > 0,
            },
          },
          { status: 409 }
        );
      }
    }

    // Fetch current user to conditionally update name
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    // Update user with the new linked info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email }),
        ...(phone && { phone }),
        ...(displayName && !currentUser?.name && { name: displayName }),
      },
    });

    return NextResponse.json({
      user: {
        userId: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    });
  } catch (error) {
    console.error("[AUTH LINK-ACCOUNT]", error);
    return NextResponse.json(
      { error: "Failed to link account" },
      { status: 500 }
    );
  }
}
