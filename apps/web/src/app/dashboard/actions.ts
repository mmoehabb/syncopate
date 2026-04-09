"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { revalidatePath } from "next/cache";

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
      planId: freePlan.id,
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

export async function getUserWorkspacesAndBoards(userId: string) {
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
