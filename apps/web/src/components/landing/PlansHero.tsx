"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PlansHero() {
  const phrases = [
    "Unlock Team Potential.",
    "Scale Your Workflow.",
    "Collaborate Without Limits.",
    "Ship Faster Together.",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className="flex flex-col items-center text-center gap-6 py-20 z-10 relative border-b border-white/5">
      <div className="h-24 sm:h-32 flex items-center justify-center overflow-hidden">
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
      <p className="text-syntax-grey text-lg max-w-2xl">
        Whether you are a solo developer looking for a clean workflow or a large
        enterprise needing to coordinate across hundreds of boards, Syncopate
        has a plan tailored to your velocity.
      </p>
    </section>
  );
}
