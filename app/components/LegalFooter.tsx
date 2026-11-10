import Link from "next/link";
import { LEGAL_CONTACT, OPERATOR } from "@/lib/legal";

export function LegalFooter() {
  return (
    <footer className="legal-footer">
      <nav aria-label="Legal information" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        <Link href="/terms">Terms &amp; Conditions</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/cookies">Cookies &amp; Storage</Link>
        <a href={`mailto:${LEGAL_CONTACT}`}>Contact</a>
      </nav>
      <p className="mt-4">© {new Date().getFullYear()} {OPERATOR}. Original DecayWatch content. Third-party assets belong to their respective owners.</p>
      <p className="mt-2">DecayWatch is an independent fan project, not affiliated with or endorsed by Riot Games. League of Legends and related assets are owned by Riot Games.</p>
    </footer>
  );
}
