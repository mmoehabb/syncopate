// Shared API Types

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  version: string;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
}

import type {
  Workspace,
  Board,
  TaskStatus,
  Task,
  Subscription,
} from "@syncopate/db";

// Board types
export interface CreateBoardPayload {
  workspaceId: string;
  name: string;
  repositoryName?: string;
  githubRepoId?: string;
}

// Github types
export interface GithubRepo {
  id: number;
  name: string;
  url: string;
  private: boolean;
}

// Task types
export interface CreateTaskPayload {
  boardId: string;
  title: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}

// Workspace types
export type WorkspaceWithBoards = Workspace & { boards: Board[] };

// Error types
export interface ApiErrorDefinition {
  error: string;
  status: number;
}
