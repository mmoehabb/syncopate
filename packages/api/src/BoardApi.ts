import { ApiClient } from "./ApiClient";
import type { CreateBoardPayload } from "@syncopate/types";

export class BoardApi extends ApiClient {
  constructor() {
    super("/api/boards");
  }

  public async createBoard(payload: CreateBoardPayload): Promise<unknown> {
    const response = await this.post<{ board: unknown }>("", payload);
    return response.data.board;
  }

  public async deleteBoard(
    workspaceName: string,
    boardName: string,
  ): Promise<{ message: string }> {
    const response = await this.delete<{ message: string }>("", {
      params: {
        workspace: workspaceName,
        board: boardName,
      },
    });
    return response.data;
  }

  public async updateBoardStatus(
    workspaceName: string,
    boardName: string,
    isActive: boolean,
  ): Promise<{ message: string; isActive: boolean }> {
    const response = await this.put<{ message: string; isActive: boolean }>("/status", {
      workspaceName,
      boardName,
      isActive,
    });
    return response.data;
  }

  public async addMember(
    workspaceName: string,
    boardName: string,
    identifier: string,
  ): Promise<unknown> {
    const response = await this.post<{ member: unknown }>("/members", {
      workspaceName,
      boardName,
      identifier,
    });
    return response.data.member;
  }

  public async removeMember(
    workspaceName: string,
    boardName: string,
    identifier: string,
  ): Promise<{ message: string }> {
    const response = await this.delete<{ message: string }>("/members", {
      params: {
        workspace: workspaceName,
        board: boardName,
        identifier,
      },
    });
    return response.data;
  }
}

export const boardApi = new BoardApi();
