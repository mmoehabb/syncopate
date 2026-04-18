"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCommand } from "../context/CommandContext";
import { resolvePath } from "../lib/utils/path";

export function CommandBar() {
  const {
    mode,
    setMode,
    outputHistory,
    executeCommand,
    printOutput,
    commandLog,
    virtualPath,
  } = useCommand();
  const [inputValue, setInputValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Reset history index when mode changes
  useEffect(() => {
    if (mode === "command") {
      setHistoryIndex(-1);
    }
  }, [mode]);

  // Focus input when entering command mode
  useEffect(() => {
    if (mode === "command" && inputRef.current) {
      inputRef.current.focus();
    } else if (mode === "normal" && inputRef.current) {
      inputRef.current.blur();
    }
  }, [mode]);

  // Clear input when mode changes to normal to avoid set state in effect synchronously
  if (mode === "normal" && inputValue !== "") {
    setInputValue("");
  }

  // Scroll to bottom of output when new output is added
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [outputHistory, mode]); // also scroll when mode opens

  const handleTabCompletion = async () => {
    const commandsWithPaths = [
      "cd",
      "ls",
      "delete-board",
      "add-member",
      "rmv-member",
    ];
    const parts = inputValue.split(" ");
    if (parts.length === 0) return;

    const cmdName = parts[0].toLowerCase();

    // Auto-complete command name itself
    if (parts.length === 1) {
      import("../lib/command-registry").then(({ COMMAND_REGISTRY }) => {
        const matches = Object.keys(COMMAND_REGISTRY).filter((c) =>
          c.startsWith(cmdName),
        );
        if (matches.length === 1) {
          setInputValue(matches[0] + " ");
        } else if (matches.length > 1) {
          printOutput([`$ /${inputValue}`, ...matches]);
        }
      });
      return;
    }

    if (!commandsWithPaths.includes(cmdName)) {
      return;
    }

    // Auto-complete paths
    const pathPrefix = parts.slice(1).join(" ");

    const lastSlashIndex = pathPrefix.lastIndexOf("/");
    const dirPath =
      lastSlashIndex >= 0 ? pathPrefix.substring(0, lastSlashIndex) : ".";
    const prefix =
      lastSlashIndex >= 0
        ? pathPrefix.substring(lastSlashIndex + 1)
        : pathPrefix;

    const resolvedPath = resolvePath(virtualPath, dirPath);

    try {
      const { directoryApi } = await import("@syncopate/api");
      const response = await directoryApi.getDirectory(resolvedPath);

      const entries = response.entries.map((e) => {
        if (e.type === "Task") {
          return e.name; // Keep SYNC-123 casing
        }
        const formattedName = e.name.toLowerCase().replace(/ /g, "-");
        // Only return name, tasks should just use the ID
        return formattedName;
      });

      const matches = entries.filter((e) =>
        e.toLowerCase().startsWith(prefix.toLowerCase()),
      );

      if (matches.length === 1) {
        const completedPath =
          lastSlashIndex >= 0
            ? pathPrefix.substring(0, lastSlashIndex + 1) + matches[0]
            : matches[0];
        // Only add trailing slash if it's not a task, but we don't necessarily know that easily here without matching the entry type.
        // Let's just complete the path. If they want to go deeper, they can type slash.
        setInputValue(`${cmdName} ${completedPath}`);
      } else if (matches.length > 1) {
        printOutput([`$ /${inputValue}`, ...matches]);
      }
    } catch (err) {
      // Ignore errors for auto-completion (e.g., directory not found)
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      handleTabCompletion();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        executeCommand(inputValue);
        setInputValue("");
        setHistoryIndex(-1);
        // After command execution, user might want to stay in command mode or we could switch.
        // We'll keep them in command mode so they can read the output. Escape handles exit.
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMode("normal");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandLog.length > 0) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandLog.length) {
          setHistoryIndex(nextIndex);
          setInputValue(commandLog[nextIndex]);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        if (nextIndex === -1) {
          setInputValue("");
        } else {
          setInputValue(commandLog[nextIndex]);
        }
      }
    }
  };

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
            onBlur={() => {
              // Optionally revert to normal mode on blur
              // setMode('normal');
            }}
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
