import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get("installation_id");

  if (!installationId) {
    return NextResponse.json(
      { error: "Missing installation_id parameter" },
      { status: 400 },
    );
  }

  try {
    // Validate that the user actually has access to this installation_id
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: "No GitHub account linked" },
        { status: 404 },
      );
    }

    const validationResponse = await fetch(
      "https://api.github.com/user/installations",
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!validationResponse.ok) {
      throw new Error("Failed to validate installations");
    }

    const data = await validationResponse.json();
    const userInstallations = data.installations || [];
    const hasAccess = userInstallations.some(
      (inst: { id: number | string }) => inst.id.toString() === installationId,
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized access to this installation" },
        { status: 403 },
      );
    }

    // Find the user's first workspace (which should be their default workspace)
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        createdAt: "asc", // Get the earliest created one
      },
    });

    if (!userWorkspace) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (userWorkspace) {
      // Save the installation ID to this workspace
      await prisma.workspace.update({
        where: {
          id: userWorkspace.workspace.id,
        },
        data: {
          githubInstallationId: installationId,
        },
      });
    }

    // Redirect the user to the dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error(
      "Error updating workspace with GitHub App installation:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to save installation ID" },
      { status: 500 },
    );
  }
}
