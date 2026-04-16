"use client";

import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MainBoard } from "./MainBoard";
import type { DashboardWorkspace, MainBoardData } from "./types";

export function DashboardClient({
  workspaces,
  hasActiveSubscription,
  modalComponent,
  board,
}: {
  workspaces: DashboardWorkspace[];
  hasActiveSubscription: boolean;
  modalComponent: ReactNode;
  board?: MainBoardData | null;
}) {
  return (
    <div className="flex-1 w-full flex flex-col bg-obsidian-night overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar workspaces={workspaces} activeBoardId={board?.id} />
        <MainBoard board={board} />
        {!hasActiveSubscription && modalComponent}
      </div>
    </div>
  );
}
