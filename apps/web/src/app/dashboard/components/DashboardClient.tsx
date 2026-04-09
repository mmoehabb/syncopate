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
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspaces: any[];
  hasActiveSubscription: boolean;
  modalComponent: ReactNode;
}) {
  return (
    <CommandProvider>
      <div className="h-screen w-full flex flex-col bg-obsidian-night overflow-hidden">
        <Header />

        <div className="flex-1 flex overflow-hidden relative">
          <Sidebar workspaces={workspaces} />
          <MainBoard />
          {!hasActiveSubscription && modalComponent}
        </div>
      </div>
    </CommandProvider>
  );
}
