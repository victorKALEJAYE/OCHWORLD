/**
 * sessionStorage key for the first-visit loader. Lives outside the client
 * component so the server layout can read the plain string (values exported
 * from a "use client" file become client references on the server).
 */
export const INITIAL_LOADER_SEEN_KEY = "och_loader_seen";
