"use client";

import { useSyncExternalStore } from "react";

const key = "jura-coach-read";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("jura-read", onStoreChange);
  return () => window.removeEventListener("jura-read", onStoreChange);
}

function readRaw() {
  return window.localStorage.getItem(key) ?? "[]";
}

function write(ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event("jura-read"));
}

function parse(raw: string) {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function ReadToggle({ chapterId, title }: { chapterId: string; title: string }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const on = parse(raw).includes(chapterId);

  function toggle() {
    const next = new Set(parse(readRaw()));
    if (next.has(chapterId)) next.delete(chapterId);
    else next.add(chapterId);
    write([...next]);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full border px-4 py-2 text-sm ${on ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
    >
      {on ? `${title} ist als gelesen markiert` : "Kapitel als gelesen markieren"}
    </button>
  );
}

export function StudyProgress({ total }: { total: number }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const count = parse(raw).length;
  return (
    <p className="text-sm text-ink-soft">
      {count} von {total} Kapiteln als gelesen markiert.
    </p>
  );
}
