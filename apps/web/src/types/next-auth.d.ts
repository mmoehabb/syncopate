import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      createdAt?: Date | string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    createdAt?: Date | string | null;
  }
}
