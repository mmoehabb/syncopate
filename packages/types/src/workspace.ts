import type { Workspace, Board } from "@syncopate/db";

export type WorkspaceWithBoards = Workspace & { boards: Board[] };

export interface CreateWorkspacePayload {
  name: string;
}
