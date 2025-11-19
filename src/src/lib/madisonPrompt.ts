import { readFileSync } from "fs";
import * as path from "path";

/**
 * Build the Madison system prompt string.
 * Right now it just returns the core prompt from prompts/madison_core_v1.md.
 * Later you can append category-specific appendices here.
 */
export function buildMadisonPrompt(): string {
  const rootDir = process.cwd();
  const promptPath = path.join(rootDir, "prompts", "madison_core_v1.md");

  const content = readFileSync(promptPath, "utf8");

  return content.trim();
}