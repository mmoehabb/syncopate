"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  AppMode,
  COMMAND_REGISTRY,
  NORMAL_ACTIONS_REGISTRY,
} from "../lib/commands";

type Pane = "sidebar" | "main";

interface CommandContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  outputHistory: string[];
  executeCommand: (commandStr: string) => void;
  clearHistory: () => void;

  activePane: Pane;
  paneFocus: Record<Pane, number>;
  registerPaneItemsCount: (pane: Pane, count: number) => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>("normal");
  const [outputHistory, setOutputHistory] = useState<string[]>([]);
  const router = useRouter();

  // Vim navigation state
  const [activePane, setActivePane] = useState<Pane>("sidebar");
  const [paneFocus, setPaneFocus] = useState<Record<Pane, number>>({
    sidebar: 0,
    main: 0,
  });
  const [paneItemsCount, setPaneItemsCount] = useState<Record<Pane, number>>({
    sidebar: 0,
    main: 0,
  });

  const registerPaneItemsCount = useCallback((pane: Pane, count: number) => {
    setPaneItemsCount((prev) => {
      if (prev[pane] === count) return prev;
      return { ...prev, [pane]: count };
    });
  }, []);

  // Used for tracking sequential key presses like 'g' followed by 'g'
  const keyBuffer = useRef<string>("");
  const keyTimeout = useRef<NodeJS.Timeout | null>(null);

  const clearHistory = () => setOutputHistory([]);

  const printOutput = (output: string[]) => {
    if (output.length === 0) {
      clearHistory();
    } else {
      setOutputHistory((prev) => [...prev, ...output]);
    }
  };

  const executeCommand = (commandStr: string) => {
    const parts = commandStr.trim().split(" ");
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    printOutput([`$ /${commandStr.trim()}`]);

    if (COMMAND_REGISTRY[cmdName]) {
      COMMAND_REGISTRY[cmdName].action({
        navigate: (path) => router.push(path),
        printOutput,
        setMode,
        args,
      });
    } else {
      printOutput([
        `Command not found: ${cmdName}. Type /help for available commands.`,
      ]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (mode === "normal") {
        if (e.key === "/") {
          if (!isInput) {
            e.preventDefault();
            setMode("command");
          }
          return;
        }

        if (!isInput) {
          // Vim Pane switching
          if (e.ctrlKey) {
            if (e.key.toLowerCase() === "l") {
              e.preventDefault();
              setActivePane("main");
              return;
            }
            if (e.key.toLowerCase() === "h") {
              e.preventDefault();
              setActivePane("sidebar");
              return;
            }
          }

          // Vim Navigation j / k
          if (e.key === "j") {
            e.preventDefault();
            setPaneFocus((prev) => {
              const max = Math.max(0, paneItemsCount[activePane] - 1);
              return {
                ...prev,
                [activePane]: Math.min(prev[activePane] + 1, max),
              };
            });
            return;
          }
          if (e.key === "k") {
            e.preventDefault();
            setPaneFocus((prev) => {
              return {
                ...prev,
                [activePane]: Math.max(prev[activePane] - 1, 0),
              };
            });
            return;
          }

          keyBuffer.current += e.key;

          if (keyTimeout.current) {
            clearTimeout(keyTimeout.current);
          }

          if (NORMAL_ACTIONS_REGISTRY[e.key]) {
            NORMAL_ACTIONS_REGISTRY[e.key].action();
            keyBuffer.current = "";
          } else if (NORMAL_ACTIONS_REGISTRY[keyBuffer.current]) {
            NORMAL_ACTIONS_REGISTRY[keyBuffer.current].action();
            keyBuffer.current = "";
          }

          keyTimeout.current = setTimeout(() => {
            keyBuffer.current = "";
          }, 500);
        }
      } else if (mode === "command") {
        if (e.key === "Escape") {
          e.preventDefault();
          setMode("normal");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (keyTimeout.current) clearTimeout(keyTimeout.current);
    };
  }, [mode, activePane, paneItemsCount]);

  return (
    <CommandContext.Provider
      value={{
        mode,
        setMode,
        outputHistory,
        executeCommand,
        clearHistory,
        activePane,
        paneFocus,
        registerPaneItemsCount,
      }}
    >
      {children}
    </CommandContext.Provider>
  );
}

export function useCommand() {
  const context = useContext(CommandContext);
  if (context === undefined) {
    throw new Error("useCommand must be used within a CommandProvider");
  }
  return context;
}
