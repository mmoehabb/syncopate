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
import { AppMode } from "../types/commands";
import { COMMAND_REGISTRY } from "../lib/command-registry";
import { NORMAL_ACTIONS_REGISTRY } from "../lib/normal-actions-registry";

interface CommandContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  outputHistory: string[];
  executeCommand: (commandStr: string) => void;
  clearHistory: () => void;

  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>("normal");
  const [outputHistory, setOutputHistory] = useState<string[]>([]);
  const router = useRouter();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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
        selectedTaskId,
        activeBoardId: window.location.pathname.startsWith("/dashboard/b/")
          ? window.location.pathname.split("/dashboard/b/")[1]
          : undefined,
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
          // Vim Pane switching via DOM
          if (e.ctrlKey) {
            const containers = Array.from(
              document.querySelectorAll(".cmd-container"),
            );
            if (containers.length > 0) {
              const activeContainerIndex = containers.findIndex((c) =>
                c.classList.contains("cmd-active-container"),
              );

              if (e.key.toLowerCase() === "l") {
                e.preventDefault();
                const nextIndex =
                  activeContainerIndex < containers.length - 1
                    ? activeContainerIndex + 1
                    : 0;
                containers.forEach((c) =>
                  c.classList.remove("cmd-active-container"),
                );
                containers[nextIndex].classList.add("cmd-active-container");
                return;
              }
              if (e.key.toLowerCase() === "h") {
                e.preventDefault();
                const prevIndex =
                  activeContainerIndex > 0
                    ? activeContainerIndex - 1
                    : containers.length - 1;
                containers.forEach((c) =>
                  c.classList.remove("cmd-active-container"),
                );
                const targetContainer = containers[prevIndex] || containers[0];
                if (targetContainer)
                  targetContainer.classList.add("cmd-active-container");
                return;
              }
            }
          }

          // DOM based j / k navigation
          if (e.key === "j" || e.key === "k") {
            e.preventDefault();

            // Find active container, default to first one if none is active
            let containers = Array.from(
              document.querySelectorAll(".cmd-container"),
            );
            let activeContainer = document.querySelector(
              ".cmd-container.cmd-active-container",
            );

            if (!activeContainer && containers.length > 0) {
              activeContainer = containers[0];
              activeContainer.classList.add("cmd-active-container");
            }

            if (activeContainer) {
              const selectables = Array.from(
                activeContainer.querySelectorAll(".cmd-selectable"),
              );
              if (selectables.length > 0) {
                const selectedIndex = selectables.findIndex((s) =>
                  s.classList.contains("cmd-selected"),
                );

                let nextIndex = 0;
                if (e.key === "j") {
                  nextIndex =
                    selectedIndex < selectables.length - 1
                      ? selectedIndex + 1
                      : selectedIndex === -1
                        ? 0
                        : selectedIndex;
                } else if (e.key === "k") {
                  nextIndex = selectedIndex > 0 ? selectedIndex - 1 : 0;
                }

                // Remove from all in document to be safe, or just this container
                document
                  .querySelectorAll(".cmd-selected")
                  .forEach((el) => el.classList.remove("cmd-selected"));

                const nextSelected = selectables[nextIndex];
                if (nextSelected) {
                  nextSelected.classList.add("cmd-selected");
                  nextSelected.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                  });
                }
              }
            }
            return;
          }

          if (e.key === "Enter") {
            const selectedElement = document.querySelector(".cmd-selected");
            if (selectedElement) {
              e.preventDefault();
              (selectedElement as HTMLElement).click();
            }
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
  }, [mode]);

  return (
    <CommandContext.Provider
      value={{
        mode,
        setMode,
        outputHistory,
        executeCommand,
        clearHistory,
        selectedTaskId,
        setSelectedTaskId,
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
