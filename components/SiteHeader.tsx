import Link from "next/link";

const links = [
  { href: "/lernen", label: "Lernen" },
  { href: "/faelle", label: "Fälle" },
  { href: "/fristen", label: "Fristen" },
  { href: "/glossar", label: "Glossar" },
  { href: "/suche", label: "Suche" },
  { href: "/klausur", label: "Klausur" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group">
          <span className="block text-[11px] tracking-[0.22em] text-gold uppercase">Österreich · Herbst 2026</span>
          <span className="serif text-2xl leading-none text-ink">Jura Coach</span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-ink-soft hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-full border border-line px-3 py-1 text-sm">Menü</summary>
          <nav className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-line bg-card p-2 shadow-lg">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-paper-deep">
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
