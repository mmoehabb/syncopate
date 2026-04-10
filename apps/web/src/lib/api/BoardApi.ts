import { ApiClient } from "./ApiClient";

export interface CreateBoardPayload {
  workspaceId: string;
  name: string;
  repositoryName?: string;
  githubRepoId?: string;
}

export class BoardApi extends ApiClient {
  constructor() {
    super("/api/boards");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async createBoard(payload: CreateBoardPayload): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.post<{ board: any }>("", payload);
    return response.data.board;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async deleteBoard(workspaceName: string, boardName: string): Promise<any> {
    const response = await this.delete<{ message: string }>("", {
      params: {
        workspace: workspaceName,
        board: boardName,
      },
    });
    return response.data;
  }
}

export const boardApi = new BoardApi();
