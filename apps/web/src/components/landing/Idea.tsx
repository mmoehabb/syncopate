import React from "react";

export function Idea() {
  return (
    <section className="py-20 border-t border-white/5 z-10 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h3 className="text-3xl font-bold text-white">
            Your board, on autopilot.
          </h3>
          <p className="text-syntax-grey text-lg leading-relaxed">
            Syncopate occupies the niche between manual task management and the
            actual codebase. It treats the Pull Request as the source of truth.
            If the code moves, the card moves. Built for developers who value a
            clean Git workflow and zero fluff.
          </p>
        </div>
        <div className="surface-panel p-6 border border-white/10 rounded-lg bg-void-grey/50">
          <div className="font-mono text-sm text-syntax-grey mb-4 flex items-center gap-2">
            <span className="text-neon-pulse">●</span> terminal
          </div>
          <div className="font-mono text-sm text-git-green space-y-2">
            <p>{">"} git commit -m &quot;feat: implement auth&quot;</p>
            <p className="text-syntax-grey">
              [Syncopate] Card #42 moved to &apos;In Progress&apos;
            </p>
            <p>{">"} gh pr create --fill</p>
            <p className="text-syntax-grey">
              [Syncopate] PR linked to Card #42
            </p>
            <p>{">"} gh pr merge</p>
            <p className="text-syntax-grey">
              [Syncopate] Card #42 moved to &apos;Done&apos;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
