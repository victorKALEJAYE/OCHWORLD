import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];
const PROTECTED_PREFIXES = ["/dashboard", "/update-password", "/onboarding"];

const isProtected = (pathname: string) => PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

/**
 * Refreshes the Supabase session cookie and keeps signed-out visitors away
 * from private pages. This is a convenience redirect; the data itself is
 * protected by RLS in the database.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Fail closed in production: never serve private pages without auth configured.
    if (process.env.NODE_ENV === "production" && isProtected(request.nextUrl.pathname)) {
      return new NextResponse("Service temporarily unavailable", { status: 503 });
    }
    return response; // Local development before .env.local is set up.
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Do not add code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtected(pathname)) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/sign-in";
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/dashboard";
    dashboard.search = "";
    return NextResponse.redirect(dashboard);
  }

  return response;
}
