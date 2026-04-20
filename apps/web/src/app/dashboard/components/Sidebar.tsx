"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DashboardWorkspace } from "./types";
import { FocusedLabel } from "@/components/ui/FocusedLabel";

type FlatItem = {
  type: "workspace" | "board";
  id: string;
  label: string;
};

export function Sidebar({
  workspaces,
  activeBoardId,
}: {
  workspaces: DashboardWorkspace[];
  activeBoardId?: string;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const flatItems: FlatItem[] = [];
  workspaces.forEach((ws) => {
    flatItems.push({ type: "workspace", id: ws.id, label: ws.name });
    if (!collapsed[ws.id]) {
      ws.boards?.forEach((board) => {
        flatItems.push({ type: "board", id: board.id, label: board.name });
      });
    }
  });

  const toggleWorkspace = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-64 border-r border-white/10 bg-void-grey/50 flex flex-col font-mono text-sm transition-all cmd-container">
      <div className="p-4 border-b border-white/10 text-syntax-grey flex items-center justify-between">
        <span className="font-bold">Explorer</span>
        <FocusedLabel />
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {flatItems.length === 0 && (
          <div className="px-4 py-2 text-syntax-grey italic">
            No workspaces found
          </div>
        )}
        {flatItems.map((item) => {
          if (item.type === "workspace") {
            return (
              <div key={`ws-${item.id}`} className="group relative">
                <button
                  onClick={() => toggleWorkspace(item.id)}
                  className="w-full text-left px-4 py-1.5 flex items-center gap-2 hover:bg-white/5 text-syntax-grey [&.cmd-selected]:bg-white/10 [&.cmd-selected]:text-white cmd-selectable"
                >
                  {collapsed[item.id] ? (
                    <ChevronRight size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                  <span className="font-bold">{item.label}</span>
                </button>
                <button
                  onClick={() => router.push("/settings")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-syntax-grey hover:text-white transition-all"
                  title="Add Board"
                >
                  <Plus size={14} />
                </button>
              </div>
            );
          }
          return (
            <button
              key={`b-${item.id}`}
              onClick={() => router.push(`/dashboard/b/${item.id}`)}
              className={`w-full text-left pl-10 pr-4 py-1.5 flex items-center gap-2 hover:bg-white/5 ${activeBoardId === item.id ? "bg-white/10 text-white border-l-2 border-git-green" : "text-syntax-grey border-l-2 border-transparent"} [&.cmd-selected]:bg-white/10 [&.cmd-selected]:text-white [&.cmd-selected]:border-git-green cmd-selectable`}
            >
              # {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
