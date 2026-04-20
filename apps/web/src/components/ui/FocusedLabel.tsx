import React from "react";

interface FocusedLabelProps {
  className?: string;
}

export function FocusedLabel({ className = "" }: FocusedLabelProps) {
  return (
    <span
      className={`text-neon-pulse font-mono text-xs opacity-0 [.cmd-active-container_&]:opacity-100 transition-opacity ${className}`}
    >
      focused
    </span>
  );
}
