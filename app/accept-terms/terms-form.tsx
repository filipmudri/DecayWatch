"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TERMS_VERSION } from "@/lib/legal";

export function AcceptTermsForm() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return <form className="space-y-5" onSubmit={async (event) => {
    event.preventDefault();
    if (!accepted) { setError("Please accept the Terms & Conditions."); return; }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/legal/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accepted: true, version: TERMS_VERSION }) });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(typeof body?.error === "string"
          ? body.error
          : "Unable to save your agreement. Please try again or contact the operator.");
      }
      router.push("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      setBusy(false);
    }
  }}>
    <label htmlFor="terms" className="flex items-start gap-3 text-sm leading-6">
      <input id="terms" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--gold)]" />
      <span>I agree to the <Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms &amp; Conditions</Link> (version {TERMS_VERSION}).</span>
    </label>
    <p className="text-xs text-neutral-400">Read our <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</Link> and <Link href="/cookies" target="_blank" rel="noopener noreferrer" className="underline">Cookies &amp; Storage notice</Link>.</p>
    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    <button type="submit" disabled={busy} className="w-full rounded bg-white text-black py-2 text-sm disabled:opacity-50">{busy ? "Saving..." : "Accept and continue"}</button>
    <button type="button" disabled={busy} className="w-full text-sm underline disabled:opacity-50" onClick={async () => {
      setBusy(true);
      const { error } = await createClient().auth.signOut();
      if (error) { setError("Unable to sign out. Please try again."); setBusy(false); return; }
      router.push("/login"); router.refresh();
    }}>Sign out without accepting</button>
    <p className="text-xs text-neutral-400">You can also request account deletion from the contact address in the Privacy Policy.</p>
  </form>;
}
