"use server";

import { prisma } from "@syncopate/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getUserWorkspaces(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
  return workspaces;
}

export async function deactivateAccount(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Find boards where user is an ADMIN
    const boardsToDeactivate = await tx.board.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            role: "ADMIN",
          },
        },
      },
      select: { id: true },
    });

    if (boardsToDeactivate.length > 0) {
      await tx.board.updateMany({
        where: {
          id: {
            in: boardsToDeactivate.map((b) => b.id),
          },
        },
        data: { isActive: false },
      });
    }
  });

  revalidatePath("/settings");
}

export async function reactivateAccount(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  revalidatePath("/settings");
}

export async function cancelSubscription(
  userId: string,
  subscriptionId: string,
) {
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.subscription.update({
    where: { id: subscriptionId, userId },
    data: { cancelAtPeriodEnd: true },
  });

  revalidatePath("/settings");
}

export async function getUserDetails(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });

  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      price: {
        include: {
          plan: true,
        },
      },
    },
  });

  return { user, subscription };
}
