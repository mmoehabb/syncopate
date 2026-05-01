import { NextResponse } from "next/server";
import { getSessionOrPat } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";

export async function POST(req: Request) {
  const userId = await getSessionOrPat();

  if (!userId) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    await prisma.userLogReadState.upsert({
      where: { userId: userId },
      update: { lastRead: new Date() },
      create: { userId: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating read state:", error);
    return apiError(API_ERRORS.customInternal("Failed to update read state"));
  }
}

export async function GET(req: Request) {
  const userId = await getSessionOrPat();

  if (!userId) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    const readState = await prisma.userLogReadState.findUnique({
      where: { userId: userId },
    });

    return NextResponse.json({ lastRead: readState?.lastRead || null });
  } catch (error) {
    console.error("Error fetching read state:", error);
    return apiError(API_ERRORS.customInternal("Failed to fetch read state"));
  }
}
