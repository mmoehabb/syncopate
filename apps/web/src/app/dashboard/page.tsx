import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { redirect } from "next/navigation";
import {
  subscribeToFreePlan,
  getUserWorkspacesAndBoards,
} from "@/lib/actions/dashboard";
import { DashboardClient } from "./components/DashboardClient";
import { SessionProvider } from "next-auth/react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

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

  const workspaces = await getUserWorkspacesAndBoards(session.user.id);

  // Create the unclosable modal component to pass to the client
  const SubscriptionModal = (
    <div className="absolute inset-0 bg-obsidian-night/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full surface-panel p-8 bg-void-grey border border-neon-pulse/50 shadow-2xl rounded-md flex flex-col gap-8 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-2 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Subscription Required
          </h2>
          <p className="text-syntax-grey text-sm font-mono leading-relaxed">
            You do not have an active subscription. Please select a plan to
            continue using Syncopate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Free Plan */}
          <div className="flex flex-col border border-white/10 bg-obsidian-night/50 rounded-md p-6 relative group transition-all hover:border-git-green/50">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="text-2xl text-git-green font-mono mb-6">$0</div>
            <ul className="text-sm font-mono text-syntax-grey flex flex-col gap-3 flex-1 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-git-green">✓</span> 1 Workspace
              </li>
              <li className="flex items-center gap-2">
                <span className="text-git-green">✓</span> 1 Board per Workspace
              </li>
              <li className="flex items-center gap-2">
                <span className="text-git-green">✓</span> 1 Member per Board
              </li>
              <li className="flex items-center gap-2">
                <span className="text-git-green">✓</span> 1 Active Board Total
              </li>
            </ul>
            <form action={subscribeToFreePlan} className="mt-auto">
              <button className="w-full bg-void-grey border border-git-green/30 hover:border-git-green hover:bg-git-green/10 transition-all rounded py-2.5 text-white font-mono text-sm cursor-pointer">
                Get Started
              </button>
            </form>
          </div>

          {/* Standard Plan */}
          <div className="flex flex-col border border-white/10 bg-obsidian-night/50 rounded-md p-6 relative opacity-60">
            <div className="absolute top-4 right-4 bg-white/10 text-syntax-grey text-xs px-2 py-0.5 rounded font-mono">
              soon
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Standard</h3>
            <div className="text-2xl text-white font-mono mb-6">
              $12<span className="text-sm text-syntax-grey">/mo</span>
            </div>
            <ul className="text-sm font-mono text-syntax-grey flex flex-col gap-3 flex-1 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-syntax-grey">✓</span> 10 Workspaces
              </li>
              <li className="flex items-center gap-2">
                <span className="text-syntax-grey">✓</span> 10 Boards/Workspace
              </li>
              <li className="flex items-center gap-2">
                <span className="text-syntax-grey">✓</span> 20 Members/Board
              </li>
              <li className="flex items-center gap-2">
                <span className="text-syntax-grey">✓</span> 5 Active Boards
                Total
              </li>
            </ul>
            <button
              disabled
              className="w-full bg-void-grey border border-white/10 rounded py-2.5 text-syntax-grey font-mono text-sm cursor-not-allowed mt-auto"
            >
              Unavailable
            </button>
          </div>

          {/* Trial Plan */}
          <div className="flex flex-col border border-white/10 bg-obsidian-night/50 rounded-md p-6 relative opacity-60">
            <div className="absolute top-4 right-4 bg-white/10 text-syntax-grey text-xs px-2 py-0.5 rounded font-mono">
              soon
            </div>
            <h3 className="text-xl font-bold text-white mb-2">1-Week Trial</h3>
            <div className="text-2xl text-neon-pulse font-mono mb-6">Free</div>
            <ul className="text-sm font-mono text-syntax-grey flex flex-col gap-3 flex-1 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-neon-pulse">✓</span> Full Standard
                Features
              </li>
              <li className="flex items-center gap-2">
                <span className="text-neon-pulse">✓</span> Valid for 7 days
              </li>
              <li className="flex items-center gap-2">
                <span className="text-neon-pulse">✓</span> One-time use
              </li>
            </ul>
            <button
              disabled
              className="w-full bg-void-grey border border-white/10 rounded py-2.5 text-syntax-grey font-mono text-sm cursor-not-allowed mt-auto"
            >
              Unavailable
            </button>
          </div>

          {/* Premium Plan */}
          <div className="flex flex-col border border-neon-pulse/20 bg-obsidian-night/50 rounded-md p-6 relative opacity-60">
            <div className="absolute top-4 right-4 bg-white/10 text-syntax-grey text-xs px-2 py-0.5 rounded font-mono">
              soon
            </div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              Premium <span className="text-neon-pulse">★</span>
            </h3>
            <div className="text-2xl text-white font-mono mb-6">
              $30<span className="text-sm text-syntax-grey">/mo</span>
            </div>
            <ul className="text-sm font-mono text-syntax-grey flex flex-col gap-3 flex-1 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-syntax-grey">✓</span> 25 Workspaces
              </li>
              <li className="flex items-center gap-2">
                <span className="text-syntax-grey">✓</span> 50 Boards/Workspace
              </li>
              <li className="flex items-center gap-2">
                <span className="text-neon-pulse">✓</span> Unlimited Members
              </li>
              <li className="flex items-center gap-2">
                <span className="text-neon-pulse">✓</span> Unlimited Active
                Boards
              </li>
            </ul>
            <button
              disabled
              className="w-full bg-void-grey border border-white/10 rounded py-2.5 text-syntax-grey font-mono text-sm cursor-not-allowed mt-auto"
            >
              Unavailable
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <a
            href="/plans"
            className="text-syntax-grey hover:text-white font-mono text-sm underline underline-offset-4 decoration-white/20 hover:decoration-white transition-colors"
          >
            View more detailed plan information &rarr;
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
      />
    </SessionProvider>
  );
}
