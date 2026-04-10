"use client";

const mockTasks = [
  { id: "1", title: "Setup authentication", status: "DONE", label: "feature" },
  { id: "2", title: "Create layout shell", status: "IN_REVIEW", label: "ui" },
  {
    id: "3",
    title: "Implement vim keybindings",
    status: "IN_PROGRESS",
    label: "core",
  },
  { id: "4", title: "Add Postgres connection", status: "TODO", label: "db" },
];

export function MainBoard() {
  const columns = [
    { title: "TODO", status: "TODO" },
    { title: "IN PROGRESS", status: "IN_PROGRESS" },
    { title: "IN REVIEW", status: "IN_REVIEW" },
    { title: "DONE", status: "DONE" },
  ];

  return (
    <div className="cmd-container flex-1 flex flex-col bg-obsidian-night transition-all has-[.cmd-selected]:shadow-[inset_0_0_10px_rgba(46,160,67,0.1)]">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-white font-mono font-bold"># general</h2>
      </div>

      <div className="flex-1 overflow-x-auto p-6 flex gap-6">
        {columns.map((col) => {
          const tasks = mockTasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              className="flex-1 min-w-[280px] flex flex-col gap-3"
            >
              <div className="text-syntax-grey font-mono text-sm font-bold flex items-center justify-between mb-2">
                <span>{col.title}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded">
                  {tasks.length}
                </span>
              </div>
              {tasks.map((task) => {
                return (
                  <div
                    key={task.id}
                    className="cmd-selectable surface-panel p-4 rounded-md border transition-all border-white/10 bg-void-grey hover:border-white/20 [&.cmd-selected]:border-git-green [&.cmd-selected]:bg-git-green/5 [&.cmd-selected]:shadow-md [&.cmd-selected]:scale-[1.02] outline-none"
                    tabIndex={0}
                  >
                    <div className="text-syntax-grey font-mono text-xs mb-2">
                      SYNC-{task.id}
                    </div>
                    <div className="text-white font-mono text-sm mb-4 leading-relaxed">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-neon-pulse/10 text-neon-pulse text-[10px] font-mono uppercase">
                        {task.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
