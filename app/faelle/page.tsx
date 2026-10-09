import Link from "next/link";
import { allCases } from "@/lib/course";

export const metadata = { title: "Fälle" };

export default function CasesPage() {
  const cases = allCases();
  const groups = new Map<string, typeof cases>();
  for (const item of cases) {
    const list = groups.get(item.chapterId) ?? [];
    list.push(item);
    groups.set(item.chapterId, list);
  }
  return (
    <div className="py-8">
      <p className="text-[11px] tracking-[0.2em] text-gold uppercase">Fälle</p>
      <h1 className="serif mt-2 text-4xl sm:text-5xl">{cases.length} Sachverhalte mit Musterlösung</h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-ink-soft">
        Löse den Fall im Gutachtenstil und schlag die Lösung erst danach auf. Die Selbstbewertung von 0 bis 4 bleibt in
        diesem Browser.
      </p>
      <div className="mt-8 space-y-8">
        {[...groups.entries()].map(([chapterId, items]) => (
          <section key={chapterId}>
            <h2 className="serif text-2xl">
              Kapitel {chapterId} · {items[0]?.chapterTitle}
            </h2>
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {items.map((item) => (
                <li key={`${item.code}-${item.title}`}>
                  <Link
                    href={`/lernen/${item.slug}#fall-${item.code}`}
                    className="flex gap-4 py-3 hover:text-burgundy"
                  >
                    <span className="w-14 shrink-0 text-gold">{item.code}</span>
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
