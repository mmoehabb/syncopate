import { NextResponse } from "next/server";
import { getSessionOrPat } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { App } from "@octokit/app";
import { API_ERRORS, apiError } from "@/lib/api/error";

export async function GET(request: Request) {
  const userId = await getSessionOrPat();

  if (!userId) {
    return apiError(API_ERRORS.UNAUTHORIZED);
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  try {
    let workspace;

    if (workspaceId) {
      workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: { where: { userId: userId } } },
      });

      if (!workspace || workspace.members.length === 0) {
        return apiError(
          API_ERRORS.custom404("Workspace not found or unauthorized"),
        );
      }
    } else {
      // Find the user's first workspace with a GitHub installation
      const userWorkspace = await prisma.workspaceMember.findFirst({
        where: {
          userId: userId,
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
      return apiError(
        API_ERRORS.custom404(
          "No GitHub App installation linked to this workspace",
        ),
      );
    }

    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      console.error("Missing GitHub App credentials in environment variables.");
      return apiError(API_ERRORS.customInternal("Server misconfiguration"));
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
    return apiError(API_ERRORS.customInternal("Failed to fetch repositories"));
  }
}
