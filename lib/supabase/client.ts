import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client pre pouzitie v Client Components ("use client").
 * Pouziva NEXT_PUBLIC_ premenne, ktore su bezpecne v browseri
 * (anon key + RLS policies zabezpecuju izolaciu dat per user).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}