"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { revalidatePath } from "next/cache";
import { hasValidSubscription } from "@/lib/api/with-subscription";

export async function subscribeToFreePlan() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existingSubscription = await prisma.user.findFirst({
    where: { id: session.user.id },
    include: { subscriptions: { where: { status: "ACTIVE" } } },
  });

  if (existingSubscription?.subscriptions?.length) {
    throw new Error("User already has an active subscription");
  }

  const freePlan = await prisma.plan.findFirst({
    where: { name: "Free" },
    include: { prices: true },
  });

  if (!freePlan) throw new Error("Free plan not found");

  await prisma.subscription.create({
    data: {
      userId: session.user.id,
      priceId: freePlan.prices[0]?.id || "",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(
        new Date().setFullYear(new Date().getFullYear() + 100),
      ),
      cancelAtPeriodEnd: false,
    },
  });

  revalidatePath("/dashboard");
}

export async function subscribeToTrialPlan(planId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existingSubscription = await prisma.user.findFirst({
    where: { id: session.user.id },
    include: { subscriptions: { where: { status: "ACTIVE" } } },
  });

  if (existingSubscription?.subscriptions?.length) {
    throw new Error("User already has an active subscription");
  }

  const trialPlan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { prices: true },
  });

  if (!trialPlan || !trialPlan.isTrial) {
    throw new Error("Valid trial plan not found");
  }

  const price = trialPlan.prices[0];
  if (!price) {
    throw new Error("No price found for trial plan");
  }

  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date();

  if (price.interval === "WEEK") {
    currentPeriodEnd.setDate(
      currentPeriodEnd.getDate() + 7 * price.intervalCount,
    );
  } else if (price.interval === "MONTH") {
    currentPeriodEnd.setMonth(
      currentPeriodEnd.getMonth() + 1 * price.intervalCount,
    );
  } else if (price.interval === "YEAR") {
    currentPeriodEnd.setFullYear(
      currentPeriodEnd.getFullYear() + 1 * price.intervalCount,
    );
  }

  await prisma.subscription.create({
    data: {
      userId: session.user.id,
      priceId: price.id,
      status: "ACTIVE",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  revalidatePath("/dashboard");
}

export async function getUserWorkspacesAndBoards(userId: string) {
  const isValidSubscription = await hasValidSubscription(userId);
  if (!isValidSubscription) {
    throw new Error("Active subscription required");
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      boards: true,
    },
  });
  return workspaces;
}
