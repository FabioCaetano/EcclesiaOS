import { existsSync, readFileSync } from "node:fs";
import { dirname, join, parse, resolve } from "node:path";

const parseEnvLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (!key) return null;

  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return { key, value };
};

const findEnvFile = () => {
  let current = resolve(process.cwd());

  while (true) {
    const candidate = join(current, ".env");
    if (existsSync(candidate)) return candidate;

    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
};

export const loadEnv = () => {
  const envFile = findEnvFile();
  if (!envFile) return;

  const lines = readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const parsed = parseEnvLine(line);
    if (parsed && process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value;
    }
  }
};

loadEnv();
