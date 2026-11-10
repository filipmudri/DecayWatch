import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createDemoAccounts } from "@/lib/accounts/demo";
import { DemoDashboard } from "./DemoDashboard";

export const metadata: Metadata = {
  title: "Try the Demo | DecayWatch",
  description: "Explore DecayWatch with three sample accounts. No sign-up required.",
};

// Fresh relative dates on every request, shared with the client for hydration.
export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sessionCookie = url ? `sb-${new URL(url).hostname.split(".")[0]}-auth-token` : null;
  // A presentation hint only, not an authentication/authorisation decision.
  // This avoids making the public demo wait for an auth network request.
  const returnToAccounts = Boolean(sessionCookie && cookieStore.getAll().some(({ name, value }) =>
    value && (name === sessionCookie || name.startsWith(`${sessionCookie}.`)),
  ));
  return <DemoDashboard initialAccounts={createDemoAccounts()} returnToAccounts={returnToAccounts} />;
}
