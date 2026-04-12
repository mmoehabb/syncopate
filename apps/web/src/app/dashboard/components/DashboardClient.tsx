"use client";

import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MainBoard } from "./MainBoard";
import { CommandProvider } from "@/context/CommandContext";

export function DashboardClient({
  workspaces,
  hasActiveSubscription,
  modalComponent,
  board,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspaces: any[];
  hasActiveSubscription: boolean;
  modalComponent: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  board?: any;
}) {
  return (
    <CommandProvider>
      <div className="h-screen w-full flex flex-col bg-obsidian-night overflow-hidden">
        <Header />

        <div className="flex-1 flex overflow-hidden relative">
          <Sidebar workspaces={workspaces} activeBoardId={board?.id} />
          <MainBoard board={board} />
          {!hasActiveSubscription && modalComponent}
        </div>
      </div>
    </CommandProvider>
  );
}
