const fs = require('fs');

const path = 'apps/web/src/lib/command-registry.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace pulls command
content = content.replace(/  pulls: \{\n    name: "pulls",\n    description: "Navigate to the pull requests view",\n    action: \(\{ navigate, setMode \}\) => \{\n      navigate\("\/pulls"\);\n      setMode\("normal"\);\n    \},\n  \},\n/, '');

// Replace help command content
const oldHelpActionStr = `      const navCommands = commands.filter((c) =>
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
        [
          "add-board",
          "delete-board",
          "invite-member",
          "rmv-member",
          "join-voice-call",
        ].includes(c.name),
      );
      const taskCommands = commands.filter((c) =>
        ["add-task", "update-task", "delete-task", "search-task"].includes(
          c.name,
        ),
      );

      const formatCmd = (cmd: Command) =>
        \`  /\${cmd.name.padEnd(12)} - \${cmd.description}\`;

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
          (act) => \`  \${act.key.padEnd(13)} - \${act.description}\`,
        ),
      ];`;

const newHelpActionStr = `      const navCommands = commands.filter((c) =>
        [
          "ls",
          "cd",
          "pwd",
          "help",
          "board",
          "dashboard",
          "settings",
          "back",
          "forward",
          "logout",
          "clear",
        ].includes(c.name),
      );
      const workspaceCommands = commands.filter((c) =>
        [
          "delete-workspace",
          "activate-workspace",
          "deactivate-workspace",
        ].includes(c.name),
      );
      const boardCommands = commands.filter((c) =>
        [
          "add-board",
          "delete-board",
          "activate-board",
          "deactivate-board",
          "invite-member",
          "rmv-member",
          "join-voice-call",
        ].includes(c.name),
      );
      const taskCommands = commands.filter((c) =>
        ["add-task", "update-task", "delete-task", "search-task"].includes(
          c.name,
        ),
      );

      const formatCmd = (cmd: Command) =>
        \`  /\${cmd.name.padEnd(12)} - \${cmd.description}\`;

      const output = [
        "--- SYNC-OS v1.0.0 ---",
        "Navigation & System:",
        ...navCommands.map(formatCmd),
        "",
        "Workspaces:",
        ...workspaceCommands.map(formatCmd),
        "",
        "Boards:",
        ...boardCommands.map(formatCmd),
        "",
        "Tasks:",
        ...taskCommands.map(formatCmd),
        "",
        "Normal Mode Shortcuts:",
        ...Object.values(NORMAL_ACTIONS_REGISTRY).map(
          (act) => \`  \${act.key.padEnd(13)} - \${act.description}\`,
        ),
      ];`;

content = content.replace(oldHelpActionStr, newHelpActionStr);

fs.writeFileSync(path, content, 'utf8');
