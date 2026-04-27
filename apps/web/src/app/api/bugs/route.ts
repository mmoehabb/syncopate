import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { API_ERRORS, apiError } from "@/lib/api/error";
import { prisma } from "@syncopate/db";
import type { BugReportPayload, BugReportResponse } from "@syncopate/types";

export async function POST(req: Request) {
  const session = await auth();

  // We allow bug reporting even for unauthenticated users, but we log the user ID if available
  const userId = session?.user?.id;

  try {
    const body: BugReportPayload = await req.json();
    const { message, stack, url } = body;

    if (!message) {
      return apiError(API_ERRORS.customBadRequest("Message is required"));
    }

    const bugReport = await prisma.bugReport.create({
      data: {
        userId,
        message,
        stack,
        url,
      },
    });

    const response: BugReportResponse = {
      success: true,
      id: bugReport.id,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error reporting bug:", error);
    return apiError(API_ERRORS.customInternal("Failed to report bug"));
  }
}
