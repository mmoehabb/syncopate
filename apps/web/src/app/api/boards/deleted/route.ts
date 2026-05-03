import { NextResponse } from "next/server";
import { getSessionOrPat } from "@/lib/auth";
import { prisma } from "@syncoboard/db";
import { API_ERRORS, apiError } from "@/lib/api/error";
import { hasValidSubscription } from "@/lib/api/with-subscription";

export async function GET(req: Request) {
  const userId = await getSessionOrPat();

  if (!userId) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  const isValidSubscription = await hasValidSubscription(userId);
  if (!isValidSubscription) {
    return apiError(API_ERRORS.customForbidden("Active subscription required"));
  }

  try {
    // Find all soft-deleted boards where the user is an ADMIN of the board or workspace
    const deletedBoards = await prisma.board.findMany({
      where: {
        isDeleted: true,
        OR: [
          {
            members: {
              some: {
                userId: userId,
                role: "ADMIN",
              },
            },
          },
          {
            workspace: {
              members: {
                some: {
                  userId: userId,
                  role: "ADMIN",
                },
              },
            },
          },
        ],
      },
      include: {
        workspace: true,
      },
    });

    const now = new Date();

    // Map to include permanent deletion info
    const mappedBoards = deletedBoards.map((board) => {
      // Boards are permanently deleted 3 months after their `updatedAt` date
      const deletionDate = new Date(board.updatedAt);
      deletionDate.setMonth(deletionDate.getMonth() + 3);

      const timeDiff = deletionDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const monthsLeft = Math.floor(daysLeft / 30);

      let timeLeftString = "";
      if (monthsLeft > 0) {
        timeLeftString = `${monthsLeft} month${monthsLeft > 1 ? "s" : ""} left`;
      } else if (daysLeft > 0) {
        timeLeftString = `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`;
      } else {
        timeLeftString = "Imminent";
      }

      return {
        id: board.id,
        name: board.name,
        workspaceName: board.workspace.name,
        repositoryName: board.repositoryName,
        githubRepoId: board.githubRepoId,
        deletedAt: board.updatedAt,
        daysLeftForPermDeletion: daysLeft > 0 ? daysLeft : 0,
        timeLeftString,
      };
    });

    return NextResponse.json({ boards: mappedBoards });
  } catch (error) {
    console.error("Error fetching deleted boards:", error);
    return apiError(
      API_ERRORS.customInternal("Failed to fetch deleted boards"),
    );
  }
}
