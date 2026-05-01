import React, { useState, useEffect } from "react";
import { render, Text, Box, useInput } from "ink";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { exec } from "node:child_process";

const CONFIG_DIR = path.join(os.homedir(), ".config", "syncopate");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  token?: string;
}

async function loadConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveConfig(config: Config) {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

const App = () => {
  const [output, setOutput] = useState<string[]>([
    "Welcome to Syncopate TUI!",
    "Type /auth to login.",
  ]);
  const [input, setInput] = useState("");
  const [config, setConfig] = useState<Config>({});

  useEffect(() => {
    loadConfig().then(setConfig);
  }, []);

  const handleAuth = () => {
    const port = 3456;
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || "", `http://localhost:${port}`);
      const token = url.searchParams.get("token");

      if (token) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Authentication successful!</h1><p>You can close this tab and return to the terminal.</p>",
        );
        await saveConfig({ ...config, token });
        setConfig({ ...config, token });
        setOutput((prev) => [...prev, "Authentication successful!"]);
        server.close();
      } else {
        res.writeHead(400);
        res.end("Bad Request");
      }
    });

    server.listen(port, () => {
      const authUrl = `http://localhost:3000/cli/auth?port=${port}`;
      const startCmd =
        process.platform === "win32"
          ? "start"
          : process.platform === "darwin"
            ? "open"
            : "xdg-open";
      exec(`${startCmd} "${authUrl}"`);
      setOutput((prev) => [
        ...prev,
        `Waiting for authentication callback on port ${port}...`,
      ]);
    });
  };

  useInput((char, key) => {
    if (key.return) {
      setOutput((prev) => [...prev, `> ${input}`]);
      if (input === "/auth") {
        handleAuth();
      } else if (input === "/logout") {
        saveConfig({ ...config, token: undefined }).then(() => {
          setConfig({ ...config, token: undefined });
          setOutput((prev) => [...prev, "Logged out."]);
        });
      } else if (input) {
        setOutput((prev) => [...prev, `Command not found: ${input}`]);
      }
      setInput("");
    } else if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
    } else {
      setInput((prev) => prev + char);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        {output.map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}
      </Box>
      <Box>
        <Text color="green">$ </Text>
        <Text>{input}</Text>
        {/* Simple cursor */}
        <Text inverse> </Text>
      </Box>
      {config.token && (
        <Box marginTop={1}>
          <Text color="gray">Logged in</Text>
        </Box>
      )}
    </Box>
  );
};

render(<App />);
