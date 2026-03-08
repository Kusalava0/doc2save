import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma/client";
import { createSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid idToken" },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const phone = decodedToken.phone_number || null;
    const email = decodedToken.email || null;
    const displayName = decodedToken.name || null;

    if (!phone && !email) {
      return NextResponse.json(
        { error: "No phone or email found in token" },
        { status: 400 }
      );
    }

    // Smart user lookup: find by phone → email → firebaseUid
    // This allows the same account to be accessed via phone OTP or Google Sign-In
    let user = null;

    if (phone) {
      user = await prisma.user.findUnique({ where: { phone } });
    }

    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      user = await prisma.user.findUnique({ where: { firebaseUid } });
    }

    if (user) {
      // Update existing user: sync firebaseUid + any new info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid,
          ...(email && !user.email && { email }),
          ...(phone && !user.phone && { phone }),
          ...(displayName && !user.name && { name: displayName }),
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          firebaseUid,
          phone,
          email,
          name: displayName,
        },
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { error: "Account is blocked. Please contact support." },
        { status: 403 }
      );
    }

    // Create session JWT
    const token = await createSession({
      userId: user.id,
      firebaseUid,
      phone: user.phone || undefined,
      email: user.email || undefined,
      role: user.role,
    });

    // Set httpOnly session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
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
    });
  } catch (error) {
    console.error("[AUTH LOGIN]", error);
    return NextResponse.json(
      { error: "Authentication failed", details: error instanceof Error ? error.message : String(error) },
      { status: 401 }
    );
  }
}
