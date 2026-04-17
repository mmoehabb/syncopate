import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { mockAxiosInstance } from "../mocks/axios";

describe("WorkspaceApi", () => {
  let workspaceApi: import("@syncopate/api").WorkspaceApi;

  beforeEach(async () => {
    mockAxiosInstance.get.mockReset();

    const { WorkspaceApi: WorkspaceApiClass } = await import("@syncopate/api");
    workspaceApi = new WorkspaceApiClass();
    (workspaceApi as any)["client"] = mockAxiosInstance;
  });

  afterEach(() => {
    mock.restore();
  });

  describe("getUserWorkspaces", () => {
    const mockWorkspaces = [
      {
        id: "1",
        name: "Test Workspace",
        role: "ADMIN",
        boards: [],
      },
    ];

    it("should fetch workspaces without boards", async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { workspaces: mockWorkspaces },
      });

      const result = await workspaceApi.getUserWorkspaces();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("", {
        params: { includeBoards: "false" },
      });
      expect(result).toEqual(mockWorkspaces);
    });

    it("should fetch workspaces with boards", async () => {
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
