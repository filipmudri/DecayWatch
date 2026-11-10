import Link from "next/link";
import { TERMS_VERSION } from "@/lib/legal";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="legal-page">
      <Link href="/" className="text-sm underline">← Back to DecayWatch</Link>
      <p className="mt-8 text-sm text-[var(--text-secondary)]">Last updated: {TERMS_VERSION}</p>
      {children}
    </main>
  );
}
