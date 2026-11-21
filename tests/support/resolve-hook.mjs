import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const SRC = fileURLToPath(new URL("../../src/", import.meta.url));
const EXTENSIONS = [".ts", ".tsx", "/index.ts", "/index.tsx"];

function withExtension(file) {
  if (/\.(m?[jt]sx?|json)$/.test(file) && existsSync(file)) return file;
  for (const ext of EXTENSIONS) if (existsSync(file + ext)) return file + ext;
  return null;
}

export async function resolve(specifier, context, next) {
  let candidate = null;
  if (specifier.startsWith("@/")) {
    candidate = path.join(SRC, specifier.slice(2));
  } else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    candidate = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  }
  if (candidate) {
    const file = withExtension(candidate);
    if (file) return next(pathToFileURL(file).href, context);
  }
  return next(specifier, context);
}
