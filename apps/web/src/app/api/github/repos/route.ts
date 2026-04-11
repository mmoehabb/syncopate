import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { App } from "@octokit/app";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  try {
    let workspace;

    if (workspaceId) {
      workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: { where: { userId: session.user.id } } },
      });

      if (!workspace || workspace.members.length === 0) {
        return NextResponse.json(
          { error: "Workspace not found or unauthorized" },
          { status: 404 },
        );
      }
    } else {
      // Find the user's first workspace with a GitHub installation
      const userWorkspace = await prisma.workspaceMember.findFirst({
        where: {
          userId: session.user.id,
          workspace: {
            githubInstallationId: { not: null },
          },
        },
        include: { workspace: true },
        orderBy: { createdAt: "asc" },
      });

      workspace = userWorkspace?.workspace;
    }

    if (!workspace?.githubInstallationId) {
      return NextResponse.json(
        { error: "No GitHub App installation linked to this workspace" },
        { status: 404 },
      );
    }

    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      console.error("Missing GitHub App credentials in environment variables.");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }

    const app = new App({
      appId: appId,
      privateKey: privateKey,
    });

    const octokit = await app.getInstallationOctokit(
      parseInt(workspace.githubInstallationId),
    );

    const response = await octokit.request("GET /installation/repositories", {
      per_page: 100,
      headers: {
        "x-github-api-version": "2022-11-28",
      },
    });

    const repos = response.data.repositories;

    const formattedRepos = repos.map(
      (repo: {
        id: number;
        full_name: string;
        html_url: string;
        private: boolean;
      }) => ({
        id: repo.id,
        name: repo.full_name,
        url: repo.html_url,
        private: repo.private,
      }),
    );

    return NextResponse.json({ repos: formattedRepos });
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 },
    );
  }
}
