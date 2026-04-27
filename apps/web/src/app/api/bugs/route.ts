import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { API_ERRORS, apiError } from "@/lib/api/error";
import { prisma } from "@syncopate/db";
import type { BugReportPayload, BugReportResponse } from "@syncopate/types";
import { isRateLimited } from "@/lib/api/rate-limit";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_STACK_LENGTH = 5000;
const MAX_URL_LENGTH = 500;

function sanitize(str: string): string {
  // Replace control characters with spaces, collapse multiple spaces, and trim
  return str
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  // IP-based rate limiting
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  if (isRateLimited(`bug-report:${ip}`, 5, 60000)) {
    // 5 reports per minute
    return apiError(API_ERRORS.customBadRequest("Too many requests"));
  }

  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    const body: BugReportPayload = await req.json();
    const { message, stack, url } = body;

    // Input validation: Length checks
    if (message.length > MAX_MESSAGE_LENGTH) {
      return apiError(API_ERRORS.customBadRequest("Message too long"));
    }
    if (stack && stack.length > MAX_STACK_LENGTH) {
      return apiError(API_ERRORS.customBadRequest("Stack trace too long"));
    }
    if (url && url.length > MAX_URL_LENGTH) {
      return apiError(API_ERRORS.customBadRequest("URL too long"));
    }

    // Sanitize inputs for logging
    const safeMessage = sanitize(message);
    const safeStack = stack ? sanitize(stack) : "N/A";
    const safeUrl = url ? sanitize(url) : "N/A";

    if (!message) {
      return apiError(API_ERRORS.customBadRequest("Message is required"));
    }

    const bugReport = await prisma.bugReport.create({
      data: {
        userId,
        message: safeMessage,
        stack: safeStack,
        url: safeUrl,
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
