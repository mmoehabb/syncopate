import { describe, it, expect, mock, beforeEach } from "bun:test";

const mockAuth = mock();
mock.module("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = {
  user: {
    findFirst: mock(),
  },
  plan: {
    findUnique: mock(),
  },
  subscription: {
    create: mock(),
  },
};

mock.module("@syncoboard/db", () => ({
  prisma: mockPrisma,
}));

const mockRevalidatePath = mock();
mock.module("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

describe("subscribeToTrialPlan", () => {
  let subscribeToTrialPlan: any;

  beforeEach(async () => {
    mockAuth.mockReset();
    mockPrisma.user.findFirst.mockReset();
    mockPrisma.plan.findUnique.mockReset();
    mockPrisma.subscription.create.mockReset();
    mockRevalidatePath.mockReset();

    const module = await import("@/app/dashboard/actions");
    subscribeToTrialPlan = module.subscribeToTrialPlan;
  });

  it("should throw an error if not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(subscribeToTrialPlan("plan-1")).rejects.toThrow("Not authenticated");
  });

  it("should throw an error if user already has an active subscription", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      id: "user-1",
      subscriptions: [{ status: "ACTIVE" }],
    });

    await expect(subscribeToTrialPlan("plan-1")).rejects.toThrow("User already has an active subscription");
  });

  it("should throw an error if trial plan is not found", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: "user-1", subscriptions: [] });
    mockPrisma.plan.findUnique.mockResolvedValueOnce(null);

    await expect(subscribeToTrialPlan("invalid-plan")).rejects.toThrow("Valid trial plan not found");
  });

  it("should throw an error if plan is not a trial plan", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: "user-1", subscriptions: [] });
    mockPrisma.plan.findUnique.mockResolvedValueOnce({ id: "plan-1", isTrial: false });

    await expect(subscribeToTrialPlan("plan-1")).rejects.toThrow("Valid trial plan not found");
  });

  it("should throw an error if plan has no prices", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: "user-1", subscriptions: [] });
    mockPrisma.plan.findUnique.mockResolvedValueOnce({ id: "plan-1", isTrial: true, prices: [] });

    await expect(subscribeToTrialPlan("plan-1")).rejects.toThrow("No price found for trial plan");
  });

  it("should successfully subscribe to a WEEKLY trial plan", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: "user-1", subscriptions: [] });
    mockPrisma.plan.findUnique.mockResolvedValueOnce({
      id: "plan-1",
      isTrial: true,
      prices: [{ id: "price-1", interval: "WEEK", intervalCount: 1 }],
    });

    await subscribeToTrialPlan("plan-1");

    expect(mockPrisma.subscription.create).toHaveBeenCalled();
    const callArgs = mockPrisma.subscription.create.mock.calls[0][0];
    expect(callArgs.data.userId).toBe("user-1");
    expect(callArgs.data.priceId).toBe("price-1");

    const start = callArgs.data.currentPeriodStart;
    const end = callArgs.data.currentPeriodEnd;
    const diffInDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffInDays).toBe(7);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("should successfully subscribe to a MONTHLY trial plan", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: "user-1", subscriptions: [] });
    mockPrisma.plan.findUnique.mockResolvedValueOnce({
      id: "plan-1",
      isTrial: true,
      prices: [{ id: "price-1", interval: "MONTH", intervalCount: 2 }],
    });

    await subscribeToTrialPlan("plan-1");

    expect(mockPrisma.subscription.create).toHaveBeenCalled();
    const callArgs = mockPrisma.subscription.create.mock.calls[0][0];
    const start = callArgs.data.currentPeriodStart;
    const end = callArgs.data.currentPeriodEnd;

    const expectedEnd = new Date(start);
    expectedEnd.setMonth(start.getMonth() + 2);
    // Allow 1 second difference to avoid flakiness
    expect(Math.abs(end.getTime() - expectedEnd.getTime())).toBeLessThan(1000);
  });

  it("should successfully subscribe to a YEARLY trial plan", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: "user-1", subscriptions: [] });
    mockPrisma.plan.findUnique.mockResolvedValueOnce({
      id: "plan-1",
      isTrial: true,
      prices: [{ id: "price-1", interval: "YEAR", intervalCount: 1 }],
    });

    await subscribeToTrialPlan("plan-1");

    expect(mockPrisma.subscription.create).toHaveBeenCalled();
    const callArgs = mockPrisma.subscription.create.mock.calls[0][0];
    const start = callArgs.data.currentPeriodStart;
    const end = callArgs.data.currentPeriodEnd;

    const expectedEnd = new Date(start);
    expectedEnd.setFullYear(start.getFullYear() + 1);
    // Allow 1 second difference to avoid flakiness
    expect(Math.abs(end.getTime() - expectedEnd.getTime())).toBeLessThan(1000);
  });
});
