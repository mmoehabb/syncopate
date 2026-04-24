import { describe, it, expect, beforeEach, mock } from "bun:test";
import { PATCH, DELETE } from "@/app/api/tasks/[taskId]/route";
import { NextRequest } from "next/server";

const mockPrisma = {
  task: {
    findUnique: mock().mockResolvedValue({
      id: BigInt(1),
      boardId: "board1",
      board: { workspaceId: "ws1" },
    }),
    update: mock().mockResolvedValue({ id: BigInt(1) }),
    delete: mock().mockResolvedValue(true),
  },
  boardMember: {
    findUnique: mock().mockResolvedValue(null),
  },
  workspaceMember: {
    findUnique: mock().mockResolvedValue(null),
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
    mockPrisma.workspaceMember.findUnique.mockClear();
    mockPrisma.boardMember.findUnique.mockClear();
    (global as any).testUserId = "user-123";
  });

  describe("PATCH /api/tasks/[taskId]", () => {
    it("should deny task update for a non-admin workspace member who is not on the board", async () => {
      mockPrisma.boardMember.findUnique.mockResolvedValueOnce(null);
      mockPrisma.workspaceMember.findUnique.mockResolvedValueOnce({
        role: "MEMBER",
      });

      const req = new NextRequest("http://localhost:3000/api/tasks/1", {
        method: "PATCH",
        body: JSON.stringify({ status: "DONE" }),
      });

      const response = await PATCH(req, {
        params: Promise.resolve({ taskId: "1" }),
      });
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized access to this task");
    });

    it("should allow task update for a workspace admin even if not directly on the board", async () => {
      mockPrisma.boardMember.findUnique.mockResolvedValueOnce(null);
      mockPrisma.workspaceMember.findUnique.mockResolvedValueOnce({
        role: "ADMIN",
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
    it("should deny task deletion for a non-admin workspace member who is not on the board", async () => {
      mockPrisma.boardMember.findUnique.mockResolvedValueOnce(null);
      mockPrisma.workspaceMember.findUnique.mockResolvedValueOnce({
        role: "MEMBER",
      });

      const req = new NextRequest("http://localhost:3000/api/tasks/1", {
        method: "DELETE",
      });

      const response = await DELETE(req, {
        params: Promise.resolve({ taskId: "1" }),
      });
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized access to delete this task");
    });

    it("should allow task deletion for a workspace admin even if not directly on the board", async () => {
      mockPrisma.boardMember.findUnique.mockResolvedValueOnce(null);
      mockPrisma.workspaceMember.findUnique.mockResolvedValueOnce({
        role: "ADMIN",
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
