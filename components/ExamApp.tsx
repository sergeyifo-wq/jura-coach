"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { maxPoints, papers, questionsFor, type PaperId } from "@/lib/exam";
import { gradeFor, gradeScale } from "@/lib/grade";
import { getChapterById } from "@/lib/course";

type Attempt = {
  paper: PaperId;
  score: number;
  max: number;
  answers: Record<string, string>;
  finishedAt: number;
  durationSec: number;
};

type Draft = {
  paper: PaperId;
  startedAt: number;
  index: number;
  answers: Record<string, string>;
  flagged: string[];
};

const draftKey = "jura-coach-draft";
const attemptKey = "jura-coach-attempt";
const draftEvent = "jura-draft";
const attemptEvent = "jura-attempt";

function subscribe(name: string) {
  return (onStoreChange: () => void) => {
    window.addEventListener(name, onStoreChange);
    return () => window.removeEventListener(name, onStoreChange);
  };
}

function readKey(key: string) {
  return window.localStorage.getItem(key);
}

function writeKey(key: string, event: string, value: string | null) {
  if (value === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(event));
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function ExamApp() {
  const draftRaw = useSyncExternalStore(subscribe(draftEvent), () => readKey(draftKey), () => null);
  const attemptRaw = useSyncExternalStore(subscribe(attemptEvent), () => readKey(attemptKey), () => null);
  const draft = parseJson<Draft>(draftRaw);
  const attempt = parseJson<Attempt>(attemptRaw);
  const [now, setNow] = useState(0);
  const [confirm, setConfirm] = useState(false);

  const questions = useMemo(() => (draft ? questionsFor(draft.paper) : []), [draft]);
  const limit = papers[draft?.paper ?? "A"].minutes * 60;
  const elapsed = draft && now ? Math.max(0, Math.floor((now - draft.startedAt) / 1000)) : 0;
  const left = Math.max(0, limit - elapsed);

  useEffect(() => {
    const currentDraft = parseJson<Draft>(draftRaw);
    if (!currentDraft) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      const spent = Math.floor((current - currentDraft.startedAt) / 1000);
      if (spent >= papers[currentDraft.paper].minutes * 60) finish(currentDraft);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [draftRaw]);

  function start(nextPaper: PaperId) {
    const next: Draft = { paper: nextPaper, startedAt: Date.now(), index: 0, answers: {}, flagged: [] };
    writeKey(attemptKey, attemptEvent, null);
    writeKey(draftKey, draftEvent, JSON.stringify(next));
    setNow(Date.now());
    setConfirm(false);
  }

  function update(next: Draft) {
    writeKey(draftKey, draftEvent, JSON.stringify(next));
  }

  function finish(source: Draft) {
    const list = questionsFor(source.paper);
    const score = list.reduce(
      (sum, question) => sum + (source.answers[question.id] === question.answer ? question.points : 0),
      0,
    );
    const result: Attempt = {
      paper: source.paper,
      score,
      max: maxPoints(source.paper),
      answers: source.answers,
      finishedAt: Date.now(),
      durationSec: Math.min(papers[source.paper].minutes * 60, Math.floor((Date.now() - source.startedAt) / 1000)),
    };
    writeKey(draftKey, draftEvent, null);
    writeKey(attemptKey, attemptEvent, JSON.stringify(result));
    setConfirm(false);
  }

  if (attempt && !draft) {
    return (
      <Result
        attempt={attempt}
        onAgain={() => {
          writeKey(attemptKey, attemptEvent, null);
          setConfirm(false);
        }}
      />
    );
  }

  if (!draft) {
    return (
      <section className="py-8">
        <p className="text-[11px] tracking-[0.2em] text-gold uppercase">Klausur</p>
        <h1 className="serif mt-2 text-4xl sm:text-5xl">Zwei Arbeiten, eine Note am Ende</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
          Zwölf Fragen, je vier Punkte, sechzig Minuten. Es gibt keine Rückmeldung vor der Abgabe. Die Note folgt einer
          üblichen Universitätsskala und ist eine Übungsskala, keine Note des Prüfungsamts.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          {gradeScale.map((item) => (
            <div key={item.note} className="rounded-xl border border-line bg-card px-3 py-2">
              <p className="serif text-2xl">{item.note}</p>
              <p className="text-sm">{item.label}</p>
              <p className="text-xs text-ink-soft">{item.range}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {(Object.keys(papers) as PaperId[]).map((id) => (
            <article key={id} className="rounded-2xl border border-line bg-card p-5">
              <h2 className="serif text-3xl">{papers[id].title}</h2>
              <p className="mt-2 text-ink-soft">
                {papers[id].questionIds.length} Fragen · {papers[id].minutes} Minuten · {maxPoints(id)} Punkte
              </p>
              <button type="button" onClick={() => start(id)} className="mt-4 rounded-full bg-burgundy px-4 py-2 text-sm text-paper">
                {papers[id].title} starten
              </button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const question = questions[draft.index];
  const answered = Object.keys(draft.answers).length;
  const minutes = String(Math.floor(left / 60)).padStart(2, "0");
  const seconds = String(left % 60).padStart(2, "0");

  return (
    <section className="py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-gold uppercase">{papers[draft.paper].title}</p>
          <h1 className="serif text-3xl">
            Frage {draft.index + 1} von {questions.length}
          </h1>
        </div>
        <p className={`serif text-3xl ${left < 300 ? "text-burgundy" : "text-ink"}`} aria-live="polite">
          {minutes}:{seconds}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {questions.map((item, index) => {
          const state = draft.answers[item.id] ? "bg-ink text-paper" : "bg-card";
          const current = index === draft.index ? "ring-2 ring-gold" : "";
          const flag = draft.flagged.includes(item.id) ? "underline" : "";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => update({ ...draft, index })}
              className={`h-9 w-9 rounded-full border border-line text-sm ${state} ${current} ${flag}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <article className="mt-6 rounded-2xl border border-line bg-card p-5">
        <p className="text-sm text-ink-soft">{question.points} Punkte · Kapitel {question.chapterId}</p>
        <h2 className="serif mt-2 text-2xl leading-snug">{question.prompt}</h2>
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Antwortmöglichkeiten</legend>
          {question.choices.map((choice) => {
            const selected = draft.answers[question.id] === choice.id;
            return (
              <label
                key={choice.id}
                className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-3 ${
                  selected ? "border-ink bg-paper" : "border-line"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  className="mt-1"
                  checked={selected}
                  onChange={() => update({ ...draft, answers: { ...draft.answers, [question.id]: choice.id } })}
                />
                <span className="leading-7">{choice.text}</span>
              </label>
            );
          })}
        </fieldset>
      </article>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm"
          onClick={() => update({ ...draft, index: Math.max(0, draft.index - 1) })}
          disabled={draft.index === 0}
        >
          Zurück
        </button>
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm"
          onClick={() =>
            update({
              ...draft,
              flagged: draft.flagged.includes(question.id)
                ? draft.flagged.filter((id) => id !== question.id)
                : [...draft.flagged, question.id],
            })
          }
        >
          {draft.flagged.includes(question.id) ? "Markierung lösen" : "Später prüfen"}
        </button>
        {draft.index < questions.length - 1 ? (
          <button
            type="button"
            className="rounded-full bg-ink px-4 py-2 text-sm text-paper"
            onClick={() => update({ ...draft, index: draft.index + 1 })}
          >
            Weiter
          </button>
        ) : (
          <button type="button" className="rounded-full bg-burgundy px-4 py-2 text-sm text-paper" onClick={() => setConfirm(true)}>
            Abgeben
          </button>
        )}
        <span className="self-center text-sm text-ink-soft">
          {answered} von {questions.length} beantwortet
        </span>
      </div>
      {confirm && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-paper p-5">
            <h2 className="serif text-2xl">Klausur abgeben?</h2>
            <p className="mt-2 leading-7">
              {answered} von {questions.length} Fragen sind beantwortet. Danach siehst du Punkte, Note und die
              Begründung zu jeder Frage.
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-full bg-burgundy px-4 py-2 text-sm text-paper" onClick={() => finish(draft)}>
                Jetzt auswerten
              </button>
              <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => setConfirm(false)}>
                Weiter schreiben
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Result({ attempt, onAgain }: { attempt: Attempt; onAgain: () => void }) {
  const list = questionsFor(attempt.paper);
  const percent = Math.round((attempt.score / attempt.max) * 100);
  const grade = gradeFor(percent);
  const byChapter = new Map<string, { got: number; max: number }>();
  for (const question of list) {
    const bucket = byChapter.get(question.chapterId) ?? { got: 0, max: 0 };
    bucket.max += question.points;
    if (attempt.answers[question.id] === question.answer) bucket.got += question.points;
    byChapter.set(question.chapterId, bucket);
  }

  return (
    <section className="py-8">
      <p className="text-[11px] tracking-[0.2em] text-gold uppercase">Auswertung · {papers[attempt.paper].title}</p>
      <div className="mt-3 grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="rounded-2xl bg-ink p-5 text-paper">
          <p className="text-sm text-gold-soft">Note</p>
          <p className="serif text-6xl">{grade.note}</p>
          <p className="text-lg">{grade.label}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="serif text-3xl">
            {attempt.score} von {attempt.max} Punkten · {percent} %
          </p>
          <p className="mt-2 text-ink-soft">
            Bearbeitungszeit {Math.floor(attempt.durationSec / 60)} Minuten {attempt.durationSec % 60} Sekunden. Die
            Note ist eine Übungsskala: 1 ab 87 %, 2 ab 75 %, 3 ab 63 %, 4 ab 50 %, darunter 5.
          </p>
          <button type="button" onClick={onAgain} className="mt-4 rounded-full border border-line px-4 py-2 text-sm">
            Neue Klausur wählen
          </button>
        </div>
      </div>
      <h2 className="serif mt-10 text-3xl">Nach Kapiteln</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {[...byChapter.entries()].map(([chapterId, bucket]) => {
          const chapter = getChapterById(chapterId);
          const share = Math.round((bucket.got / bucket.max) * 100);
          return (
            <li key={chapterId} className="rounded-xl border border-line bg-card px-4 py-3">
              <p className="text-sm text-ink-soft">Kapitel {chapterId}</p>
              <p className="serif text-xl">{chapter?.title}</p>
              <p className="text-sm">
                {bucket.got}/{bucket.max} Punkte · {share} %
              </p>
              {chapter && (
                <Link href={`/lernen/${chapter.slug}`} className="text-sm text-burgundy underline decoration-gold">
                  Kapitel wiederholen
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <h2 className="serif mt-10 text-3xl">Jede Frage</h2>
      <ol className="mt-3 space-y-4">
        {list.map((question, index) => {
          const chosen = attempt.answers[question.id];
          const correct = chosen === question.answer;
          const chosenText = question.choices.find((choice) => choice.id === chosen)?.text;
          const answerText = question.choices.find((choice) => choice.id === question.answer)?.text;
          const chapter = getChapterById(question.chapterId);
          return (
            <li key={question.id} className="rounded-2xl border border-line bg-card p-4">
              <p className={`text-sm ${correct ? "text-[#2f5d50]" : "text-burgundy"}`}>
                Frage {index + 1} · {correct ? `richtig, ${question.points} Punkte` : "nicht richtig, 0 Punkte"}
              </p>
              <p className="serif mt-1 text-xl">{question.prompt}</p>
              <p className="mt-2 leading-7">Deine Antwort: {chosenText ?? "keine"}</p>
              {!correct && <p className="leading-7">Richtig: {answerText}</p>}
              <p className="mt-2 leading-7 text-ink-soft">{question.explanation}</p>
              {chapter && (
                <Link href={`/lernen/${chapter.slug}`} className="mt-2 inline-block text-sm text-burgundy underline decoration-gold">
                  Nachlesen in Kapitel {chapter.id}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
