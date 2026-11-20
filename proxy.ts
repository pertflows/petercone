import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Keeps the couple’s Supabase Auth session fresh on admin routes by refreshing
 * the auth cookies before Server Components render (they cannot set cookies).
 *
 * This is NOT the authorisation layer — every admin page, server action and
 * route handler calls requireAdmin()/getAdminSession() itself. Without
 * Supabase configured (local JSON mode) this is a pass-through.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Revalidates the JWT with Supabase and rotates the refresh token if needed.
  // Do not run code between createServerClient and getUser().
  await supabase.auth.getUser();

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
