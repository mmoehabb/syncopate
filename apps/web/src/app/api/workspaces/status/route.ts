import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";
import { hasValidSubscription } from "@/lib/api/with-subscription";

export async function PUT(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  const isValidSubscription = await hasValidSubscription(session.user.id);
  if (!isValidSubscription) {
    return apiError(API_ERRORS.customForbidden("Active subscription required"));
  }

  try {
    const body = await req.json();
    const { workspaceName, isActive } = body;

    if (!workspaceName || isActive === undefined) {
      return apiError(
        API_ERRORS.customBadRequest(
          "Workspace name and isActive status are required",
        ),
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        name: workspaceName,
        members: {
          some: {
            userId: session.user.id,
            role: "ADMIN"
          },
        },
      },
    });

    if (!workspace) {
      return apiError(API_ERRORS.customNotFound("Workspace"));
    }

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { isActive },
    });

    return NextResponse.json({
      message: "Workspace status updated successfully",
      isActive,
    });
  } catch (error) {
    console.error("Error updating workspace status:", error);
    return apiError(API_ERRORS.customInternal("Failed to update workspace status"));
  }
}
