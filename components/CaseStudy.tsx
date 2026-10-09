"use client";

import { useState, useSyncExternalStore } from "react";
import { RichText } from "@/components/RichText";
import type { Block } from "@/lib/course";

const storageKey = "jura-coach-cases";

type CaseRecord = { notes?: string; score?: number | null };

function subscribe(onStoreChange: () => void) {
  window.addEventListener("jura-cases", onStoreChange);
  return () => window.removeEventListener("jura-cases", onStoreChange);
}

function readRaw() {
  return window.localStorage.getItem(storageKey) ?? "{}";
}

function readAll(): Record<string, CaseRecord> {
  try {
    const value = JSON.parse(readRaw()) as unknown;
    return value && typeof value === "object" ? (value as Record<string, CaseRecord>) : {};
  } catch {
    return {};
  }
}

function persist(code: string, record: CaseRecord) {
  const data = readAll();
  data[code] = record;
  window.localStorage.setItem(storageKey, JSON.stringify(data));
  window.dispatchEvent(new Event("jura-cases"));
}

export function CaseStudy({ fall, solution }: { fall: Block; solution?: Block }) {
  const code = fall.code ?? "fall";
  const raw = useSyncExternalStore(subscribe, readRaw, () => "{}");
  const saved = (() => {
    try {
      const data = JSON.parse(raw) as Record<string, CaseRecord>;
      return data[code] ?? {};
    } catch {
      return {};
    }
  })();
  const notes = saved.notes ?? "";
  const score = typeof saved.score === "number" ? saved.score : null;
  const [open, setOpen] = useState(false);

  return (
    <article id={`fall-${code}`} className="scroll-mt-24 rounded-2xl border border-line bg-card p-4 sm:p-5">
      <p className="text-[11px] tracking-[0.18em] text-gold uppercase">Fall {code}</p>
      {fall.title && <h3 className="serif mt-1 text-2xl">{fall.title}</h3>}
      {fall.quelle && <p className="mt-1 text-sm text-ink-soft">Quelle: {fall.quelle}</p>}
      {fall.text && (
        <p className="mt-3 text-[17px] leading-8">
          <RichText text={fall.text} />
        </p>
      )}
      <label className="mt-4 block text-sm text-ink-soft" htmlFor={`notes-${code}`}>
        Eigene Lösung, bevor du die Musterlösung aufschlägst
      </label>
      <textarea
        id={`notes-${code}`}
        value={notes}
        onChange={(event) => persist(code, { notes: event.target.value, score })}
        rows={4}
        className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-base leading-7"
        placeholder="Anspruchsgrundlage, Subsumtion, Ergebnis …"
      />
      <button
        type="button"
        className="mt-3 rounded-full bg-ink px-4 py-2 text-sm text-paper"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Musterlösung verbergen" : "Musterlösung zeigen"}
      </button>
      {open && solution && (
        <div className="mt-4 rounded-xl bg-[#eef4ef] p-4">
          <p className="text-[11px] tracking-[0.18em] text-[#2f5d50] uppercase">Lösung {solution.code}</p>
          {solution.text && (
            <p className="mt-2 leading-7">
              <RichText text={solution.text} />
            </p>
          )}
          <p className="mt-4 text-sm text-ink-soft">Wie viel davon hattest du selbst?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => persist(code, { notes, score: value })}
                className={`rounded-full border px-3 py-1 text-sm ${
                  score === value ? "border-ink bg-ink text-paper" : "border-line bg-paper"
                }`}
              >
                {value}/4
              </button>
            ))}
          </div>
        </div>
      )}
      {open && !solution && <p className="mt-3 text-sm text-ink-soft">Zu diesem Fall liegt keine Musterlösung im Kapitel.</p>}
    </article>
  );
}
