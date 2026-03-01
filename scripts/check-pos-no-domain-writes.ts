/**
 * POS No-Domain-Writes Guardrail
 * Ensures app-layer UI (pages, components) performs ZERO direct domain write calls.
 * All writes must go through POS API routes (fetchPos).
 *
 * Scans: src/app/** (excluding src/app/api, src/app/actions)
 * Fails if:
 *   (a) import from "@/domain" or "src/domain" includes write symbols
 *   (b) references to: updateTableLayout, renameSeat, removeSeatByNumber, recordEventWithSource
 *
 * Run with: npm run check:pos-no-domain-writes
 */

import { readFileSync, readdirSync } from "fs";
import { resolve, relative } from "path";

const FORBIDDEN_SYMBOLS = [
  "updateTableLayout",
  "renameSeat",
  "removeSeatByNumber",
  "recordEventWithSource",
] as const;

const APP_ROOT = resolve(process.cwd(), "src/app");
const EXCLUDED_SUBDIRS = ["api", "actions"];

function collectFiles(dir: string, base = dir): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = resolve(dir, e.name);
    const rel = relative(base, full);
    const topSegment = rel.split("/")[0];
    if (EXCLUDED_SUBDIRS.includes(topSegment)) continue;
    if (e.isDirectory()) {
      files.push(...collectFiles(full, base));
    } else if (e.isFile() && /\.(ts|tsx)$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

function main() {
  const files = collectFiles(APP_ROOT);
  const errors: { file: string; line: string; match: string }[] = [];

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const sym of FORBIDDEN_SYMBOLS) {
        if (new RegExp(`\\b${sym}\\b`).test(line)) {
          errors.push({
            file: relative(process.cwd(), file),
            line: `${i + 1}: ${line.trim()}`,
            match: sym,
          });
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error("check-pos-no-domain-writes: FAIL");
    console.error("");
    console.error("App-layer UI must not use domain write functions. Use POS API (fetchPos) instead.");
    console.error("");
    const byFile = new Map<string, typeof errors>();
    for (const e of errors) {
      const list = byFile.get(e.file) ?? [];
      list.push(e);
      byFile.set(e.file, list);
    }
    for (const [file, list] of byFile) {
      console.error(`  ${file}:`);
      for (const { line, match } of list) {
        console.error(`    ${line}  <- ${match}`);
      }
      console.error("");
    }
    process.exit(1);
  }

  console.log("check-pos-no-domain-writes: PASS");
}

main();
