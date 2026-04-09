import { auth } from "@/lib/auth";
import { prisma } from "@syncopate/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userWithSubscriptions = await prisma.user.findUnique({
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-screen w-full p-8 bg-obsidian-night relative overflow-hidden">
      <main className="w-full h-full z-10 flex flex-col gap-8 surface-panel p-8 bg-void-grey/80 backdrop-blur-md border-white/10 relative">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-syntax-grey font-mono">
          Welcome back, {session.user.name || session.user.email}
        </p>

        {/* Dashboard Content */}
        <div className="flex-1 border border-white/10 rounded-md p-4 mt-4 bg-obsidian-night/50">
          <p className="text-syntax-grey font-mono text-sm opacity-50">
            [Your workspace content here]
          </p>
        </div>

        {/* Modal Overlay if no active subscription */}
        {!hasActiveSubscription && (
          <div className="absolute inset-0 bg-obsidian-night/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="max-w-md w-full surface-panel p-8 bg-void-grey border border-neon-pulse/50 shadow-2xl rounded-md flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white">
                  Subscription Required
                </h2>
                <p className="text-syntax-grey text-sm font-mono leading-relaxed">
                  You do not have an active subscription. Please select a plan
                  to continue using Syncopate.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <form
                  action={async () => {
                    "use server";
                    // Logic to subscribe to Free plan
                    // In a real app, this would create a subscription record
                    console.log("Subscribing to Free Plan...");
                  }}
                >
                  <button className="w-full bg-obsidian-night border border-white/10 hover:border-git-green hover:bg-white/5 transition-all rounded px-4 py-3 text-white font-mono text-sm group flex justify-between items-center">
                    <span>Free Plan</span>
                    <span className="text-git-green">$0 / forever</span>
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    // Logic to subscribe to Trial plan
                    console.log("Starting Trial...");
                  }}
                >
                  <button className="w-full bg-obsidian-night border border-white/10 hover:border-neon-pulse hover:bg-white/5 transition-all rounded px-4 py-3 text-white font-mono text-sm group flex justify-between items-center">
                    <span>1-Week Trial</span>
                    <span className="text-neon-pulse">Free</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
