import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { TERMS_VERSION } from "@/lib/legal";

/**
 * Obnovuje Supabase session cookie pri kazdom requeste.
 * Bez tohto by ti prihlasenie po case "vypadlo" aj ked user
 * medzitym nic aktivne nerobil (token by expiroval bez refreshu).
 */
export async function updateSession(request: NextRequest) {
  // The isolated public demo needs neither credentials nor an auth request.
  if (request.nextUrl.pathname === "/demo") return NextResponse.next({ request });
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // DOLEZITE: nevkladaj sem ziadnu logiku medzi createServerClient a getUser().
  // getUser() musi bezat, aby sa token skutocne obnovil.
  const { data: { user } } = await supabase.auth.getUser();

  // Legal pages, recovery and account deletion stay accessible without acceptance.
  if (user && request.nextUrl.pathname === "/") {
    const { data, error } = await supabase.from("legal_acceptances")
      .select("terms_version").eq("user_id", user.id)
      .eq("terms_version", TERMS_VERSION).maybeSingle();
    if (error || !data) {
      const response = NextResponse.redirect(new URL("/accept-terms", request.url));
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
      return response;
    }
  }

  return supabaseResponse;
}
