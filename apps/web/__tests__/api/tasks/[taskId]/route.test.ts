import { describe, it, expect, beforeEach, mock } from "bun:test";
import { PATCH, DELETE } from "@/app/api/tasks/[taskId]/route";
import { NextRequest } from "next/server";

const mockPrisma = {
  task: {
    findFirst: mock().mockResolvedValue({
      id: BigInt(1),
      boardId: "board1",
      board: { workspaceId: "ws1" },
    }),
    update: mock().mockResolvedValue({ id: BigInt(1) }),
    delete: mock().mockResolvedValue(true),
  },
  boardActivityLog: {
    create: mock().mockResolvedValue(true),
  },
};

mock.module("@syncopate/db", () => ({
  prisma: mockPrisma,
}));

mock.module("@/lib/auth", () => ({
  auth: mock().mockImplementation(async () => {
    return { user: { id: (global as any).testUserId } };
  }),
}));

mock.module("@/lib/api/with-subscription", () => ({
  hasValidSubscription: mock().mockResolvedValue(true),
}));

mock.module("@/lib/api/error", () => ({
  API_ERRORS: {
    customForbidden: (msg: string) => ({ error: msg, status: 403 }),
    customBadRequest: (msg: string) => ({ error: msg, status: 400 }),
    UNAUTHORIZED: { error: "Unauthorized", status: 401 },
    customNotFound: (msg: string) => ({
      error: msg + " not found",
      status: 404,
    }),
    customInternal: (msg: string) => ({ error: msg, status: 500 }),
  },
  apiError: (err: any) => {
    return Response.json({ error: err.error }, { status: err.status });
  },
}));

describe("PATCH/DELETE /api/tasks/[taskId] (IDOR Fix)", () => {
  beforeEach(() => {
    mockPrisma.task.findFirst.mockClear();
    (global as any).testUserId = "user-123";
  });

  describe("PATCH /api/tasks/[taskId]", () => {
    it("should deny task update and return 404 if user has no access", async () => {
      mockPrisma.task.findFirst.mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/tasks/1", {
        method: "PATCH",
        body: JSON.stringify({ status: "DONE" }),
      });

      const response = await PATCH(req, {
        params: Promise.resolve({ taskId: "1" }),
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Task not found");
    });

    it("should allow task update if user has access", async () => {
      mockPrisma.task.findFirst.mockResolvedValueOnce({
        id: BigInt(1),
        boardId: "board1",
        board: { workspaceId: "ws1" },
      });

      const req = new NextRequest("http://localhost:3000/api/tasks/1", {
        method: "PATCH",
        body: JSON.stringify({ status: "DONE" }),
      });

      const response = await PATCH(req, {
        params: Promise.resolve({ taskId: "1" }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/tasks/[taskId]", () => {
    it("should deny task deletion and return 404 if user has no access", async () => {
      mockPrisma.task.findFirst.mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/tasks/1", {
        method: "DELETE",
      });

      const response = await DELETE(req, {
        params: Promise.resolve({ taskId: "1" }),
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Task not found");
    });

    it("should allow task deletion if user has access", async () => {
      mockPrisma.task.findFirst.mockResolvedValueOnce({
        id: BigInt(1),
        boardId: "board1",
        board: { workspaceId: "ws1" },
      });

      const req = new NextRequest("http://localhost:3000/api/tasks/1", {
        method: "DELETE",
      });

      const response = await DELETE(req, {
        params: Promise.resolve({ taskId: "1" }),
      });
      expect(response.status).toBe(200);
    });
  });
});
