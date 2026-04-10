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
    const { workspaceId, name, repositoryName, githubRepoId } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "Workspace ID and Board name are required" },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!workspaceMember) {
      return NextResponse.json(
        { error: "Workspace not found or unauthorized" },
        { status: 404 }
      );
    }

    const board = await prisma.board.create({
      data: {
        workspaceId,
        name,
        repositoryName,
        githubRepoId: githubRepoId ? String(githubRepoId) : null,
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
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
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

    if (!workspaceName || !boardName) {
      return NextResponse.json(
        { error: "Workspace name and Board name are required" },
        { status: 400 }
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
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Find the board in this workspace
    const board = await prisma.board.findFirst({
      where: {
        workspaceId: workspace.id,
        name: boardName,
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
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
       return NextResponse.json(
        { error: "Unauthorized to delete this board" },
        { status: 403 }
      );
    }

    await prisma.board.delete({
      where: { id: board.id },
    });

    return NextResponse.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}
