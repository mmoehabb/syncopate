"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppMode } from "../types/commands";
import { COMMAND_REGISTRY } from "../lib/command-registry";
import {
  useInputFocusTracking,
  useActiveContainerSync,
  useKeyboardNavigation,
} from "../hooks/command";

interface CommandContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  outputHistory: string[];
  executeCommand: (commandStr: string) => void;
  clearHistory: () => void;

  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isVoiceCallActive: boolean;
  setIsVoiceCallActive: (active: boolean) => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>("normal");
  const [outputHistory, setOutputHistory] = useState<string[]>([]);
  const router = useRouter();
  const params = useParams();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);

  const { isInputFocused } = useInputFocusTracking();
  useActiveContainerSync();
  useKeyboardNavigation(mode, setMode);

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
        activeBoardId: params?.boardId as string | undefined,
        isVoiceCallActive,
        setIsVoiceCallActive,
      });
    } else {
      printOutput([
        `Command not found: ${cmdName}. Type /help for available commands.`,
      ]);
    }
  };

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
        isVoiceCallActive,
        setIsVoiceCallActive,
      }}
    >
      {children}
      {isInputFocused && mode === "normal" && (
        <div className="fixed bottom-4 left-4 z-50 bg-git-green text-obsidian-night font-mono text-xs px-3 py-2 rounded shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          Press{" "}
          <kbd className="font-bold border border-obsidian-night/20 rounded px-1">
            ESC
          </kbd>{" "}
          to resume navigation
        </div>
      )}
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
