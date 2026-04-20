import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "./actions";
import { SettingsContent } from "./components/SettingsContent";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces(session.user.id);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-obsidian-night text-white font-mono">
      <SettingsContent workspaces={workspaces} />
    </div>
  );
}
