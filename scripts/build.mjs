import { readdirSync, rmSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(fileURLToPath(import.meta.url), "../..");
const distDir = path.join(rootDir, "dist");

const EXCLUDE = new Set([
  ".git",
  ".github",
  ".wrangler",
  "node_modules",
  "dist",
  "scripts",
  "wrangler.jsonc",
  ".assetsignore",
  "package.json",
  "package-lock.json",
  ".gitignore",
]);

rmSync(distDir, { recursive: true, force: true });

for (const entry of readdirSync(rootDir)) {
  if (EXCLUDE.has(entry)) continue;
  cpSync(path.join(rootDir, entry), path.join(distDir, entry), { recursive: true });
}
