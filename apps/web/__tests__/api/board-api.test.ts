import { describe, it, expect, beforeEach } from "bun:test";
import { mockAxiosInstance } from "../mocks/axios";
import { BoardApi } from "@syncopate/api";

describe("BoardApi", () => {
  let boardApi: BoardApi;

  beforeEach(() => {
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.delete.mockClear();
    boardApi = new BoardApi();
    boardApi["client"] = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAxiosInstance as any;
  });

  describe("createBoard", () => {
    it("should call POST /api/boards with correct payload", async () => {
      const payload = {
        workspaceId: "ws_123",
        name: "New Board",
        repositoryName: "owner/repo",
        githubRepoId: "123456",
      };
      const mockBoard = { id: "board_123", ...payload };
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { board: mockBoard },
      });

      const result = await boardApi.createBoard(payload);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "",
        payload,
        undefined,
      );
      expect(result).toEqual(mockBoard);
    });

    it("should handle minimal payload", async () => {
      const payload = {
        workspaceId: "ws_123",
        name: "Minimal Board",
      };
      const mockBoard = { id: "board_456", ...payload };
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { board: mockBoard },
      });

      const result = await boardApi.createBoard(payload);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "",
        payload,
        undefined,
      );
      expect(result).toEqual(mockBoard);
    });

    it("should propagate errors", async () => {
      const payload = {
        workspaceId: "ws_123",
        name: "Error Board",
      };
      const error = new Error("Network Error");
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(boardApi.createBoard(payload)).rejects.toThrow(
        "Network Error",
      );
    });
  });

  describe("addMember", () => {
    it("should call POST /api/boards/members with correct payload", async () => {
      const workspaceName = "my-workspace";
      const boardName = "my-board";
      const identifier = "user_123";
      const mockMember = {
        boardId: "board_123",
        userId: "user_123",
        role: "MEMBER",
      };
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { member: mockMember },
      });

      const result = await boardApi.addMember(
        workspaceName,
        boardName,
        identifier,
      );

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/members",
        {
          workspaceName,
          boardName,
          identifier,
        },
        undefined,
      );
      expect(result).toEqual(mockMember);
    });

    it("should propagate errors", async () => {
      const workspaceName = "my-workspace";
      const boardName = "my-board";
      const identifier = "user_123";
      const error = new Error("Network Error");
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(
        boardApi.addMember(workspaceName, boardName, identifier),
      ).rejects.toThrow("Network Error");
    });
  });

  describe("removeMember", () => {
    it("should call DELETE /api/boards/members with correct query parameters", async () => {
      const workspaceName = "my-workspace";
      const boardName = "my-board";
      const identifier = "user_123";
      const mockResponse = { message: "Member removed successfully" };
      mockAxiosInstance.delete.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await boardApi.removeMember(
        workspaceName,
        boardName,
        identifier,
      );

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/members", {
        params: {
          workspace: workspaceName,
          board: boardName,
          identifier,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors", async () => {
      const workspaceName = "my-workspace";
      const boardName = "my-board";
      const identifier = "user_123";
      const error = new Error("Delete failed");
      mockAxiosInstance.delete.mockRejectedValueOnce(error);

      await expect(
        boardApi.removeMember(workspaceName, boardName, identifier),
      ).rejects.toThrow("Delete failed");
    });
  });

  describe("deleteBoard", () => {
    it("should call DELETE /api/boards with correct query parameters", async () => {
      const workspaceName = "my-workspace";
      const boardName = "my-board";
      const mockResponse = { message: "Board deleted successfully" };
      mockAxiosInstance.delete.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await boardApi.deleteBoard(workspaceName, boardName);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("", {
        params: {
          workspace: workspaceName,
          board: boardName,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors", async () => {
      const workspaceName = "my-workspace";
      const boardName = "my-board";
      const error = new Error("Delete failed");
      mockAxiosInstance.delete.mockRejectedValueOnce(error);

      await expect(
        boardApi.deleteBoard(workspaceName, boardName),
      ).rejects.toThrow("Delete failed");
    });
  });
});
