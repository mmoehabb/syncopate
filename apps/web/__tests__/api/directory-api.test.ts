import { describe, it, expect, beforeEach } from "bun:test";
import { mockAxiosInstance } from "../mocks/axios";
import type { AxiosInstance } from "axios";
import { DirectoryApi } from "@syncopate/api";
import type { DirectoryResponse } from "@syncopate/types";

describe("DirectoryApi", () => {
  let directoryApi: DirectoryApi;

  beforeEach(() => {
    mockAxiosInstance.get.mockClear();
    directoryApi = new DirectoryApi();
    directoryApi["client"] = mockAxiosInstance as unknown as AxiosInstance;
  });

  describe("getDirectory", () => {
    it("should call GET /api/directory with correct path parameter", async () => {
      const path = "/workspace/board";
      const mockResponse: DirectoryResponse = {
        path,
        type: "Board",
        id: "board_123",
        entries: [{ id: "123", name: "SYNC-123", type: "Task" }],
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await directoryApi.getDirectory(path);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("", {
        params: { path },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors", async () => {
      const path = "/invalid";
      const error = new Error("Network Error");
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(directoryApi.getDirectory(path)).rejects.toThrow(
        "Network Error",
      );
    });
  });
});
