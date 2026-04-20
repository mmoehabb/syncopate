import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { API_ERRORS, apiError } from "@/lib/api/error";
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

    // TODO: Integrate with a real bug tracking service like Sentry, LogRocket, or a DB table
    console.log("--- BUG REPORT RECEIVED ---");
    console.log(`User ID: ${userId || "Anonymous"}`);
    console.log(`Message: ${message}`);
    console.log(`Stack: ${stack || "N/A"}`);
    console.log(`URL: ${url || "N/A"}`);
    console.log("---------------------------");

    const response: BugReportResponse = {
      success: true,
      id: crypto.randomUUID(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error reporting bug:", error);
    return apiError(API_ERRORS.customInternal("Failed to report bug"));
  }
}
