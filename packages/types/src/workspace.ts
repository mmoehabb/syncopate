import type { Workspace, Board } from "@syncoboard/db";

export type WorkspaceWithBoards = Workspace & { boards: Board[] };

export interface CreateWorkspacePayload {
  name: string;
}
