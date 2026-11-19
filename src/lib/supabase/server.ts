import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * Why the cast: @supabase/ssr 0.5 declares its return type with an older
 * SupabaseClient generic order than the installed supabase-js 2.x, which turns
 * every table type into `never`. The runtime object is the same; the cast
 * restores the correct types. Remove it after upgrading @supabase/ssr to a
 * release whose types match supabase-js.
 */
export async function createClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component: cookies are read-only there.
            // The middleware refreshes the session, so this is safe to ignore.
          }
        },
      },
    }
  );
  return client as unknown as TypedSupabaseClient;
}
