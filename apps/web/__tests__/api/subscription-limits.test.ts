import { expect, test, describe, beforeEach, mock, afterEach } from "bun:test";
import { enforceSubscriptionLimits } from "../../src/lib/api/subscription-limits";
import { prisma } from "@syncopate/db";

// Mocking prisma globally
mock.module("@syncopate/db", () => ({
  prisma: {
    subscription: {
      findFirst: mock(),
    },
    plan: {
      findFirst: mock(),
    },
    workspace: {
      findMany: mock(),
      updateMany: mock(),
    },
    board: {
      findMany: mock(),
      updateMany: mock(),
    },
  },
}));

describe("enforceSubscriptionLimits", () => {
  beforeEach(() => {
    // Reset mocks
    (prisma.subscription.findFirst as any).mockReset();
    (prisma.plan.findFirst as any).mockReset();
    (prisma.workspace.findMany as any).mockReset();
    (prisma.workspace.updateMany as any).mockReset();
    (prisma.board.findMany as any).mockReset();
    (prisma.board.updateMany as any).mockReset();
  });

  test("should downgrade workspaces to 1 and boards to 1 when no active subscription (fallback to free plan)", async () => {
    const userId = "user-123";

    (prisma.subscription.findFirst as any).mockResolvedValue(null);
    (prisma.plan.findFirst as any).mockResolvedValue({
      maxWorkspaces: 1,
      maxActiveBoards: 1,
    });

    (prisma.workspace.findMany as any).mockResolvedValue([
      { id: "ws3", createdAt: new Date("2024-03-01") }, // Newest
      { id: "ws2", createdAt: new Date("2024-02-01") },
      { id: "ws1", createdAt: new Date("2024-01-01") }, // Oldest
    ]);

    (prisma.board.findMany as any).mockResolvedValue([
      { id: "b3", createdAt: new Date("2024-03-01") }, // Newest
      { id: "b2", createdAt: new Date("2024-02-01") },
      { id: "b1", createdAt: new Date("2024-01-01") }, // Oldest
    ]);

    await enforceSubscriptionLimits(userId);

    // Verify workspace limit enforcement (1 allowed, so 2 deactivated)
    expect((prisma.workspace.updateMany as any).mock.calls.length).toBe(1);
    expect(
      (prisma.workspace.updateMany as any).mock.calls[0][0].where.id.in,
    ).toEqual(["ws2", "ws1"]);
    expect(
      (prisma.workspace.updateMany as any).mock.calls[0][0].data.isActive,
    ).toBe(false);

    // Verify board limit enforcement (1 allowed, so 2 deactivated)
    expect((prisma.board.updateMany as any).mock.calls.length).toBe(1);
    expect(
      (prisma.board.updateMany as any).mock.calls[0][0].where.id.in,
    ).toEqual(["b2", "b1"]);
    expect(
      (prisma.board.updateMany as any).mock.calls[0][0].data.isActive,
    ).toBe(false);
  });

  test("should not deactivate if under the limits", async () => {
    const userId = "user-123";

    (prisma.subscription.findFirst as any).mockResolvedValue({
      price: {
        plan: {
          maxWorkspaces: 3,
          maxActiveBoards: 5,
        },
      },
    });

    (prisma.workspace.findMany as any).mockResolvedValue([
      { id: "ws2", createdAt: new Date("2024-02-01") },
      { id: "ws1", createdAt: new Date("2024-01-01") },
    ]);

    (prisma.board.findMany as any).mockResolvedValue([
      { id: "b3", createdAt: new Date("2024-03-01") },
      { id: "b2", createdAt: new Date("2024-02-01") },
      { id: "b1", createdAt: new Date("2024-01-01") },
    ]);

    await enforceSubscriptionLimits(userId);

    // Limits are not exceeded, so no updates should occur
    expect((prisma.workspace.updateMany as any).mock.calls.length).toBe(0);
    expect((prisma.board.updateMany as any).mock.calls.length).toBe(0);
  });

  test("should handle unlimited plans (-1)", async () => {
    const userId = "user-123";

    (prisma.subscription.findFirst as any).mockResolvedValue({
      price: {
        plan: {
          maxWorkspaces: -1,
          maxActiveBoards: -1,
        },
      },
    });

    // Even with many items, no deactivation
    const manyItems = Array.from({ length: 50 }).map((_, i) => ({
      id: `id-${i}`,
      createdAt: new Date(),
    }));
    (prisma.workspace.findMany as any).mockResolvedValue(manyItems);
    (prisma.board.findMany as any).mockResolvedValue(manyItems);

    await enforceSubscriptionLimits(userId);

    expect((prisma.workspace.updateMany as any).mock.calls.length).toBe(0);
    expect((prisma.board.updateMany as any).mock.calls.length).toBe(0);
  });
});
