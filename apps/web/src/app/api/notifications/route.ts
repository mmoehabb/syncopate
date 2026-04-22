import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { API_ERRORS, apiError } from "@/lib/api/error";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    const userBoards = await prisma.boardMember.findMany({
      where: { userId: session.user.id },
      select: { boardId: true },
    });

    const boardIds = userBoards.map((b) => b.boardId);

    // Fetch logs: either targeted to the user, or related to boards the user is in (but not targeted to anyone else specifically, except invitations targeted to them)
    const logs = await prisma.boardActivityLog.findMany({
      where: {
        OR: [
          { targetUserId: session.user.id },
          {
            boardId: { in: boardIds },
            OR: [
              { type: { not: "INVITATION" } },
              { targetUserId: session.user.id },
            ],
          },
        ],
      },
      include: {
        actor: { select: { name: true, email: true, image: true } },
        targetUser: { select: { name: true, email: true, image: true } },
        board: {
          select: { name: true, workspace: { select: { name: true } } },
        },
        task: { select: { title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return apiError(API_ERRORS.customInternal("Failed to fetch notifications"));
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  try {
    const body = await req.json();
    const { action, logId } = body;

    if (!logId || !["ACCEPT", "DECLINE"].includes(action)) {
      return apiError(API_ERRORS.customBadRequest("Invalid action or log ID"));
    }

    const log = await prisma.boardActivityLog.findUnique({
      where: { id: logId },
      include: { board: true },
    });

    if (
      !log ||
      log.targetUserId !== session.user.id ||
      log.type !== "INVITATION"
    ) {
      return apiError(API_ERRORS.customForbidden("Invalid invitation"));
    }

    if (action === "ACCEPT") {
      await prisma.$transaction([
        prisma.boardMember.create({
          data: {
            boardId: log.boardId,
            userId: session.user.id,
            role: "MEMBER",
          },
        }),
        prisma.boardActivityLog.update({
          where: { id: logId },
          data: { status: "ACCEPTED" },
        }),
        prisma.boardActivityLog.create({
          data: {
            boardId: log.boardId,
            type: "MEMBER_JOIN",
            actorId: session.user.id,
          },
        }),
      ]);
    } else {
      await prisma.boardActivityLog.update({
        where: { id: logId },
        data: { status: "DECLINED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating invitation:", error);
    return apiError(API_ERRORS.customInternal("Failed to update invitation"));
  }
}
