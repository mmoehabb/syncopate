import { useEffect, useRef, useState } from "react";
import { useCommand } from "../context/CommandContext";

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
    const { executeTabCompletion } = await import("@syncoboard/shared");
    const { COMMAND_REGISTRY } = await import("../lib/command-registry");

    await executeTabCompletion({
      inputValue,
      virtualPath,
      commandRegistryKeys: Object.keys(COMMAND_REGISTRY),
      getDirectoryEntries: async (path) => {
        const { directoryApi } = await import("@syncoboard/api");
        return directoryApi.getDirectory(path);
      },
      setInputValue,
      printOutput,
    });
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
