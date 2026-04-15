/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TaskDetailsPanel } from "./TaskDetailsPanel";
import { formatRelativeOrAbsoluteDate } from "@/lib/utils/date";
import { Search } from "lucide-react";
import { VoiceCallPanel } from "./VoiceCallPanel";
import { useCommand } from "@/context/CommandContext";

export function MainBoard({ board }: { board?: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get("taskId");
  const { isVoiceCallActive } = useCommand();

  const searchQueryParam = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(searchQueryParam);

  useEffect(() => {
    setSearchValue(searchQueryParam);
  }, [searchQueryParam]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set("search", val);
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

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
    return (
      tasks.find(
        (t: {
          id: { toString: () => string };
          status: string;
          [key: string]: unknown;
        }) => t.id.toString() === taskIdParam,
      ) || null
    );
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
      <div className="flex-1 flex items-center justify-center bg-obsidian-night transition-all cmd-container">
        <div className="text-syntax-grey font-mono text-sm">
          Select a board to view tasks
        </div>
        <span className="absolute top-4 right-4 text-git-green font-mono text-xs opacity-0 [.cmd-active-container_&]:opacity-100 transition-opacity">
          focused
        </span>
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
          <div className="flex items-center gap-2 px-3 py-2 bg-void-grey border border-white/10 rounded-md focus-within:border-git-green transition-colors">
            <Search size={16} className="text-syntax-grey" />
            <input
              type="text"
              placeholder="Search tasks... (or type /search-task)"
              value={searchValue}
              onChange={handleSearchChange}
              className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white placeholder:text-syntax-grey/50"
            />
          </div>

          {statusGroups.map((group) => {
            const groupTasks = tasks.filter(
              (t: {
                id: { toString: () => string };
                status: string;
                [key: string]: unknown;
              }) => t.status === group.status,
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
                  {}
                  {groupTasks.map(
                    (task: {
                      id: { toString: () => string };
                      status: string;
                      title: string;
                      prNumber?: number;
                      branchName?: string;
                      assignees?: any[];
                      reviewers?: any[];
                      unregisteredAssignees?: string | any[];
                      unregisteredReviewers?: string | any[];
                      createdAt: string | Date;
                      updatedAt: string | Date;
                      [key: string]: unknown;
                    }) => {
                      const assignees = task.assignees || [];
                      const reviewers = task.reviewers || [];
                      const unregisteredAssignees =
                        typeof task.unregisteredAssignees === "string"
                          ? JSON.parse(task.unregisteredAssignees)
                          : task.unregisteredAssignees || [];
                      const unregisteredReviewers =
                        typeof task.unregisteredReviewers === "string"
                          ? JSON.parse(task.unregisteredReviewers)
                          : task.unregisteredReviewers || [];

                      const hasPeople =
                        assignees.length > 0 ||
                        reviewers.length > 0 ||
                        unregisteredAssignees.length > 0 ||
                        unregisteredReviewers.length > 0;

                      return (
                        <div
                          key={task.id.toString()}
                          onClick={() =>
                            router.push(`?taskId=${task.id.toString()}`)
                          }
                          className={`surface-panel p-3 rounded-md border transition-all cursor-pointer flex flex-col gap-2 ${selectedTask?.id === task.id ? "border-git-green bg-git-green/5 shadow-md scale-[1.01]" : "border-white/10 bg-void-grey hover:border-white/20"} cmd-selectable [&.cmd-selected]:border-git-green [&.cmd-selected]:bg-git-green/5 [&.cmd-selected]:shadow-md [&.cmd-selected]:scale-[1.01]`}
                        >
                          <div className="flex items-start justify-between">
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
                              <div className="flex items-center gap-2 ml-2 shrink-0 mt-1">
                                <span className="px-2 py-0.5 rounded-full bg-neon-pulse/10 text-neon-pulse text-[10px] font-mono lowercase">
                                  {task.branchName}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-3">
                              {/* People section */}
                              {hasPeople && (
                                <div className="flex items-center gap-3">
                                  {/* Assignees */}
                                  {(assignees.length > 0 ||
                                    unregisteredAssignees.length > 0) && (
                                    <div className="flex -space-x-2">
                                      {}
                                      {assignees.map(
                                        (user: {
                                          id: string;
                                          name: string | null;
                                          email: string | null;
                                          image: string | null;
                                        }) => (
                                          <div
                                            key={user.id}
                                            className="w-5 h-5 rounded-full overflow-hidden border border-void-grey relative group"
                                            title={`Assignee: ${user.name || user.email || "Unknown"}`}
                                          >
                                            {user.image ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img
                                                src={user.image}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full bg-neon-pulse/20 text-neon-pulse flex items-center justify-center text-[10px] font-bold">
                                                {(
                                                  user.name ||
                                                  user.email ||
                                                  "?"
                                                )
                                                  .charAt(0)
                                                  .toUpperCase()}
                                              </div>
                                            )}
                                          </div>
                                        ),
                                      )}
                                      {}
                                      {unregisteredAssignees.map(
                                        (
                                          u: {
                                            login: string;
                                            avatar_url: string;
                                          },
                                          idx: number,
                                        ) => (
                                          <div
                                            key={`u-a-${idx}`}
                                            className="w-5 h-5 rounded-full overflow-hidden border border-void-grey relative group"
                                            title={`Assignee: Anonymous (${u.login}) - Not registered on Syncopate`}
                                          >
                                            {u.avatar_url ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img
                                                src={u.avatar_url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover grayscale opacity-80"
                                              />
                                            ) : (
                                              <div className="w-full h-full bg-syntax-grey/20 text-syntax-grey flex items-center justify-center text-[10px] font-bold">
                                                ?
                                              </div>
                                            )}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}

                                  {/* Reviewers */}
                                  {(reviewers.length > 0 ||
                                    unregisteredReviewers.length > 0) && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-syntax-grey font-mono tracking-tighter">
                                        REV:
                                      </span>
                                      <div className="flex -space-x-2">
                                        {}
                                        {reviewers.map(
                                          (user: {
                                            id: string;
                                            name: string | null;
                                            email: string | null;
                                            image: string | null;
                                          }) => (
                                            <div
                                              key={user.id}
                                              className="w-5 h-5 rounded-full overflow-hidden border border-void-grey relative group"
                                              title={`Reviewer: ${user.name || user.email || "Unknown"}`}
                                            >
                                              {user.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                  src={user.image}
                                                  alt="Avatar"
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <div className="w-full h-full bg-git-green/20 text-git-green flex items-center justify-center text-[10px] font-bold">
                                                  {(
                                                    user.name ||
                                                    user.email ||
                                                    "?"
                                                  )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </div>
                                              )}
                                            </div>
                                          ),
                                        )}
                                        {}
                                        {unregisteredReviewers.map(
                                          (
                                            u: {
                                              login: string;
                                              avatar_url: string;
                                            },
                                            idx: number,
                                          ) => (
                                            <div
                                              key={`u-r-${idx}`}
                                              className="w-5 h-5 rounded-full overflow-hidden border border-void-grey relative group"
                                              title={`Reviewer: Anonymous (${u.login}) - Not registered on Syncopate`}
                                            >
                                              {u.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                  src={u.avatar_url}
                                                  alt="Avatar"
                                                  className="w-full h-full object-cover grayscale opacity-80"
                                                />
                                              ) : (
                                                <div className="w-full h-full bg-syntax-grey/20 text-syntax-grey flex items-center justify-center text-[10px] font-bold">
                                                  ?
                                                </div>
                                              )}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end text-[10px] font-mono text-syntax-grey opacity-70 group-hover:opacity-100 transition-opacity">
                              <div
                                title={`Created: ${new Date(task.createdAt).toLocaleString()}`}
                              >
                                {formatRelativeOrAbsoluteDate(task.createdAt)}
                              </div>
                              {new Date(task.updatedAt).getTime() !==
                                new Date(task.createdAt).getTime() && (
                                <div
                                  title={`Updated: ${new Date(task.updatedAt).toLocaleString()}`}
                                  className="text-white/40"
                                >
                                  ✎{" "}
                                  {formatRelativeOrAbsoluteDate(task.updatedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
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

      {isVoiceCallActive && board && <VoiceCallPanel boardId={board.id} />}
    </div>
  );
}
