"use client";

import React from "react";
import { useCommandBar } from "../hooks/use-command-bar";

export function CommandBar() {
  const {
    mode,
    outputHistory,
    inputValue,
    setInputValue,
    inputRef,
    outputEndRef,
    handleKeyDown,
  } = useCommandBar();

  if (mode === "normal" && outputHistory.length === 0) {
    return null; // Don't show anything if in normal mode and no output
  }

  return (
    <div
      className={`fixed bottom-0 left-0 w-full z-50 flex flex-col justify-end transition-transform duration-300 ${
        mode === "command" ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Terminal Output Area */}
      {outputHistory.length > 0 && mode === "command" && (
        <div className="bg-obsidian-night/95 border-t border-white/10 p-4 max-h-[50vh] overflow-y-auto backdrop-blur-md font-mono text-sm text-syntax-grey">
          <div className="flex flex-col gap-1 max-w-5xl mx-auto w-full">
            {outputHistory.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
            <div ref={outputEndRef} />
          </div>
        </div>
      )}

      {/* Command Input Area */}
      <div className="bg-void-grey border-t border-white/10 p-2 sm:p-4">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-2">
          <span className="text-neon-pulse font-mono font-bold">/</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g. help)..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-syntax-grey/50"
            autoComplete="off"
            spellCheck="false"
          />
          <span className="text-xs text-syntax-grey font-mono ml-auto">
            [ESC] to cancel
          </span>
        </div>
      </div>
    </div>
  );
}
