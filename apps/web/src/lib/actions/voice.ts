"use server";

import { auth } from "../auth";
import { prisma } from "@syncoboard/db";

export async function joinVoiceCall(boardId: string, peerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const member = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id,
      },
    },
  });

  if (!member) {
    throw new Error("You must be a board member to join the voice call.");
  }

  await prisma.boardMember.update({
    where: { id: member.id },
    data: {
      voicePeerId: peerId,
      lastVoicePing: new Date(),
    },
  });
}

export async function leaveVoiceCall(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const member = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id,
      },
    },
  });

  if (!member) {
    return; // Or throw error
  }

  await prisma.boardMember.update({
    where: { id: member.id },
    data: {
      voicePeerId: null,
      lastVoicePing: null,
    },
  });
}

export async function getActiveVoicePeers(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Only consider peers that pinged within the last 30 seconds
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

  const activeMembers = await prisma.boardMember.findMany({
    where: {
      boardId,
      voicePeerId: { not: null },
      lastVoicePing: { gte: thirtySecondsAgo },
    },
    select: {
      voicePeerId: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return activeMembers.filter((m) => m.user.id !== session.user?.id);
}

export async function pingVoiceCall(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  const member = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id,
      },
    },
  });

  if (member && member.voicePeerId) {
    await prisma.boardMember.update({
      where: { id: member.id },
      data: { lastVoicePing: new Date() },
    });
  }
}
