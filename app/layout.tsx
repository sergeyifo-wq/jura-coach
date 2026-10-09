import type { Metadata } from "next";
import { EB_Garamond, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
});

const source = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
});

export const metadata: Metadata = {
  title: {
    default: "Jura Coach · Privatrecht",
    template: "%s · Jura Coach",
  },
  description:
    "Interaktiver Grundkurs zum österreichischen Privatrecht nach dem Superbuch: Kapitel lernen, Fälle lösen, Klausur mit Auswertung.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${garamond.variable} ${source.variable}`}>
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
