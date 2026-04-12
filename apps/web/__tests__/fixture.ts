import { prisma } from "@syncopate/db";

export async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}

export async function seedTestDatabase() {
  await cleanDatabase();

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Test Workspace",
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "ADMIN",
    },
  });

  const board = await prisma.board.create({
    data: {
      workspaceId: workspace.id,
      name: "Test Board",
      repositoryName: "octocat/Hello-World",
      githubRepoId: "1296269", // This is the standard repo id for hello-world repo
    },
  });

  await prisma.boardMember.create({
    data: {
      boardId: board.id,
      userId: user.id,
      role: "ADMIN",
    },
  });

  return { user, workspace, board };
}
