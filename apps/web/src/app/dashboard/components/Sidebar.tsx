"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Sidebar({ workspaces }: { workspaces: any[] }) {
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

  return (
    <div className="cmd-container w-64 border-r border-white/10 bg-void-grey/50 flex flex-col font-mono text-sm transition-all has-[.cmd-selected]:border-git-green has-[.cmd-selected]:shadow-[inset_0_0_10px_rgba(46,160,67,0.1)]">
      <div className="p-4 border-b border-white/10 text-syntax-grey flex items-center justify-between">
        <span className="font-bold">Explorer</span>
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
              <button
                key={`ws-${item.id}`}
                onClick={() => toggleWorkspace(item.id)}
                className="cmd-selectable w-full text-left px-4 py-1.5 flex items-center gap-2 hover:bg-white/5 text-syntax-grey [&.cmd-selected]:bg-white/10 [&.cmd-selected]:text-white outline-none"
              >
                {collapsed[item.id] ? (
                  <ChevronRight size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                <span className="font-bold">{item.label}</span>
              </button>
            );
          }
          return (
            <button
              key={`b-${item.id}`}
              className="cmd-selectable w-full text-left pl-10 pr-4 py-1.5 flex items-center gap-2 hover:bg-white/5 text-syntax-grey border-l-2 border-transparent [&.cmd-selected]:bg-white/10 [&.cmd-selected]:text-white [&.cmd-selected]:border-git-green outline-none"
            >
              # {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
