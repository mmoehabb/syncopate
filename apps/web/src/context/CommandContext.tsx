"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  AppMode,
  COMMAND_REGISTRY,
  NORMAL_ACTIONS_REGISTRY,
} from "../lib/commands";

interface CommandContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  outputHistory: string[];
  executeCommand: (commandStr: string) => void;
  clearHistory: () => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>("normal");
  const [outputHistory, setOutputHistory] = useState<string[]>([]);
  const router = useRouter();

  // Vim navigation DOM reference
  const currentSelectedRef = useRef<HTMLElement | null>(null);

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
    const cmdName = commandStr.trim().toLowerCase();

    printOutput([`$ /${cmdName}`]);

    if (COMMAND_REGISTRY[cmdName]) {
      COMMAND_REGISTRY[cmdName].action({
        navigate: (path) => router.push(path),
        printOutput,
        setMode,
      });
    } else {
      printOutput([
        `Command not found: ${cmdName}. Type /help for available commands.`,
      ]);
    }
  };

  // Helper to change selection
  const setSelectedElement = (element: HTMLElement | null) => {
    if (currentSelectedRef.current) {
      currentSelectedRef.current.classList.remove("cmd-selected");
    }
    if (element) {
      element.classList.add("cmd-selected");
      // ensure we scroll it into view naturally
      element.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    currentSelectedRef.current = element;
  };

  // Setup initial selection on mount
  useEffect(() => {
    const initSelection = () => {
      // Don't override if we already have one selected in the DOM
      if (document.querySelector(".cmd-selected")) {
        const existing = document.querySelector(".cmd-selected") as HTMLElement;
        if (currentSelectedRef.current !== existing) {
          currentSelectedRef.current = existing;
        }
        return;
      }

      const firstContainer = document.querySelector(
        ".cmd-container",
      ) as HTMLElement;
      if (firstContainer) {
        const firstSelectable = firstContainer.querySelector(
          ".cmd-selectable",
        ) as HTMLElement;
        if (firstSelectable) {
          setSelectedElement(firstSelectable);
        }
      }
    };

    // Run initially
    initSelection();

    // Re-run if DOM changes and we lost selection
    const observer = new MutationObserver(() => {
      if (
        currentSelectedRef.current &&
        !document.contains(currentSelectedRef.current)
      ) {
        // our selected element was removed from the DOM
        initSelection();
      } else if (!currentSelectedRef.current) {
        initSelection();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

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
          // Vim Pane/Container switching
          if (e.ctrlKey) {
            if (["h", "j", "k", "l"].includes(e.key.toLowerCase())) {
              e.preventDefault();
              const containers = Array.from(
                document.querySelectorAll(".cmd-container"),
              ) as HTMLElement[];

              if (containers.length === 0) return;

              let currentContainerIndex = -1;
              if (currentSelectedRef.current) {
                const currentContainer =
                  currentSelectedRef.current.closest(".cmd-container");
                if (currentContainer) {
                  currentContainerIndex = containers.indexOf(
                    currentContainer as HTMLElement,
                  );
                }
              }

              let nextContainerIndex = currentContainerIndex;

              if (e.key.toLowerCase() === "h" || e.key.toLowerCase() === "k") {
                nextContainerIndex =
                  currentContainerIndex > 0 ? currentContainerIndex - 1 : 0;
              } else if (
                e.key.toLowerCase() === "l" ||
                e.key.toLowerCase() === "j"
              ) {
                nextContainerIndex =
                  currentContainerIndex < containers.length - 1
                    ? currentContainerIndex + 1
                    : containers.length - 1;
              }

              if (
                nextContainerIndex !== currentContainerIndex &&
                nextContainerIndex >= 0
              ) {
                const nextContainer = containers[nextContainerIndex];
                const firstSelectable = nextContainer.querySelector(
                  ".cmd-selectable",
                ) as HTMLElement;
                if (firstSelectable) {
                  setSelectedElement(firstSelectable);
                }
              }
              return;
            }
          }

          // Vim Navigation inside container
          if (["h", "j", "k", "l"].includes(e.key.toLowerCase())) {
            e.preventDefault();

            if (!currentSelectedRef.current) return;

            const currentContainer =
              currentSelectedRef.current.closest(".cmd-container");
            if (!currentContainer) return;

            const selectables = Array.from(
              currentContainer.querySelectorAll(".cmd-selectable"),
            ) as HTMLElement[];

            if (selectables.length === 0) return;

            const currentIndex = selectables.indexOf(
              currentSelectedRef.current,
            );
            let nextIndex = currentIndex;

            if (e.key.toLowerCase() === "h" || e.key.toLowerCase() === "k") {
              nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
            } else if (
              e.key.toLowerCase() === "l" ||
              e.key.toLowerCase() === "j"
            ) {
              nextIndex =
                currentIndex < selectables.length - 1
                  ? currentIndex + 1
                  : selectables.length - 1;
            }

            if (nextIndex !== currentIndex && nextIndex >= 0) {
              setSelectedElement(selectables[nextIndex]);
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
