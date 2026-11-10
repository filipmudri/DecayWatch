import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy | DecayWatch" };

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p>{OPERATOR}, an individual based in Slovakia, is the controller of personal data processed through DecayWatch. For privacy questions or requests, email <a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a>.</p>
      <h2>Data we process and why</h2>
      <ul>
        <li><strong>Account data:</strong> your email, user identifier, authentication records and securely managed password credentials, or the identity information returned by Google when you choose Google sign-in (which can include name and profile image). These enable login, password recovery and account security. DecayWatch does not receive your Google password.</li>
        <li><strong>Tracking data:</strong> Riot IDs, regions, ranks, decay dates, notes and timestamps you enter. Guest entries stay in your browser; signed-in entries are stored in Supabase to provide synchronisation. Importing guest entries into your account transfers them to Supabase.</li>
        <li><strong>Terms acceptance:</strong> your user ID, the accepted terms version and a server-generated timestamp, to document your agreement.</li>
        <li><strong>Technical and contact data:</strong> hosting and authentication providers may process IP addresses, request information and security logs. If you contact the operator, your email and message are used to respond.</li>
      </ul>
      <h2>Legal bases</h2>
      <p>Account authentication and synchronisation are necessary to provide the service you request (GDPR Article 6(1)(b)). Security, abuse prevention, responding to enquiries and documenting agreement rely on legitimate interests in operating and protecting the service (Article 6(1)(f)), subject to your rights. Data may also be processed where required by law (Article 6(1)(c)). Registration is optional; without account data, cross-device features cannot be provided.</p>
      <h2>Service providers and international transfers</h2>
      <p>Supabase provides authentication and database storage. Vercel provides hosting. Google processes your sign-in when you choose that option, under its own privacy policy. These providers may use subprocessors and process data outside the EEA under applicable transfer safeguards, such as adequacy decisions or standard contractual clauses. Contact the operator for details about the regions, recipients and safeguards applying to your data.</p>
      <p>See <a href="https://supabase.com/privacy">Supabase privacy information</a>, <a href="https://vercel.com/legal/privacy-policy">Vercel privacy information</a> and <a href="https://policies.google.com/privacy">Google’s privacy policy</a>. DecayWatch does not sell personal data or include advertising or analytics trackers in its application code.</p>
      <h2>Retention and deletion</h2>
      <p>Account and tracking data are kept while your account is active, until you delete entries or request account deletion. Acceptance records are linked to your account and removed when that account is deleted. Provider backups and security logs may remain for their configured retention periods before expiring; contact the operator for the applicable periods. Correspondence is kept only for as long as needed to resolve your request and any related legal obligations. Local guest entries remain until you delete them or clear site storage.</p>
      <h2>Your rights</h2>
      <p>Depending on the applicable conditions, you can request access, correction, erasure, restriction or a portable copy of your data, and object to processing based on legitimate interests. Contact the address above; identity verification may be needed. Requests are generally answered within one month, with extensions only as permitted by law. You may complain to the <a href="https://dataprotection.gov.sk/">Office for Personal Data Protection of the Slovak Republic</a> or your local supervisory authority.</p>
      <h2>Storage, decisions and changes</h2>
      <p>See <Link href="/cookies">Cookies &amp; Storage</Link> for browser storage details. DecayWatch does not make automated decisions with legal or similarly significant effects. We will update this notice when processing changes. Reading this notice is not a request for blanket consent to process your data.</p>
    </article>
  );
}
