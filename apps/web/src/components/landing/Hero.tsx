"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function Hero() {
  const phrases = [
    "Code-First Coordination.",
    "Terminal-Speed Productivity.",
    "Your Workflow, Uninterrupted.",
    "Built for Power Users.",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className="flex flex-col items-center text-center gap-6 py-20 z-10 relative">
      <div className="h-24 sm:h-32 flex items-center justify-center overflow-hidden -mt-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={phraseIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight"
          >
            {phrases[phraseIndex]}
          </motion.h2>
        </AnimatePresence>
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
