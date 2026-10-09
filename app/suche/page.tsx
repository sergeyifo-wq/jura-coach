import Link from "next/link";
import { Suspense } from "react";
import { searchCourse } from "@/lib/course";

export const metadata = { title: "Suche" };

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense fallback={<p className="py-16 text-ink-soft">Suche läuft …</p>}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const hits = query.length >= 2 ? searchCourse(query) : [];
  return (
    <div className="py-8">
      <p className="text-[11px] tracking-[0.2em] text-gold uppercase">Suche</p>
      <h1 className="serif mt-2 text-4xl">Im ganzen Grundkurs</h1>
      <form className="mt-4" action="/suche">
        <label className="text-sm text-ink-soft" htmlFor="q">
          Begriff, Norm oder Schlagwort
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="q"
            name="q"
            defaultValue={query}
            className="w-full rounded-xl border border-line bg-card px-3 py-2"
            placeholder="Zum Beispiel Gewährleistung, § 918, Vollmacht"
          />
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm text-paper">
            Suchen
          </button>
        </div>
      </form>
      {query.length > 0 && query.length < 2 && <p className="mt-6">Bitte mindestens zwei Zeichen eingeben.</p>}
      {query.length >= 2 && hits.length === 0 && <p className="mt-6">Nichts gefunden. Versuch es mit einem anderen Wort.</p>}
      {hits.length > 0 && (
        <ul className="mt-6 space-y-4">
          {hits.map((hit) => (
            <li key={hit.href + hit.snippet} className="rounded-xl border border-line bg-card p-4">
              <p className="text-[11px] tracking-[0.16em] text-gold uppercase">{hit.kicker}</p>
              <Link href={hit.href} className="serif text-2xl text-burgundy">
                {hit.title}
              </Link>
              <p className="mt-1 leading-7 text-ink-soft">{hit.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
