const fs = require('fs');

const content = fs.readFileSync('apps/web/src/lib/command-registry.ts', 'utf8');

const regex = /^\s{2}"?([a-zA-Z0-9-]+)"?: \{/gm;
let m;
const commands = [];
while ((m = regex.exec(content)) !== null) {
  if (m.index === regex.lastIndex) {
    regex.lastIndex++;
  }
  commands.push(m[1]);
}

console.log("Commands found:", commands.length);

const allCommandNames = [
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
  "delete-workspace",
  "activate-workspace",
  "deactivate-workspace",
  "add-board",
  "delete-board",
  "activate-board",
  "deactivate-board",
  "invite-member",
  "rmv-member",
  "join-voice-call",
  "add-task",
  "update-task",
  "delete-task",
  "search-task"
];

const missing = commands.filter(c => !allCommandNames.includes(c));
const extra = allCommandNames.filter(c => !commands.includes(c));

console.log("Missing in allCommandNames:", missing);
console.log("Extra in allCommandNames:", extra);
