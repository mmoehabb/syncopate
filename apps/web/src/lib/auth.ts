import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@syncopate/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      issuer: "https://github.com/login/oauth",
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      // Create a default workspace for the new user
      const workspaceName = "MyWorkspace";

      const newWorkspace = await prisma.workspace.create({
        data: {
          name: workspaceName,
        },
      });

      // Assign the user as an ADMIN of the new workspace
      await prisma.workspaceMember.create({
        data: {
          workspaceId: newWorkspace.id,
          userId: user.id as string,
          role: "ADMIN",
        },
      });
    },
  },
});
