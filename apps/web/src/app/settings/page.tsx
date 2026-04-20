import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "./actions";
import { AddBoard } from "./components/AddBoard";
import { FocusedLabel } from "@/components/ui/FocusedLabel";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces(session.user.id);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-obsidian-night text-white font-mono">
      <div className="flex flex-1 border-t border-white/10 overflow-hidden">
        {/* Left Nav */}
        <div className="w-64 border-r border-white/10 bg-void-grey/50 p-6 flex flex-col gap-4 cmd-container relative">
          <div className="flex items-center justify-between">
            <h3 className="text-syntax-grey font-bold uppercase tracking-wider text-xs">
              Settings
            </h3>
            <FocusedLabel />
          </div>
          <div className="flex flex-col gap-2">
            <button className="text-left px-3 py-2 bg-white/10 border-l-2 border-git-green text-white text-sm hover:bg-white/5 transition-colors cmd-selectable">
              Add Board
            </button>
            {/* Future settings sections can go here */}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto cmd-container relative">
          <div className="flex justify-end mb-4">
            <FocusedLabel />
          </div>
          <AddBoard workspaces={workspaces} />
        </div>
      </div>
    </div>
  );
}
