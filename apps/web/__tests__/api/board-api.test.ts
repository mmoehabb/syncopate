import { describe, it, expect, beforeEach } from "bun:test";
import { mockAxiosInstance } from "../mocks/axios";
import type { BoardApi as BoardApiType } from "@/lib/api/BoardApi";

describe("BoardApi", () => {
  let boardApi: BoardApiType;

  beforeEach(async () => {
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.delete.mockClear();
    // Dynamically import to ensure mock is registered first
    const { BoardApi } = await import("@/lib/api/BoardApi");
    boardApi = new BoardApi();
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
      mockAxiosInstance.post.mockResolvedValue({
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
      mockAxiosInstance.post.mockResolvedValue({
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
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(boardApi.createBoard(payload)).rejects.toThrow(
        "Network Error",
      );
    });
  });

  describe("deleteBoard", () => {
    it("should call DELETE /api/boards with correct query parameters", async () => {
      const workspaceName = "my-workspace";
      const boardName = "my-board";
      const mockResponse = { message: "Board deleted successfully" };
      mockAxiosInstance.delete.mockResolvedValue({
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
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(
        boardApi.deleteBoard(workspaceName, boardName),
      ).rejects.toThrow("Delete failed");
    });
  });
});
