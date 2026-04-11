import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/DashboardClient";
import { getUserWorkspacesAndBoards } from "../../actions";
import { SessionProvider } from "next-auth/react";

export default async function BoardPage({
  params,
}: {
  params: { boardId: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { boardId } = params;

  // Verify access to the board
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      tasks: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!board) {
    redirect("/dashboard");
  }

  const boardMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: boardId,
        userId: session.user.id,
      },
    },
  });

  if (!boardMember) {
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: board.workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!workspaceMember) {
      redirect("/dashboard");
    }
  }

  const workspaces = await getUserWorkspacesAndBoards(session.user.id);
  const userWithSubscriptions = await prisma.user.findFirst({
    where: { id: session.user.id },
    include: {
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
      },
    },
  });

  const hasActiveSubscription =
    userWithSubscriptions?.subscriptions &&
    userWithSubscriptions.subscriptions.length > 0;

  // Create the unclosable modal component to pass to the client
  // Just reusing the empty state since we checked this in the root dashboard,
  // though realistically users shouldn't reach here without a subscription.
  const SubscriptionModal = (
    <div className="absolute inset-0 bg-obsidian-night/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full surface-panel p-8 bg-void-grey border border-neon-pulse/50 shadow-2xl rounded-md flex flex-col gap-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">
          Subscription Required
        </h2>
        <div className="text-center mt-4">
          <a
            href="/dashboard"
            className="text-syntax-grey hover:text-white font-mono text-sm underline underline-offset-4 decoration-white/20 hover:decoration-white transition-colors"
          >
            Return to dashboard &rarr;
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <SessionProvider>
      <DashboardClient
        workspaces={workspaces}
        hasActiveSubscription={!!hasActiveSubscription}
        modalComponent={SubscriptionModal}
        board={board}
      />
    </SessionProvider>
  );
}
