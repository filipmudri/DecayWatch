import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cookies & Storage | DecayWatch" };

export default function CookiesPage() {
  return (
    <article>
      <h1>Cookies &amp; Browser Storage</h1>
      <p>DecayWatch uses browser storage to provide the features you request. Its application code does not include advertising or analytics trackers.</p>
      <h2>Essential login cookies</h2>
      <p>Supabase stores authentication cookies with project-specific names such as <code>sb-&lt;project-ref&gt;-auth-token</code> (possibly split into numbered chunks) and PKCE code-verifier cookies during sign-in or password recovery. These keep you signed in, refresh your session and securely complete authentication. The Supabase library used by this app sets a cookie lifetime of up to 400 days, renewed when cookies are rewritten; the actual authenticated session may expire sooner under the project’s security settings. Sign-out clears the session cookies. Code-verifier cookies are removed when the authentication flow completes, or otherwise expire under the cookie lifetime.</p>
      <h2>Local guest tracking</h2>
      <p>The local storage key <code>lol-decay-accounts</code> stores the game accounts, timers and notes you add in guest mode on this device. It has no automatic expiry. Remove the entries or clear this site’s storage to delete it. When you explicitly import guest entries into your signed-in account, those entries are sent to Supabase and the local copy is cleared after successful import.</p>
      <h2>Why there is no consent banner</h2>
      <p>This storage is used for login and tracking features you request, rather than advertising or behavioural measurement. A consent banner is therefore not used for these essential functions. If optional tracking is introduced, it must remain disabled until the relevant consent is obtained, with a way to refuse and withdraw it.</p>
      <h2>Your controls</h2>
      <p>You can block or clear cookies and storage in your browser. Blocking login cookies prevents account features; clearing local storage removes guest entries. Google sign-in takes you to Google, where its own storage and privacy settings apply. For information about personal data and contacting the operator, see the <Link href="/privacy">Privacy Policy</Link>.</p>
    </article>
  );
}
