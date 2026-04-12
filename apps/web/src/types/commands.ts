export type AppMode = "normal" | "command";

export interface Command {
  name: string;
  description: string;
  action: (args: {
    navigate: (path: string) => void;
    printOutput: (output: string[]) => void;
    setMode: (mode: AppMode) => void;
    args?: string[];
    selectedTaskId?: string | null;
    activeBoardId?: string;
  }) => void;
}

export interface NormalAction {
  key: string;
  description: string;
  action: () => void;
}
