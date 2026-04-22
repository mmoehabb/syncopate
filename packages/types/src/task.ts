import type { TaskStatus } from "@syncopate/db";

export interface CreateTaskPayload {
  boardId: string;
  title: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}
