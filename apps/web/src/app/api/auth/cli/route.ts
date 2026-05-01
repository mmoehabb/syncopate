import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";
import crypto from "node:crypto";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Save token in the database
    const pat = await prisma.personalAccessToken.create({
      data: {
        token,
        userId: session.user.id,
        expiresAt,
      },
    });

    return NextResponse.json({ token: pat.token }, { status: 201 });
  } catch (error) {
    console.error("Error generating CLI token:", error);
    return apiError(API_ERRORS.customInternal("Failed to generate token"));
  }
}
