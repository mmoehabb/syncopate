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

// Directory Types
export type DirectoryEntryType = "Workspace" | "Board" | "Task";

export interface DirectoryEntry {
  id: string;
  name: string; // The display name or title
  title?: string; // Optional title, mainly for Tasks
  status?: string; // Optional status, mainly for Tasks
  type: DirectoryEntryType;
}

export interface DirectoryResponse {
  path: string;
  type: "Root" | "Workspace" | "Board" | "Task"; // The type of the current directory
  id?: string; // The ID of the current directory entity, if applicable
  entries: DirectoryEntry[];
  hasMoreByStatus?: Record<string, boolean>; // Used to indicate if a status group has more items
}

// Error types
export interface ApiErrorDefinition {
  error: string;
  status: number;
}
