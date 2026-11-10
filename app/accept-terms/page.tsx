import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TERMS_VERSION } from "@/lib/legal";
import { AcceptTermsForm } from "./terms-form";

export default async function AcceptTermsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("legal_acceptances").select("terms_version")
    .eq("user_id", user.id).eq("terms_version", TERMS_VERSION).maybeSingle();
  if (data) redirect("/");
  return <main className="auth-page max-w-md mx-auto mt-24 px-6"><h1 className="text-2xl font-semibold mb-4">Before you continue</h1>
    <p className="text-sm text-neutral-400 mb-6">Please review the current terms before using account synchronisation. This also applies to accounts created with Google.</p>
    <AcceptTermsForm />
  </main>;
}
