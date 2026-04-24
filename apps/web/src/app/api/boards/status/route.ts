import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";
import { hasValidSubscription } from "@/lib/api/with-subscription";
import { FREE_MAX_ACTIVE_BOARDS } from "@/lib/constants";

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
    const { workspaceName, boardName, isActive } = body;

    if (!workspaceName || !boardName || isActive === undefined) {
      return apiError(
        API_ERRORS.customBadRequest(
          "Workspace name, Board name, and isActive status are required",
        ),
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        name: workspaceName,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!workspace) {
      return apiError(API_ERRORS.customNotFound("Workspace"));
    }

    const board = await prisma.board.findFirst({
      where: {
        workspaceId: workspace.id,
        name: boardName,
      },
    });

    if (!board) {
      return apiError(API_ERRORS.customNotFound("Board"));
    }

    if (isActive && !workspace.isActive) {
      return apiError(
        API_ERRORS.customForbidden(
          "Cannot activate board in an inactive workspace. Please activate the workspace first.",
        ),
      );
    }

    if (isActive) {
      const userSubscription = await prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: "ACTIVE",
          currentPeriodEnd: { gt: new Date() },
        },
        include: {
          price: {
            include: { plan: true },
          },
        },
      });

      let maxActiveBoards = FREE_MAX_ACTIVE_BOARDS;

      if (userSubscription?.price?.plan) {
        maxActiveBoards = userSubscription.price.plan.maxActiveBoards;
      } else {
        const freePlan = await prisma.plan.findFirst({
          where: { name: "Free" },
        });
        if (freePlan) {
          maxActiveBoards = freePlan.maxActiveBoards;
        }
      }

      if (maxActiveBoards > 0) {
        const activeBoardsCount = await prisma.board.count({
          where: {
            isDeleted: false,
            isActive: true,
            members: {
              some: { userId: session.user.id, role: "ADMIN" },
            },
          },
        });

        if (activeBoardsCount >= maxActiveBoards) {
          return apiError(
            API_ERRORS.customForbidden(
              `You have reached your limit of ${maxActiveBoards} active boards on this plan.`,
            ),
          );
        }
      }
    }

    const boardMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: board.id,
          userId: session.user.id,
        },
      },
    });

    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: session.user.id,
        },
      },
    });

    if (boardMember?.role !== "ADMIN" && workspaceMember?.role !== "ADMIN") {
      return apiError(
        API_ERRORS.customForbidden("Unauthorized to update this board"),
      );
    }

    await prisma.board.update({
      where: { id: board.id },
      data: { isActive },
    });

    return NextResponse.json({
      message: "Board status updated successfully",
      isActive,
    });
  } catch (error) {
    console.error("Error updating board status:", error);
    return apiError(API_ERRORS.customInternal("Failed to update board status"));
  }
}
