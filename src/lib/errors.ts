/**
 * Thrown by server-side queries when Supabase returns an error. The message
 * carries the PostgREST code and hint for the server logs; pages catch it and
 * show a friendly ErrorState instead.
 */
export class DataLoadError extends Error {
  constructor(what: string, cause: unknown) {
    super(`Couldn't load ${what}${describeCause(cause)}`, { cause });
    this.name = "DataLoadError";
  }
}

/** Puts the Supabase/PostgREST error code and message in server logs (never shown to visitors). */
function describeCause(cause: unknown) {
  if (!cause || typeof cause !== "object") return "";
  const { code, message, hint } = cause as { code?: string; message?: string; hint?: string };
  const parts = [code, message, hint && `hint: ${hint}`].filter(Boolean);
  return parts.length ? ` (${parts.join(" | ")})` : "";
}
