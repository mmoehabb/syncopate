"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

// -- Components --

function Header() {
  return (
    <header className="flex justify-between items-center w-full pb-6 border-b border-white/5 pt-8 z-20 relative">
      <div className="flex items-center gap-3">
        <Logo className="w-8 h-8" />
        <h1 className="text-xl font-bold text-white tracking-tight">
          Syncopate
        </h1>
      </div>
      <nav className="flex gap-4 font-mono text-sm">
        <Link
          href="/login"
          className="bg-neon-pulse text-obsidian-night px-4 py-2 rounded font-semibold hover:bg-neon-pulse/90 transition-colors"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}

function Hero() {
  const phrases = [
    "Code-First Coordination.",
    "Terminal-Speed Productivity.",
    "Your Workflow, Uninterrupted.",
    "Built for Power Users.",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setFade(true);
      }, 500); // Wait for fade out to complete before swapping text
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className="flex flex-col items-center text-center gap-6 py-20 z-10 relative">
      <div className="h-24 sm:h-32 flex items-center justify-center">
        <h2
          className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}
        >
          {phrases[phraseIndex]}
        </h2>
      </div>
      <p className="text-syntax-grey text-lg max-w-xl">
        Stop updating tickets. Just push code. Syncopate automatically syncs
        your board state with repository activity to eliminate &quot;stale
        ticket&quot; syndrome.
      </p>
      <div className="mt-4 flex flex-col items-center gap-2">
        <Link
          href="/login"
          className="bg-neon-pulse text-obsidian-night px-8 py-3 rounded font-mono font-semibold hover:bg-neon-pulse/90 transition-colors text-lg"
        >
          $ start --free
        </Link>
        <span className="text-syntax-grey text-sm font-mono mt-2">
          Free forever for solo developers.
        </span>
      </div>
    </section>
  );
}

function MatrixBackground() {
  const [columns, setColumns] = useState<
    {
      col: number;
      top: string;
      animation: string;
      animationDelay: string;
      chars: string[];
    }[]
  >([]);

  useEffect(() => {
    // Generate some random columns for the matrix effect asynchronously
    // to avoid synchronously triggering state updates inside useEffect
    const timeoutId = setTimeout(() => {
      const colCount = Math.floor(window.innerWidth / 30);
      const newColumns = Array.from({ length: colCount }).map((_, i) => {
        const chars = Array.from({ length: 20 }).map(() =>
          String.fromCharCode(33 + Math.floor(Math.random() * 94)),
        );

        return {
          col: i,
          top: `-${Math.random() * 100}%`,
          animation: `fall ${Math.random() * 5 + 5}s linear infinite`,
          animationDelay: `-${Math.random() * 5}s`,
          chars,
        };
      });
      setColumns(newColumns);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
      {columns.map((columnData) => (
        <div
          key={columnData.col}
          className="absolute text-git-green font-mono text-sm"
          style={{
            left: `${columnData.col * 30}px`,
            top: columnData.top,
            animation: columnData.animation,
            animationDelay: columnData.animationDelay,
          }}
        >
          {columnData.chars.map((char, i) => (
            <div key={i} className="my-1">
              {char}
            </div>
          ))}
        </div>
      ))}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(1000px); opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}

function Idea() {
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

function Plans() {
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
        <div className="surface-panel p-8 border border-white/10 rounded-lg flex flex-col bg-void-grey/30">
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
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-neon-pulse text-obsidian-night px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
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
        <div className="surface-panel p-8 border border-white/10 rounded-lg flex flex-col bg-void-grey/30">
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

function Footer() {
  return (
    <footer className="w-full py-8 border-t border-white/5 mt-12 z-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Logo className="w-6 h-6" />
          <span className="text-syntax-grey font-mono text-sm">
            © {new Date().getFullYear()} Syncopate. All rights reserved.
          </span>
        </div>
        <div className="flex gap-6 font-mono text-sm text-syntax-grey">
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon-pulse transition-colors"
          >
            Discord
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center min-h-screen bg-obsidian-night relative overflow-x-hidden">
      <MatrixBackground />
      <div className="w-full max-w-6xl px-6 flex flex-col">
        <Header />
        <main className="flex flex-col w-full">
          <Hero />
          <Idea />
          <Plans />
        </main>
        <Footer />
      </div>
    </div>
  );
}
