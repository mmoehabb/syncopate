"use server";

import { prisma } from "@syncopate/db";

export async function reportBugAction(data: {
  message?: string;
  digest?: string;
  stack?: string;
  browser?: string;
  url?: string;
}) {
  try {
    await prisma.bugReport.create({
      data: {
        message: data.message,
        digest: data.digest,
        stack: data.stack,
        browser: data.browser,
        url: data.url,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to save bug report:", error);
    return { success: false, error: "Failed to save bug report" };
  }
}
