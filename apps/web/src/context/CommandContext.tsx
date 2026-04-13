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

type Pane = "sidebar" | "main";

interface CommandContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  outputHistory: string[];
  executeCommand: (commandStr: string) => void;
  clearHistory: () => void;

  activePane: Pane;
  paneFocus: Record<Pane, number>;

  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
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

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Automatic element discovery
  useEffect(() => {
    const updateCounts = () => {
      const sidebarItems = document.querySelectorAll(
        '[data-pane="sidebar"] .cmd-selectable',
      ).length;
      const mainItems = document.querySelectorAll(
        '[data-pane="main"] .cmd-selectable',
      ).length;

      setPaneItemsCount((prev) => {
        if (prev.sidebar === sidebarItems && prev.main === mainItems) {
          return prev;
        }
        return {
          sidebar: sidebarItems,
          main: mainItems,
        };
      });
    };

    updateCounts();

    const observer = new MutationObserver((mutations) => {
      // Only update if child list changed or cmd-selectable class was toggled
      const shouldUpdate = mutations.some(
        (m) =>
          m.type === "childList" ||
          (m.type === "attributes" && m.attributeName === "class"),
      );
      if (shouldUpdate) {
        updateCounts();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Visual focus management
  useEffect(() => {
    // Remove all existing focus classes
    document.querySelectorAll(".cmd-focused").forEach((el) => {
      el.classList.remove("cmd-focused");
    });

    // Add focus class to current item
    const selector = `[data-pane="${activePane}"] .cmd-selectable`;
    const items = document.querySelectorAll(selector);
    const currentItem = items[paneFocus[activePane]] as HTMLElement;

    if (currentItem) {
      currentItem.classList.add("cmd-focused");
      currentItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activePane, paneFocus]);

  // Used for tracking sequential key presses like 'g' followed by 'g'
  const keyBuffer = useRef<string>("");
  const keyTimeout = useRef<NodeJS.Timeout | null>(null);

  const clearHistory = () => setOutputHistory([]);

  const printOutput = useCallback((output: string[]) => {
    if (output.length === 0) {
      setOutputHistory([]);
    } else {
      setOutputHistory((prev) => [...prev, ...output]);
    }
  }, []);

  const executeCommand = useCallback(
    (commandStr: string) => {
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
    },
    [router, selectedTaskId, printOutput],
  );

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

          if (e.key === "Enter") {
            const selector = `[data-pane="${activePane}"] .cmd-selectable`;
            const items = document.querySelectorAll(selector);
            const currentItem = items[paneFocus[activePane]] as HTMLElement;

            if (currentItem) {
              if (
                currentItem.tagName === "INPUT" ||
                currentItem.tagName === "TEXTAREA"
              ) {
                // If already focused, let Enter behave normally
                if (document.activeElement === currentItem) {
                  return;
                }
                e.preventDefault();
                currentItem.focus();
              } else if (currentItem.tagName === "SELECT") {
                const select = currentItem as HTMLSelectElement;
                if ("showPicker" in select) {
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (select as any).showPicker();
                  } catch (err) {
                    console.error("Failed to show picker:", err);
                    select.focus();
                  }
                } else {
                  select.focus();
                }
              } else {
                e.preventDefault();
                currentItem.click();
              }
              return;
            }
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
  }, [
    mode,
    activePane,
    paneItemsCount,
    paneFocus,
    executeCommand,
    selectedTaskId,
  ]);

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
