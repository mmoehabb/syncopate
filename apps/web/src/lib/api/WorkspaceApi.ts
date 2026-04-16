import { ApiClient } from "./ApiClient";
import { AxiosRequestConfig } from "axios";
import type { Workspace, Board } from "@prisma/client";

export type WorkspaceWithBoards = Workspace & { boards: Board[] };

export class WorkspaceApi extends ApiClient {
  constructor(baseURL?: string) {
    super(baseURL ? `${baseURL}/api/workspaces` : "/api/workspaces");
  }

  public async getUserWorkspaces(
    includeBoards: boolean = false,
    config?: AxiosRequestConfig,
  ): Promise<WorkspaceWithBoards[] | Partial<Workspace>[]> {
    const response = await this.get<{ workspaces: WorkspaceWithBoards[] }>("", {
      ...config,
      params: {
        ...config?.params,
        includeBoards: includeBoards ? "true" : "false",
      },
    });
    return response.data.workspaces;
  }
}

export const workspaceApi = new WorkspaceApi();
