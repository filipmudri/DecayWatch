import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Obnovuje Supabase session cookie pri kazdom requeste.
 * Bez tohto by ti prihlasenie po case "vypadlo" aj ked user
 * medzitym nic aktivne nerobil (token by expiroval bez refreshu).
 */
export async function updateSession(request: NextRequest) {
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
  await supabase.auth.getUser();

  return supabaseResponse;
}