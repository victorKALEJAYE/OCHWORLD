import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Viewer = { id: string; email?: string; name?: string };

/**
 * The signed-in visitor for this request, or null for guests.
 * Uses getUser() (verified with Supabase Auth), never the unverified session.
 * Name comes from user_metadata and is for display/pre-filling only.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = user.user_metadata as { full_name?: string; name?: string };
    return { id: user.id, email: user.email, name: meta.full_name ?? meta.name };
  } catch {
    // Supabase not configured or unreachable: treat as a guest rather than failing the page.
    return null;
  }
});
