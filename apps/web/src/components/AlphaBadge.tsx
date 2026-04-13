import React from "react";

export function AlphaBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-neon-pulse text-neon-pulse bg-neon-pulse/10 ${className}`}
    >
      ALPHA
    </span>
  );
}
