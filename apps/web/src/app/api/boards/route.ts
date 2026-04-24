import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";
import { hasValidSubscription } from "@/lib/api/with-subscription";
import { FREE_MAX_ACTIVE_BOARDS } from "@/lib/constants";

export async function POST(req: Request) {
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
    const { workspaceId, name, repositoryName, githubRepoId } = body;

    if (!workspaceId || !name) {
      return apiError(
        API_ERRORS.customBadRequest("Workspace ID and Board name are required"),
      );
    }

    if (!githubRepoId) {
      return apiError(
        API_ERRORS.customBadRequest(
          "A linked GitHub repository is required to create a board",
        ),
      );
    }

    const nameRegex = /^[a-zA-Z0-9-_]+$/;
    if (!nameRegex.test(name)) {
      return apiError(
        API_ERRORS.customBadRequest(
          "Board name can only contain letters, numbers, hyphens, and underscores. No spaces or special characters are allowed.",
        ),
      );
    }

    // Verify user has access to this workspace and check if it's active
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!workspace || workspace.members.length === 0) {
      return apiError(
        API_ERRORS.custom404("Workspace not found or unauthorized"),
      );
    }

    // Check if a board with this GitHub repo ID already exists globally
    const existingBoard = await prisma.board.findFirst({
      where: {
        githubRepoId: String(githubRepoId),
      },
      include: {
        workspace: true,
      },
    });

    if (existingBoard) {
      if (existingBoard.isDeleted) {
        return apiError(
          API_ERRORS.customBadRequest(
            `A board for this repository already exists but is soft-deleted. You can restore it using the command: /restore-board ${existingBoard.workspace.name}/${existingBoard.name}`,
          ),
        );
      }
      return apiError(
        API_ERRORS.customBadRequest(
          "A board for this repository already exists. Every repository can only have one active board.",
        ),
      );
    }

    let isBoardActive = true;
    if (!workspace.isActive) {
      isBoardActive = false;
    } else {
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
          isBoardActive = false;
        }
      }
    }

    const board = await prisma.board.create({
      data: {
        workspaceId,
        name,
        repositoryName,
        githubRepoId: String(githubRepoId),
        isActive: isBoardActive,
      },
    });

    // Add user as admin of the newly created board
    await prisma.boardMember.create({
      data: {
        boardId: board.id,
        userId: session.user.id,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return apiError(API_ERRORS.customInternal("Failed to create board"));
  }
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  const isValidSubscription = await hasValidSubscription(session.user.id);
  if (!isValidSubscription) {
    return apiError(API_ERRORS.customForbidden("Active subscription required"));
  }

  try {
    const url = new URL(req.url);
    const workspaceName = url.searchParams.get("workspace");
    const boardName = url.searchParams.get("board");

    if (!workspaceName || !boardName) {
      return apiError(
        API_ERRORS.customBadRequest(
          "Workspace name and Board name are required",
        ),
      );
    }

    // Find the workspace that the user is a member of with the given name
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

    // Find the board in this workspace
    const board = await prisma.board.findFirst({
      where: {
        workspaceId: workspace.id,
        name: boardName,
      },
    });

    if (!board) {
      return apiError(API_ERRORS.customNotFound("Board"));
    }

    // Check if user is an ADMIN of the board or workspace
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
        API_ERRORS.customForbidden("Unauthorized to delete this board"),
      );
    }

    await prisma.board.update({
      where: { id: board.id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    return apiError(API_ERRORS.customInternal("Failed to delete board"));
  }
}
