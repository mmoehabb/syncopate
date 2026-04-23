const fs = require('fs');
const content = fs.readFileSync('apps/web/src/lib/command-registry.ts', 'utf8');

// A simple regex to find all command keys in COMMAND_REGISTRY
const commandMatch = content.match(/export const COMMAND_REGISTRY: Record<string, Command> = \{([\s\S]+?)\};\n/);
if (commandMatch) {
  console.log("Found COMMAND_REGISTRY");
} else {
  console.log("Could not find COMMAND_REGISTRY");
}
