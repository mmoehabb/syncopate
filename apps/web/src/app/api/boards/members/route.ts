import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    const body = await req.json();
    const { workspaceName, boardName, identifier } = body;

    if (!workspaceName || !boardName || !identifier) {
      return apiError(
        API_ERRORS.customBadRequest(
          "Workspace name, board name, and user identifier are required",
        ),
      );
    }

    // Find the workspace that the user is a member of
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

    // Find the board that the user is a member of, or they are an admin of the workspace
    const board = await prisma.board.findFirst({
      where: {
        workspaceId: workspace.id,
        name: boardName,
        OR: [
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            workspace: {
              members: {
                some: {
                  userId: session.user.id,
                  role: "ADMIN",
                },
              },
            },
          },
        ],
      },
    });

    if (!board) {
      return apiError(API_ERRORS.customNotFound("Board"));
    }

    // Check if the requesting user is an ADMIN of the board or workspace
    const boardMemberReq = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: board.id,
          userId: session.user.id,
        },
      },
    });

    const workspaceMemberReq = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: session.user.id,
        },
      },
    });

    if (
      boardMemberReq?.role !== "ADMIN" &&
      workspaceMemberReq?.role !== "ADMIN"
    ) {
      return apiError(
        API_ERRORS.customForbidden("Unauthorized to add members to this board"),
      );
    }

    // Find the target user by ID or email
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: identifier }, { email: identifier }],
      },
    });

    if (!targetUser) {
      return apiError(API_ERRORS.customNotFound("User"));
    }

    // Check if already a member
    const existingMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: board.id,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return apiError(
        API_ERRORS.customBadRequest("User is already a member of this board"),
      );
    }

    const newMember = await prisma.boardMember.create({
      data: {
        boardId: board.id,
        userId: targetUser.id,
        role: "MEMBER",
      },
    });

    // To prevent bigInt serialization error, we don't return bigInt ID
    return NextResponse.json(
      {
        member: {
          boardId: newMember.boardId,
          userId: newMember.userId,
          role: newMember.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding member to board:", error);
    return apiError(API_ERRORS.customInternal("Failed to add member to board"));
  }
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    const url = new URL(req.url);
    const workspaceName = url.searchParams.get("workspace");
    const boardName = url.searchParams.get("board");
    const identifier = url.searchParams.get("identifier");

    if (!workspaceName || !boardName || !identifier) {
      return apiError(
        API_ERRORS.customBadRequest(
          "Workspace name, board name, and user identifier are required",
        ),
      );
    }

    // Find the workspace that the user is a member of
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

    // Find the board that the user is a member of, or they are an admin of the workspace
    const board = await prisma.board.findFirst({
      where: {
        workspaceId: workspace.id,
        name: boardName,
        OR: [
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            workspace: {
              members: {
                some: {
                  userId: session.user.id,
                  role: "ADMIN",
                },
              },
            },
          },
        ],
      },
    });

    if (!board) {
      return apiError(API_ERRORS.customNotFound("Board"));
    }

    // Check if the requesting user is an ADMIN of the board or workspace
    const boardMemberReq = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: board.id,
          userId: session.user.id,
        },
      },
    });

    const workspaceMemberReq = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: session.user.id,
        },
      },
    });

    if (
      boardMemberReq?.role !== "ADMIN" &&
      workspaceMemberReq?.role !== "ADMIN"
    ) {
      return apiError(
        API_ERRORS.customForbidden(
          "Unauthorized to remove members from this board",
        ),
      );
    }

    // Find the target user by ID or email
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: identifier }, { email: identifier }],
      },
    });

    if (!targetUser) {
      return apiError(API_ERRORS.customNotFound("User"));
    }

    // Remove the user
    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId: board.id,
          userId: targetUser.id,
        },
      },
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error: unknown) {
    // If the record didn't exist in the first place, Prisma throws P2025
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return apiError(
        API_ERRORS.custom404("User is not a member of this board"),
      );
    }
    console.error("Error removing member from board:", error);
    return apiError(
      API_ERRORS.customInternal("Failed to remove member from board"),
    );
  }
}
