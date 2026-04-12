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

export const COMMAND_REGISTRY: Record<string, Command> = {
  help: {
    name: "help",
    description: "List all available commands and shortcuts",
    action: ({ printOutput }) => {
      const commands = Object.values(COMMAND_REGISTRY);

      const navCommands = commands.filter((c) =>
        [
          "dashboard",
          "pulls",
          "settings",
          "back",
          "forward",
          "logout",
          "clear",
        ].includes(c.name),
      );
      const boardCommands = commands.filter((c) =>
        ["add-board", "delete-board"].includes(c.name),
      );
      const taskCommands = commands.filter((c) =>
        ["add-task", "update-task", "delete-task"].includes(c.name),
      );

      const formatCmd = (cmd: Command) =>
        `  /${cmd.name.padEnd(12)} - ${cmd.description}`;

      const output = [
        "--- SYNC-OS v1.0.0 ---",
        "Navigation & System:",
        ...navCommands.map(formatCmd),
        "",
        "Boards:",
        ...boardCommands.map(formatCmd),
        "",
        "Tasks:",
        ...taskCommands.map(formatCmd),
        "",
        "Normal Mode Shortcuts:",
        ...Object.values(NORMAL_ACTIONS_REGISTRY).map(
          (act) => `  ${act.key.padEnd(13)} - ${act.description}`,
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
  dashboard: {
    name: "dashboard",
    description: "Navigate to the dashboard view",
    action: ({ navigate, setMode }) => {
      navigate("/dashboard");
      setMode("normal");
    },
  },
  back: {
    name: "back",
    description: "Go back one page",
    action: ({ setMode }) => {
      window.history.back();
      setMode("normal");
    },
  },
  forward: {
    name: "forward",
    description: "Go forward one page",
    action: ({ setMode }) => {
      window.history.forward();
      setMode("normal");
    },
  },
  logout: {
    name: "logout",
    description: "Logout of the application",
    action: async ({ printOutput }) => {
      printOutput(["Logging out..."]);
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: "/login" });
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
    description:
      "Delete a board (usage: /delete-board <workspace_name>/<board_name>)",
    action: ({ args, printOutput }) => {
      if (!args || args.length === 0) {
        printOutput([
          "Error: Missing arguments. Usage: /delete-board <workspace_name>/<board_name>",
        ]);
        return;
      }

      const fullPath = args.join(" ");
      const parts = fullPath.split("/");

      if (parts.length !== 2) {
        printOutput([
          "Error: Invalid format. Usage: /delete-board <workspace_name>/<board_name>",
        ]);
        return;
      }

      const [workspaceName, boardName] = parts;

      import("./api/BoardApi").then(({ boardApi }) => {
        boardApi
          .deleteBoard(workspaceName.trim(), boardName.trim())
          .then(() => {
            printOutput([
              `Successfully deleted board '${boardName}' from workspace '${workspaceName}'.`,
            ]);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          })
          .catch((err: unknown) => {
            const errorMessage =
              (err as { response?: { data?: { error?: string } } }).response
                ?.data?.error ||
              (err as Error).message ||
              "Failed to delete board.";
            printOutput([`Error: ${errorMessage}`]);
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
  "add-task": {
    name: "add-task",
    description:
      "Add a new task to the current board (usage: /add-task <title>)",
    action: ({ args, printOutput, activeBoardId, setMode }) => {
      if (!activeBoardId) {
        printOutput(["Error: You must be on a board to add a task."]);
        return;
      }
      if (!args || args.length === 0) {
        printOutput(["Error: Missing task title. Usage: /add-task <title>"]);
        return;
      }
      const title = args.join(" ");
      import("./actions/tasks").then(({ addTask }) => {
        addTask(activeBoardId, title)
          .then(() => {
            printOutput([`Successfully added task: '${title}'`]);
            setMode("normal");
          })
          .catch((err: unknown) => {
            const errorMessage =
              (err as Error).message || "Failed to add task.";
            printOutput([`Error: ${errorMessage}`]);
          });
      });
    },
  },
  "update-task": {
    name: "update-task",
    description:
      "Update the selected task's status (usage: /update-task <status>)",
    action: ({ args, printOutput, selectedTaskId, setMode }) => {
      if (!selectedTaskId) {
        printOutput([
          "Error: No task selected. Navigate to a task first using j/k.",
        ]);
        return;
      }
      if (!args || args.length === 0) {
        printOutput(["Error: Missing status. Usage: /update-task <status>"]);
        return;
      }
      const status = args[0].toUpperCase();
      import("./actions/tasks").then(({ updateTaskStatus }) => {
        updateTaskStatus(selectedTaskId, status)
          .then(() => {
            printOutput([
              `Successfully updated task SYNC-${selectedTaskId} to ${status}`,
            ]);
            setMode("normal");
          })
          .catch((err: unknown) => {
            const errorMessage =
              (err as Error).message || "Failed to update task status.";
            printOutput([`Error: ${errorMessage}`]);
          });
      });
    },
  },
  "delete-task": {
    name: "delete-task",
    description: "Delete the selected task",
    action: ({ printOutput, selectedTaskId, setMode }) => {
      if (!selectedTaskId) {
        printOutput([
          "Error: No task selected. Navigate to a task first using j/k.",
        ]);
        return;
      }
      import("./actions/tasks").then(({ deleteTask }) => {
        deleteTask(selectedTaskId)
          .then(() => {
            printOutput([`Successfully deleted task SYNC-${selectedTaskId}`]);
            setMode("normal");
          })
          .catch((err: unknown) => {
            const errorMessage =
              (err as Error).message || "Failed to delete task.";
            printOutput([`Error: ${errorMessage}`]);
          });
      });
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
