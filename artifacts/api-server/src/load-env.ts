import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function findNearestEnvFile(startDir: string): string | null {
  let currentDir = path.resolve(startDir);

  while (true) {
    const candidate = path.join(currentDir, ".env");
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function parseEnvValue(rawValue: string): string {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const quote = trimmed[0];
    const inner = trimmed.slice(1, -1);

    if (quote === "\"") {
      return inner
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, "\"")
        .replace(/\\\\/g, "\\");
    }

    return inner;
  }

  return trimmed;
}

export function loadEnv(): void {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const envFile =
    findNearestEnvFile(process.cwd()) ??
    findNearestEnvFile(moduleDir);

  if (!envFile) {
    return;
  }

  const contents = fs.readFileSync(envFile, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const normalizedLine = trimmedLine.startsWith("export ")
      ? trimmedLine.slice("export ".length).trimStart()
      : trimmedLine;

    const separatorIndex = normalizedLine.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    if (process.env[key] !== undefined) {
      continue;
    }

    const value = normalizedLine.slice(separatorIndex + 1);
    process.env[key] = parseEnvValue(value);
  }
}
