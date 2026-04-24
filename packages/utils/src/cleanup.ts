import { prisma } from "@syncopate/db";

/**
 * Permanently deletes workspaces and boards that have been marked as isDeleted
 * for more than 3 months.
 */
export async function cleanupDeletedEntities() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  console.log(
    `Cleaning up deleted entities from before ${threeMonthsAgo.toISOString()}`,
  );

  try {
    // We should delete the boards first. Although Cascade delete might be set up,
    // explicitly deleting them ensures any pre-delete hooks or cleanup logs happen.
    const deletedBoards = await prisma.board.deleteMany({
      where: {
        isDeleted: true,
        updatedAt: {
          lt: threeMonthsAgo,
        },
      },
    });

    console.log(`Permanently deleted ${deletedBoards.count} boards.`);

    const deletedWorkspaces = await prisma.workspace.deleteMany({
      where: {
        isDeleted: true,
        updatedAt: {
          lt: threeMonthsAgo,
        },
      },
    });

    console.log(`Permanently deleted ${deletedWorkspaces.count} workspaces.`);

    return {
      boards: deletedBoards.count,
      workspaces: deletedWorkspaces.count,
    };
  } catch (error) {
    console.error("Error during cleanup of deleted entities:", error);
    // Rethrow to allow the cron job to catch and potentially alert
    throw error;
  }
}
