import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { mockAxiosInstance } from "../mocks/axios";

describe("WorkspaceApi", () => {
  let workspaceApi: import("@/lib/api/WorkspaceApi").WorkspaceApi;

  beforeEach(async () => {
    mockAxiosInstance.get.mockReset();

    const { WorkspaceApi: WorkspaceApiClass } = await import(
      "@/lib/api/WorkspaceApi"
    );
    workspaceApi = new WorkspaceApiClass();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("getUserWorkspaces", () => {
    it("should fetch workspaces without boards", async () => {
      const mockWorkspaces = [{ id: "1", name: "Workspace 1" }];

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { workspaces: mockWorkspaces },
      });

      const result = await workspaceApi.getUserWorkspaces(false);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("", {
        params: { includeBoards: "false" },
      });
      expect(result).toEqual(mockWorkspaces);
    });

    it("should fetch workspaces with boards", async () => {
      const mockWorkspaces = [{ id: "1", name: "Workspace 1", boards: [] }];

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { workspaces: mockWorkspaces },
      });

      const result = await workspaceApi.getUserWorkspaces(true);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("", {
        params: { includeBoards: "true" },
      });
      expect(result).toEqual(mockWorkspaces);
    });
  });
});
