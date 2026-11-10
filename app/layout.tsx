import type { Metadata } from "next";
import "./globals.css";
import { LegalFooter } from "./components/LegalFooter";

export const metadata: Metadata = {
  title: "DecayWatch",
  description: "Track ranked decay across all your League of Legends accounts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <LegalFooter />
      </body>
    </html>
  );
}
