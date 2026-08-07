import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client pre pouzitie v Server Components a Route Handlers.
 * Cita/zapisuje session cez cookies, aby bol user prihlaseny aj na serveri.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll bolo zavolane zo Server Componentu, kde sa neda menit cookie.
            // Nevadi, kym middleware.ts obnovuje session (viz middleware.ts).
          }
        },
      },
    }
  );
}