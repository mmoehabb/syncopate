import { useEffect, useRef, useState } from "react";
import { useCommand } from "../context/CommandContext";
import { resolvePath } from "../lib/utils/path";

export function useCommandBar() {
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

  // Clear input when mode changes to normal
  if (mode === "normal" && inputValue !== "") {
    setInputValue("");
  }

  // Scroll to bottom of output when new output is added
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [outputHistory, mode]);

  const handleTabCompletion = async () => {
    const commandsWithPaths = [
      "cd",
      "ls",
      "delete-board",
      "invite-member",
      "leave-board",
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

  return {
    mode,
    outputHistory,
    inputValue,
    setInputValue,
    inputRef,
    outputEndRef,
    handleKeyDown,
  };
}
