import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    const url = new URL(req.url);
    const includeBoards = url.searchParams.get("includeBoards") === "true";

    if (includeBoards) {
      const workspaces = await prisma.workspace.findMany({
        where: {
          members: {
            some: { userId: session.user.id },
          },
        },
        include: {
          boards: true,
        },
      });
      return NextResponse.json({ workspaces }, { status: 200 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId: session.user.id },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return apiError(API_ERRORS.customInternal("Failed to fetch workspaces"));
  }
}
