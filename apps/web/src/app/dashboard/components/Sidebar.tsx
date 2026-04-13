"use client";

import { useCommand } from "@/context/CommandContext";
import { useState } from "react";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function Sidebar({
  workspaces,
  activeBoardId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspaces: any[];
  activeBoardId?: string;
}) {
  const router = useRouter();
  const { activePane, paneFocus } = useCommand();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatItems: any[] = [];
  workspaces.forEach((ws) => {
    flatItems.push({ type: "workspace", id: ws.id, label: ws.name });
    if (!collapsed[ws.id]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ws.boards?.forEach((board: any) => {
        flatItems.push({ type: "board", id: board.id, label: board.name });
      });
    }
  });

  const toggleWorkspace = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isFocused = activePane === "sidebar";
  const focusIndex = paneFocus?.["sidebar"] ?? 0;

  return (
    <div
      data-pane="sidebar"
      className={`w-64 border-r border-white/10 bg-void-grey/50 flex flex-col font-mono text-sm transition-all ${
        isFocused
          ? "border-git-green shadow-[inset_0_0_10px_rgba(46,160,67,0.1)]"
          : ""
      }`}
    >
      <div className="p-4 border-b border-white/10 text-syntax-grey flex items-center justify-between">
        <span className="font-bold">Explorer</span>
        {isFocused && <span className="text-git-green text-xs">focused</span>}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {flatItems.length === 0 && (
          <div className="px-4 py-2 text-syntax-grey italic">
            No workspaces found
          </div>
        )}
        {flatItems.map((item, index) => {
          const isItemFocused = isFocused && focusIndex === index;
          if (item.type === "workspace") {
            return (
              <div key={`ws-${item.id}`} className="group relative">
                <button
                  onClick={() => toggleWorkspace(item.id)}
                  className={`w-full text-left px-4 py-1.5 flex items-center gap-2 hover:bg-white/5 cmd-selectable ${
                    isItemFocused
                      ? "bg-white/10 text-white"
                      : "text-syntax-grey"
                  }`}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-syntax-grey hover:text-white transition-all cmd-selectable"
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
              className={`w-full text-left pl-10 pr-4 py-1.5 flex items-center gap-2 hover:bg-white/5 cmd-selectable ${
                isItemFocused || activeBoardId === item.id
                  ? "bg-white/10 text-white border-l-2 border-git-green"
                  : "text-syntax-grey border-l-2 border-transparent"
              }`}
            >
              # {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
