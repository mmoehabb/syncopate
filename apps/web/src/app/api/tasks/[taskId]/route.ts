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

    if (!/^\d+$/.test(taskId)) {
      return apiError(API_ERRORS.customBadRequest("Invalid task ID format"));
    }

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

    const existingTask = await prisma.task.findFirst({
      where: {
        id: BigInt(taskId),
        board: {
          OR: [
            { members: { some: { userId: session.user.id } } },
            {
              workspace: {
                members: { some: { userId: session.user.id, role: "ADMIN" } },
              },
            },
          ],
        },
      },
      include: { board: true },
    });

    if (!existingTask) {
      return apiError(API_ERRORS.customNotFound("Task"));
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

    if (!/^\d+$/.test(taskId)) {
      return apiError(API_ERRORS.customBadRequest("Invalid task ID format"));
    }

    const task = await prisma.task.findFirst({
      where: {
        id: BigInt(taskId),
        board: {
          OR: [
            { members: { some: { userId: session.user.id } } },
            {
              workspace: {
                members: { some: { userId: session.user.id, role: "ADMIN" } },
              },
            },
          ],
        },
      },
      include: { board: true },
    });

    if (!task) {
      return apiError(API_ERRORS.customNotFound("Task"));
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
