import { prisma } from "@syncoboard/db";

export async function hasValidSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      currentPeriodEnd: {
        gt: new Date(),
      },
    },
  });

  return !!subscription;
}
