"use client";

import { X } from "lucide-react";

export function TaskDetailsPanel({
  task,
  onClose,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any;
  onClose: () => void;
}) {
  if (!task) return null;

  return (
    <div className="w-80 border-l border-white/10 bg-void-grey/80 flex flex-col font-mono text-sm overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-night">
        <span className="font-bold text-white">SYNC-{task.id.toString()}</span>
        <button onClick={onClose} className="text-syntax-grey hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-2 leading-tight">
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 rounded bg-white/5 text-xs text-syntax-grey border border-white/10">
              {task.status}
            </span>
            {task.prNumber && (
              <span className="px-2 py-1 rounded bg-git-green/10 text-xs text-git-green border border-git-green/20">
                PR #{task.prNumber}
              </span>
            )}
            {task.branchName && (
              <span className="px-2 py-1 rounded bg-neon-pulse/10 text-xs text-neon-pulse border border-neon-pulse/20">
                {task.branchName}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-syntax-grey uppercase tracking-wider">
            Description
          </h4>
          <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
            {task.description || (
              <span className="italic text-syntax-grey">
                No description provided.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-white/10">
          <div className="text-xs text-syntax-grey flex justify-between">
            <span>Created:</span>
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-syntax-grey flex justify-between">
            <span>Updated:</span>
            <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
