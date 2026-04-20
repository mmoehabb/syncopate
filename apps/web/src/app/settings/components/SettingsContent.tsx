"use client";

import { useState } from "react";
import { AddBoard } from "./AddBoard";
import { AddWorkspace } from "./AddWorkspace";
import { FocusedLabel } from "@/components/ui/FocusedLabel";

interface SettingsContentProps {
  workspaces: { id: string; name: string }[];
}

export function SettingsContent({ workspaces }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "board">("workspace");

  return (
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
          <button
            onClick={() => setActiveTab("workspace")}
            className={`text-left px-3 py-2 border-l-2 text-white text-sm hover:bg-white/5 transition-colors cmd-selectable ${
              activeTab === "workspace"
                ? "bg-white/10 border-git-green"
                : "bg-transparent border-transparent"
            } [&.cmd-selected]:border-git-green [&.cmd-selected]:bg-white/10`}
          >
            Add Workspace
          </button>
          <button
            onClick={() => setActiveTab("board")}
            className={`text-left px-3 py-2 border-l-2 text-white text-sm hover:bg-white/5 transition-colors cmd-selectable ${
              activeTab === "board"
                ? "bg-white/10 border-git-green"
                : "bg-transparent border-transparent"
            } [&.cmd-selected]:border-git-green [&.cmd-selected]:bg-white/10`}
          >
            Add Board
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto cmd-container relative">
        <div className="flex justify-end mb-4">
          <FocusedLabel />
        </div>
        {activeTab === "workspace" ? (
          <AddWorkspace />
        ) : (
          <AddBoard workspaces={workspaces} />
        )}
      </div>
    </div>
  );
}
