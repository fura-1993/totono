import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fallbackHookPath = path.join(currentDir, "fs-rename-exdev-fallback.cjs");
const nextBinPath = path.join(currentDir, "..", "node_modules", "next", "dist", "bin", "next");

const existingNodeOptions = process.env.NODE_OPTIONS?.trim();
const fallbackRequireOption = `--require ${fallbackHookPath}`;
const nodeOptions = existingNodeOptions
  ? `${existingNodeOptions} ${fallbackRequireOption}`
  : fallbackRequireOption;

const child = spawn(process.execPath, [nextBinPath, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

