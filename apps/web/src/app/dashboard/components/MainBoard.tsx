"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TaskDetailsPanel } from "./TaskDetailsPanel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MainBoard({ board }: { board?: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get("taskId");

  const tasks = useMemo(() => {
    if (!board?.tasks) return [];

    // Sort tasks by status to match the visual grouping
    const statusOrder: Record<string, number> = {
      TODO: 0,
      IN_PROGRESS: 1,
      IN_REVIEW: 2,
      CHANGES_REQUESTED: 3,
      DONE: 4,
      CLOSED: 5,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [...board.tasks].sort((a: any, b: any) => {
      const orderA = statusOrder[a.status] ?? 99;
      const orderB = statusOrder[b.status] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      // Secondary sort by updatedAt desc
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [board]);

  const selectedTask = useMemo(() => {
    if (!taskIdParam) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tasks.find((t: any) => t.id.toString() === taskIdParam) || null;
  }, [taskIdParam, tasks]);

  const statusGroups = [
    { title: "TODO", status: "TODO", color: "text-syntax-grey" },
    { title: "IN PROGRESS", status: "IN_PROGRESS", color: "text-neon-pulse" },
    { title: "IN REVIEW", status: "IN_REVIEW", color: "text-git-green" },
    {
      title: "CHANGES REQUESTED",
      status: "CHANGES_REQUESTED",
      color: "text-red-400",
    },
    { title: "DONE", status: "DONE", color: "text-git-green opacity-50" },
    { title: "CLOSED", status: "CLOSED", color: "text-syntax-grey opacity-50" },
  ];

  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center bg-obsidian-night">
        <div className="text-syntax-grey font-mono text-sm">
          Select a board to view tasks
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-obsidian-night transition-all cmd-container">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-mono font-bold"># {board.name}</h2>
          <span className="text-git-green font-mono text-xs opacity-0 [.cmd-active-container_&]:opacity-100 transition-opacity">
            focused
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {statusGroups.map((group) => {
            const groupTasks = tasks.filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (t: any) => t.status === group.status,
            );
            if (groupTasks.length === 0) return null;

            return (
              <div key={group.status} className="flex flex-col gap-3">
                <div
                  className={`font-mono text-sm font-bold flex items-center justify-between border-b border-white/10 pb-2 ${group.color}`}
                >
                  <span>{group.title}</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-syntax-grey text-xs">
                    {groupTasks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {groupTasks.map((task: any) => {
                    return (
                      <div
                        key={task.id.toString()}
                        onClick={() =>
                          router.push(`?taskId=${task.id.toString()}`)
                        }
                        className={`surface-panel p-3 rounded-md border transition-all cursor-pointer flex items-center justify-between ${selectedTask?.id === task.id ? "border-git-green bg-git-green/5 shadow-md scale-[1.01]" : "border-white/10 bg-void-grey hover:border-white/20"} cmd-selectable [&.cmd-selected]:border-git-green [&.cmd-selected]:bg-git-green/5 [&.cmd-selected]:shadow-md [&.cmd-selected]:scale-[1.01]`}
                      >
                        <div className="flex flex-col">
                          <div className="text-syntax-grey font-mono text-xs mb-1">
                            SYNC-{task.id.toString()}{" "}
                            {task.prNumber && `| PR #${task.prNumber}`}
                          </div>
                          <div
                            className={`font-mono text-sm leading-relaxed ${task.status === "DONE" || task.status === "CLOSED" ? "text-syntax-grey line-through" : "text-white"}`}
                          >
                            {task.title}
                          </div>
                        </div>
                        {task.branchName && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-neon-pulse/10 text-neon-pulse text-[10px] font-mono lowercase">
                              {task.branchName}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="text-syntax-grey font-mono text-sm text-center py-10 italic">
              No tasks found. Use /add-task to create one.
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsPanel
          task={selectedTask}
          onClose={() => router.push(`/dashboard/b/${board.id}`)}
        />
      )}
    </div>
  );
}
