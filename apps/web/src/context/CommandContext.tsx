'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppMode, COMMAND_REGISTRY, NORMAL_ACTIONS_REGISTRY } from '../lib/commands';

interface CommandContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  outputHistory: string[];
  executeCommand: (commandStr: string) => void;
  clearHistory: () => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('normal');
  const [outputHistory, setOutputHistory] = useState<string[]>([]);
  const router = useRouter();

  // Used for tracking sequential key presses like 'g' followed by 'g'
  const keyBuffer = useRef<string>('');
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
        setMode
      });
    } else {
      printOutput([`Command not found: ${cmdName}. Type /help for available commands.`]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting when typing in normal input fields or textareas (unless we need to)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (mode === 'normal') {
        // Switch to command mode
        if (e.key === '/') {
          if (!isInput) {
            e.preventDefault();
            setMode('command');
          }
          return;
        }

        // Handle normal mode actions
        if (!isInput) {
          // Track key buffer for multi-key commands like 'gg'
          keyBuffer.current += e.key;

          if (keyTimeout.current) {
            clearTimeout(keyTimeout.current);
          }

          // Check for exact matches in normal actions (e.g., 'j', 'k', 'G')
          if (NORMAL_ACTIONS_REGISTRY[e.key]) {
            NORMAL_ACTIONS_REGISTRY[e.key].action();
            keyBuffer.current = '';
          }
          // Check for buffer matches (e.g., 'gg')
          else if (NORMAL_ACTIONS_REGISTRY[keyBuffer.current]) {
            NORMAL_ACTIONS_REGISTRY[keyBuffer.current].action();
            keyBuffer.current = '';
          }

          // Reset buffer after 500ms
          keyTimeout.current = setTimeout(() => {
            keyBuffer.current = '';
          }, 500);
        }
      } else if (mode === 'command') {
        // Handle exiting command mode
        if (e.key === 'Escape') {
          e.preventDefault();
          setMode('normal');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keyTimeout.current) clearTimeout(keyTimeout.current);
    };
  }, [mode]);

  return (
    <CommandContext.Provider value={{ mode, setMode, outputHistory, executeCommand, clearHistory }}>
      {children}
    </CommandContext.Provider>
  );
}

export function useCommand() {
  const context = useContext(CommandContext);
  if (context === undefined) {
    throw new Error('useCommand must be used within a CommandProvider');
  }
  return context;
}
