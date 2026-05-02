import { NextResponse } from "next/server";
import type { HealthResponse } from "@syncoboard/types";

export async function GET() {
  // Test DB connection implicitly via Prisma (optional health check)
  // For a robust check you could do: await prisma.$queryRaw`SELECT 1`;

  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    message: "Syncoboard API is operational",
  };

  return NextResponse.json(response);
}
