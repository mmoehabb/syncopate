import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";
import { TaskStatus } from "@prisma/client";
import { hasValidSubscription } from "@/lib/api/with-subscription";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  const isValidSubscription = await hasValidSubscription(session.user.id);
  if (!isValidSubscription) {
    return apiError(API_ERRORS.customForbidden("Active subscription required"));
  }

  try {
    const resolvedParams = await params;
    const taskId = resolvedParams.taskId;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return apiError(API_ERRORS.customBadRequest("Status is required"));
    }

    const validStatuses: TaskStatus[] = [
      "TODO",
      "IN_PROGRESS",
      "IN_REVIEW",
      "CHANGES_REQUESTED",
      "DONE",
      "CLOSED",
    ];

    if (!validStatuses.includes(status as TaskStatus)) {
      return apiError(
        API_ERRORS.customBadRequest(`Invalid task status: ${status}`),
      );
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: BigInt(taskId) },
      include: { board: true },
    });

    if (!existingTask) {
      return apiError(API_ERRORS.customNotFound("Task"));
    }

    // Verify user has access to this board
    const boardMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: existingTask.boardId,
          userId: session.user.id,
        },
      },
    });

    if (!boardMember) {
      const workspaceMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: existingTask.board.workspaceId,
            userId: session.user.id,
          },
        },
      });

      if (workspaceMember?.role !== "ADMIN") {
        return apiError(
          API_ERRORS.customForbidden("Unauthorized access to this task"),
        );
      }
    }

    const task = await prisma.task.update({
      where: { id: BigInt(taskId) },
      data: { status: status as TaskStatus },
    });

    if (existingTask.status !== status) {
      await prisma.boardActivityLog.create({
        data: {
          boardId: existingTask.boardId,
          type: "TASK_UPDATE",
          actorId: session.user.id,
          taskId: BigInt(taskId),
        },
      });
    }

    return NextResponse.json(
      { task: { ...task, id: task.id.toString() } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating task status:", error);
    return apiError(API_ERRORS.customInternal("Failed to update task status"));
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  const isValidSubscription = await hasValidSubscription(session.user.id);
  if (!isValidSubscription) {
    return apiError(API_ERRORS.customForbidden("Active subscription required"));
  }

  try {
    const resolvedParams = await params;
    const taskId = resolvedParams.taskId;

    const task = await prisma.task.findUnique({
      where: { id: BigInt(taskId) },
      include: { board: true },
    });

    if (!task) {
      return apiError(API_ERRORS.customNotFound("Task"));
    }

    // Verify user has access to this board
    const boardMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId: session.user.id,
        },
      },
    });

    if (!boardMember) {
      const workspaceMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: task.board.workspaceId,
            userId: session.user.id,
          },
        },
      });

      if (workspaceMember?.role !== "ADMIN") {
        return apiError(
          API_ERRORS.customForbidden("Unauthorized access to delete this task"),
        );
      }
    }

    await prisma.task.delete({
      where: { id: BigInt(taskId) },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return apiError(API_ERRORS.customInternal("Failed to delete task"));
  }
}
