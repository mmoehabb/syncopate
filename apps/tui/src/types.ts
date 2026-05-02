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
    isVoiceCallActive?: boolean;
    setIsVoiceCallActive?: (active: boolean) => void;
    virtualPath: string;
    setVirtualPath: (path: string) => void;
    setActiveBoardId?: (id: string | undefined) => void;
    setDeleteModalState?: (state: {
      isOpen: boolean;
      message?: string;
      onConfirm?: () => Promise<void>;
    }) => void;
    showToast?: (message: string, type?: "success" | "error" | "info") => void;
  }) => void;
}

export interface NormalAction {
  key: string;
  description: string;
  action: () => void;
}
