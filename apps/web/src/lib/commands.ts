export type AppMode = "normal" | "command";

export interface Command {
  name: string;
  description: string;
  action: (args: {
    navigate: (path: string) => void;
    printOutput: (output: string[]) => void;
    setMode: (mode: AppMode) => void;
    args?: string[];
  }) => void;
}

export interface NormalAction {
  key: string;
  description: string;
  action: () => void;
}

export const COMMAND_REGISTRY: Record<string, Command> = {
  help: {
    name: "help",
    description: "List all available commands and shortcuts",
    action: ({ printOutput }) => {
      const output = [
        "--- SYNC-OS v1.0.0 ---",
        "Available Commands:",
        ...Object.values(COMMAND_REGISTRY).map(
          (cmd) => `  /${cmd.name.padEnd(10)} - ${cmd.description}`,
        ),
        "",
        "Normal Mode Shortcuts:",
        ...Object.values(NORMAL_ACTIONS_REGISTRY).map(
          (act) => `  ${act.key.padEnd(11)} - ${act.description}`,
        ),
      ];
      printOutput(output);
    },
  },
  board: {
    name: "board",
    description: "Navigate to the board view",
    action: ({ navigate, setMode }) => {
      navigate("/board");
      setMode("normal");
    },
  },
  pulls: {
    name: "pulls",
    description: "Navigate to the pull requests view",
    action: ({ navigate, setMode }) => {
      navigate("/pulls");
      setMode("normal");
    },
  },
  settings: {
    name: "settings",
    description: "Navigate to the settings view",
    action: ({ navigate, setMode }) => {
      navigate("/settings");
      setMode("normal");
    },
  },
  "add-board": {
    name: "add-board",
    description: "Open settings to add a new board",
    action: ({ navigate, setMode }) => {
      navigate("/settings");
      setMode("normal");
    },
  },
  "delete-board": {
    name: "delete-board",
    description: "Delete a board (usage: /delete-board <workspace_name>/<board_name>)",
    action: ({ args, printOutput }) => {
      if (!args || args.length === 0) {
        printOutput(["Error: Missing arguments. Usage: /delete-board <workspace_name>/<board_name>"]);
        return;
      }

      const fullPath = args.join(" ");
      const parts = fullPath.split("/");

      if (parts.length !== 2) {
        printOutput(["Error: Invalid format. Usage: /delete-board <workspace_name>/<board_name>"]);
        return;
      }

      const [workspaceName, boardName] = parts;

      import('./api/BoardApi').then(({ boardApi }) => {
        boardApi.deleteBoard(workspaceName.trim(), boardName.trim())
          .then(() => {
            printOutput([`Successfully deleted board '${boardName}' from workspace '${workspaceName}'.`]);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          })
          .catch((err) => {
            printOutput([`Error: ${err.response?.data?.error || err.message}`]);
          });
      });
    },
  },
  clear: {
    name: "clear",
    description: "Clear terminal output",
    action: ({ printOutput }) => {
      printOutput([]); // A special case, we'll handle this in the context to clear history
    },
  },
};

export const NORMAL_ACTIONS_REGISTRY: Record<string, NormalAction> = {
  j: {
    key: "j",
    description: "Scroll down",
    action: () => {
      window.scrollBy({ top: 100, behavior: "smooth" });
    },
  },
  k: {
    key: "k",
    description: "Scroll up",
    action: () => {
      window.scrollBy({ top: -100, behavior: "smooth" });
    },
  },
  gg: {
    key: "gg",
    description: "Go to top",
    action: () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
  G: {
    key: "G",
    description: "Go to bottom",
    action: () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    },
  },
};
