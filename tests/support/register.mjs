// Lets Node's built-in test runner load the app's TypeScript directly:
// resolves the "@/..." alias to src/ and adds the missing .ts/.tsx extension.
// Node 22.18+ strips the TypeScript types itself, so no build step or extra
// packages are needed. Used by `npm test` (see package.json).
import { register } from "node:module";

register("./resolve-hook.mjs", import.meta.url);
