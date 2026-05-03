import type { TaskStatus } from "@syncoboard/db";

export interface CreateTaskPayload {
  boardId: string;
  title: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}
