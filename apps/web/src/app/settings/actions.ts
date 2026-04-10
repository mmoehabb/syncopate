import { prisma } from "@syncopate/db";

export async function getUserWorkspaces(userId: string) {
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
