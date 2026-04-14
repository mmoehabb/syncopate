import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { workspaceName, boardName, identifier } = body;

    if (!workspaceName || !boardName || !identifier) {
      return NextResponse.json(
        {
          error: "Workspace name, board name, and user identifier are required",
        },
        { status: 400 },
      );
    }

    // Find the workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        name: workspaceName,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Find the board
    const board = await prisma.board.findFirst({
      where: {
        workspaceId: workspace.id,
        name: boardName,
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "Unauthorized to add members to this board" },
        { status: 403 },
      );
    }

    // Find the target user by ID or email
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: identifier }, { email: identifier }],
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "User is already a member of this board" },
        { status: 400 },
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
    return NextResponse.json(
      { error: "Failed to add member to board" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const workspaceName = url.searchParams.get("workspace");
    const boardName = url.searchParams.get("board");
    const identifier = url.searchParams.get("identifier");

    if (!workspaceName || !boardName || !identifier) {
      return NextResponse.json(
        {
          error: "Workspace name, board name, and user identifier are required",
        },
        { status: 400 },
      );
    }

    // Find the workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        name: workspaceName,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Find the board
    const board = await prisma.board.findFirst({
      where: {
        workspaceId: workspace.id,
        name: boardName,
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "Unauthorized to remove members from this board" },
        { status: 403 },
      );
    }

    // Find the target user by ID or email
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: identifier }, { email: identifier }],
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
  } catch (error: any) {
    // If the record didn't exist in the first place, Prisma throws P2025
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "User is not a member of this board" },
        { status: 404 },
      );
    }
    console.error("Error removing member from board:", error);
    return NextResponse.json(
      { error: "Failed to remove member from board" },
      { status: 500 },
    );
  }
}
