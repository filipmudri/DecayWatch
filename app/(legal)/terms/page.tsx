import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT, OPERATOR, TERMS_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms & Conditions | DecayWatch" };

export default function TermsPage() {
  return (
    <article>
      <h1>Terms &amp; Conditions</h1>
      <p>Version {TERMS_VERSION}. These terms govern your use of DecayWatch, a free personal project operated by {OPERATOR}, Slovakia. Contact: <a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a>.</p>
      <h2>1. The service</h2>
      <p>DecayWatch helps you manually track ranked decay timers for League of Legends accounts. You can use local tracking without registering; an optional account enables cross-device storage. There are no subscription fees or purchases.</p>
      <h2>2. Your account</h2>
      <p>When registering, you must actively accept these terms. Keep your credentials secure and provide an email address you control. Never submit your Riot account password. Only store account information you are entitled to use, and avoid personal or sensitive information in notes.</p>
      <h2>3. Acceptable use</h2>
      <p>Do not use the service unlawfully, access another person’s data, bypass security, or disrupt the service. Access may be restricted where reasonably necessary to address abuse or protect security. Contact the operator if you believe a restriction is mistaken.</p>
      <h2>4. Timers and availability</h2>
      <p>Timers depend on your entries and may become inaccurate as game rules change. Check the League of Legends client before relying on a timer. DecayWatch does not guarantee uninterrupted availability, data recovery, or prevention of LP or rank loss. To the extent permitted by applicable law, the operator is not responsible for losses caused by inaccurate entries, game changes or service outages. Nothing in these terms excludes liability or rights that cannot lawfully be excluded.</p>
      <h2>5. Privacy and browser storage</h2>
      <p>The <Link href="/privacy">Privacy Policy</Link> explains how account and tracking data are processed. The <Link href="/cookies">Cookies &amp; Storage notice</Link> explains essential login cookies and local tracking storage. Accepting these terms does not grant consent to advertising or marketing.</p>
      <h2>6. Ending use and deleting data</h2>
      <p>You may stop using the service at any time. Signed-in users can request account deletion using “Delete account” on the dashboard or by contacting the operator. Local guest data remains in your browser until you remove the entries or clear this site’s storage. The operator may discontinue this free service, with advance notice where reasonably practicable.</p>
      <h2>7. Copyright and Riot Games</h2>
      <p>Original DecayWatch code, design and text belong to their respective authors. Third-party software remains subject to its own licences. League of Legends, rank emblems, trademarks and other Riot assets belong to Riot Games. DecayWatch is an independent fan project and is not endorsed by Riot Games.</p>
      <h2>8. Changes and applicable law</h2>
      <p>Material changes to these terms will be presented for acceptance before continued use of account features. Slovak law applies, without removing any mandatory consumer protections available in your country of residence. Contact the operator with questions or complaints.</p>
    </article>
  );
}
