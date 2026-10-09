"use client";

import { useMemo, useState } from "react";
import { RichText } from "@/components/RichText";

export function GlossaryBrowser({ entries }: { entries: { title: string; text: string }[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((entry) => `${entry.title} ${entry.text}`.toLowerCase().includes(needle));
  }, [entries, query]);

  return (
    <div>
      <label className="block text-sm text-ink-soft" htmlFor="glossar-suche">
        Begriff suchen
      </label>
      <input
        id="glossar-suche"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2"
        placeholder="Zum Beispiel Angebot, Vollmacht, Marke"
      />
      <p className="mt-2 text-sm text-ink-soft">{shown.length} Begriffe</p>
      <div className="mt-4 space-y-4">
        {shown.map((entry) => (
          <article key={entry.title} className="border-t border-line pt-3">
            <h3 className="serif text-xl">{entry.title}</h3>
            <p className="mt-1 leading-7">
              <RichText text={entry.text} />
            </p>
          </article>
        ))}
        {shown.length === 0 && <p>Kein Begriff passt auf diese Suche.</p>}
      </div>
    </div>
  );
}
