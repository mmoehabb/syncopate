"use client";

import React, { useState } from "react";
import Link from "next/link";

export function Plans() {
  const [duration, setDuration] = useState<"month" | "three_months" | "year">(
    "month",
  );

  const teamPrice = {
    month: 12,
    three_months: 30, // $10/mo
    year: 96, // $8/mo
  };

  const enterprisePrice = {
    month: 30,
    three_months: 80,
    year: 250,
  };

  return (
    <section className="py-20 border-t border-white/5 z-10 relative">
      <div className="flex flex-col items-center mb-12">
        <h3 className="text-3xl font-bold text-white mb-4">Pricing</h3>
        <p className="text-syntax-grey text-center max-w-2xl">
          Start for free, upgrade when you need to collaborate.
        </p>

        <div className="mt-8 flex bg-void-grey p-1 rounded border border-white/10 font-mono text-sm">
          <button
            className={`px-4 py-2 rounded ${duration === "month" ? "bg-obsidian-night text-neon-pulse border border-white/5" : "text-syntax-grey hover:text-white"}`}
            onClick={() => setDuration("month")}
          >
            1 Month
          </button>
          <button
            className={`px-4 py-2 rounded ${duration === "three_months" ? "bg-obsidian-night text-neon-pulse border border-white/5" : "text-syntax-grey hover:text-white"}`}
            onClick={() => setDuration("three_months")}
          >
            3 Months
          </button>
          <button
            className={`px-4 py-2 rounded ${duration === "year" ? "bg-obsidian-night text-neon-pulse border border-white/5" : "text-syntax-grey hover:text-white"}`}
            onClick={() => setDuration("year")}
          >
            1 Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Tier */}
        <div className="surface-panel overflow-hidden p-8 border border-white/10 rounded-lg flex flex-col bg-void-grey/30">
          <h4 className="text-xl font-bold text-white mb-2">Solo</h4>
          <div className="text-3xl font-bold text-white mb-6">
            $0
            <span className="text-sm font-normal text-syntax-grey">
              /forever
            </span>
          </div>
          <ul className="space-y-3 mb-8 text-syntax-grey flex-1">
            <li className="flex items-center gap-2">
              <span className="text-git-green">✓</span> 1 Workspace
            </li>
            <li className="flex items-center gap-2">
              <span className="text-git-green">✓</span> Up to 5 Boards
            </li>
            <li className="flex items-center gap-2">
              <span className="text-git-green">✓</span> 1 User (Solo)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-git-green">✓</span> Full Git Integration
            </li>
          </ul>
          <Link
            href="/login"
            className="w-full py-2 text-center rounded border border-white/20 text-white font-mono hover:bg-white/5 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Team Tier */}
        <div className="surface-panel p-8 border border-neon-pulse/50 rounded-lg flex flex-col bg-obsidian-night relative shadow-[0_0_15px_rgba(0,245,255,0.1)]">
          <div className="absolute -top-3 right-8 bg-neon-pulse text-obsidian-night px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Most Popular
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Team</h4>
          <div className="text-3xl font-bold text-white mb-6">
            ${teamPrice[duration]}
            <span className="text-sm font-normal text-syntax-grey">
              /
              {duration
                .replace("_", " ")
                .replace("year", "yr")
                .replace("month", "mo")
                .replace("three mos", "3mo")}
            </span>
          </div>
          <ul className="space-y-3 mb-8 text-syntax-grey flex-1">
            <li className="flex items-center gap-2">
              <span className="text-neon-pulse">✓</span> Unlimited Workspaces
            </li>
            <li className="flex items-center gap-2">
              <span className="text-neon-pulse">✓</span> Unlimited Boards
            </li>
            <li className="flex items-center gap-2">
              <span className="text-neon-pulse">✓</span> Up to 10 Members/Board
            </li>
            <li className="flex items-center gap-2">
              <span className="text-neon-pulse">✓</span> Priority Sync
            </li>
          </ul>
          <Link
            href="/login"
            className="w-full py-2 text-center rounded bg-neon-pulse text-obsidian-night font-bold font-mono hover:bg-neon-pulse/90 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Enterprise Tier */}
        <div className="surface-panel overflow-hidden p-8 border border-white/10 rounded-lg flex flex-col bg-void-grey/30">
          <h4 className="text-xl font-bold text-white mb-2">Enterprise</h4>
          <div className="text-3xl font-bold text-white mb-6">
            ${enterprisePrice[duration]}
            <span className="text-sm font-normal text-syntax-grey">
              /
              {duration
                .replace("_", " ")
                .replace("year", "yr")
                .replace("month", "mo")
                .replace("three mos", "3mo")}
            </span>
          </div>
          <ul className="space-y-3 mb-8 text-syntax-grey flex-1">
            <li className="flex items-center gap-2">
              <span className="text-git-green">✓</span> Everything in Team
            </li>
            <li className="flex items-center gap-2">
              <span className="text-git-green">✓</span> Unlimited Members
            </li>
            <li className="flex items-center gap-2">
              <span className="text-git-green">✓</span> SSO Integration
            </li>
            <li className="flex items-center gap-2">
              <span className="text-git-green">✓</span> Dedicated Support
            </li>
          </ul>
          <Link
            href="/login"
            className="w-full py-2 text-center rounded border border-white/20 text-white font-mono hover:bg-white/5 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}
