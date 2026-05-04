import cron from "node-cron";
import { prisma } from "@syncoboard/db";
import {
  enforceSubscriptionLimits,
  cleanupDeletedEntities,
} from "@syncoboard/utils";

/**
 * Runs every day at 01:00 AM.
 *
 * 1. Checks for all users whose active subscription has just expired
 *    and enforces the plan limits (downgrading excess boards/workspaces).
 * 2. Permanently deletes any workspaces or boards that have been
 *    soft-deleted (`isDeleted = true`) for over 3 months.
 */
cron.schedule("0 1 * * *", async () => {
  console.log(`[CRON] Starting daily cron jobs at ${new Date().toISOString()}`);

  try {
    // 1. Subscription Expiration Enforcement
    console.log("[CRON] Checking for expired subscriptions...");
    const now = new Date();

    // Find all users who have an "ACTIVE" subscription in the DB
    // but the currentPeriodEnd has passed.
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: {
          lte: now,
        },
      },
    });

    if (expiredSubscriptions.length > 0) {
      console.log(
        `[CRON] Found ${expiredSubscriptions.length} expired subscriptions. Enforcing limits.`,
      );

      // 1. Extract unique user IDs to avoid redundant enforcement calls.
      const uniqueUserIds = [
        ...new Set(expiredSubscriptions.map((sub) => sub.userId)),
      ];

      // 2. Enforce subscription limits.
      // We use a simple chunking approach to limit concurrency and avoid exhausting DB connections.
      const CHUNK_SIZE = 10;
      for (let i = 0; i < uniqueUserIds.length; i += CHUNK_SIZE) {
        const chunk = uniqueUserIds.slice(i, i + CHUNK_SIZE);
        await Promise.allSettled(
          chunk.map((userId) => enforceSubscriptionLimits(userId)),
        );
      }

      // 3. Batch update the status of all expired subscriptions to "EXPIRED" in one query.
      await prisma.subscription.updateMany({
        where: {
          id: {
            in: expiredSubscriptions.map((sub) => sub.id),
          },
        },
        data: { status: "EXPIRED" },
      });
    } else {
      console.log("[CRON] No expired subscriptions found.");
    }

    // 2. Cleanup Deleted Entities (> 3 months)
    console.log("[CRON] Running cleanup for 3-month-old deleted entities...");
    await cleanupDeletedEntities();

    console.log(
      `[CRON] Daily cron jobs completed successfully at ${new Date().toISOString()}`,
    );
  } catch (error) {
    console.error("[CRON] Error executing daily cron jobs:", error);
  }
});

console.log("Cron service initialized. Waiting for schedule...");
