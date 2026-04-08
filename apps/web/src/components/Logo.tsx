import React from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="#00F5FF"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/*
        A geometric "S" integrated with a Git Graph.
        Points:
        Top right -> top left -> middle right -> bottom left -> bottom right
        with some nodes along the path
      */}

      {/* The main 'S' path / branch line */}
      <path d="M 80 20 L 40 20 L 40 50 L 60 50 L 60 80 L 20 80" />

      {/* Node (commit) at the start */}
      <circle cx="80" cy="20" r="6" fill="#0B0E14" />

      {/* Node (commit) in the middle */}
      <circle cx="50" cy="50" r="6" fill="#0B0E14" />

      {/* Node (commit) at the end */}
      <circle cx="20" cy="80" r="6" fill="#0B0E14" />

      {/* A merging branch line */}
      <path d="M 20 20 L 20 40 L 40 50" strokeDasharray="4 4" />

      {/* Commit on the merging branch */}
      <circle cx="20" cy="20" r="6" fill="#00F5FF" />
    </svg>
  );
}
