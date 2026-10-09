"use client";

import { useState } from "react";

type Step = { label: string; text: string };

const diagrams: Record<string, { title: string; steps: Step[] }> = {
  "1": {
    title: "Stufenbau, von oben nach unten",
    steps: [
      { label: "Baugesetze", text: "Die oberste Stufe. Jede niedrigere Norm muss ihr entsprechen." },
      { label: "Verfassungsgesetze", text: "Sie stehen über den einfachen Gesetzen." },
      { label: "Einfache Gesetze", text: "Zum Beispiel ABGB, UGB, KSchG. Eine Verordnung kann sie nicht verdrängen." },
      { label: "Verordnungen", text: "Nur im Rahmen des Gesetzes. Die jüngere Verordnung schlägt das ältere Gesetz nicht." },
      { label: "Bescheide, Urteile, Verträge", text: "Sie gelten für den Einzelfall und müssen sich an die höheren Stufen halten." },
    ],
  },
  "3": {
    title: "Altersstufen der Geschäftsfähigkeit",
    steps: [
      {
        label: "unter 7",
        text: "Geschäfte sind grundsätzlich unwirksam. Ein Taschengeldgeschäft nach § 170 Abs 3 wird in jedem Alter erst mit der Erfüllung wirksam.",
      },
      {
        label: "7–14",
        text: "Lediglich vorteilhafte Geschäfte wirken. Alles andere ist schwebend unwirksam und braucht Zustimmung der gesetzlichen Vertretung.",
      },
      {
        label: "14–18",
        text: "Zusätzlich kann über eigenes Einkommen verfügt werden, und bestimmte Dienstverträge sind möglich.",
      },
      {
        label: "ab 18",
        text: "Volle Geschäftsfähigkeit. Die Entscheidungsfähigkeit wird vermutet. Deliktsfähig ist man schon ab 14.",
      },
    ],
  },
  "4": {
    title: "Außenverhältnis und Innenverhältnis",
    steps: [
      {
        label: "Vollmachtgeber",
        text: "Er erteilt die Vollmacht. Sie bestimmt, was der Vertreter im Außenverhältnis kann.",
      },
      {
        label: "Vertreter",
        text: "Er gibt eine eigene Willenserklärung im Namen des anderen ab. Der Auftrag sagt nur, was er intern darf.",
      },
      {
        label: "Dritter",
        text: "Ihm gegenüber muss die Vertretung offengelegt sein. Was der Vertreter kann, bindet den Vertretenen, auch wenn intern eine Weisung brach.",
      },
    ],
  },
  "8": {
    title: "Vier Leistungsstörungen",
    steps: [
      { label: "Unmöglichkeit", text: "Die Leistung bleibt ganz aus. War der Schuldner verantwortlich, kommt ein Austausch- oder Differenzanspruch in Betracht." },
      { label: "Verzug", text: "Die Leistung kommt zu spät. Rücktritt nach Nachfrist (§ 918), beim Fixgeschäft ohne Nachfrist (§ 919)." },
      { label: "Gewährleistung", text: "Die Leistung ist schlecht. Verschuldensunabhängig: zuerst Verbesserung oder Austausch, dann Minderung oder Wandlung." },
      { label: "Positive Vertragsverletzung", text: "Eine Nebenpflicht wird verletzt. Der Folgeschaden läuft über den Schadenersatz." },
    ],
  },
};

export function Diagram({ chapterId }: { chapterId: string }) {
  const diagram = diagrams[chapterId];
  const [active, setActive] = useState(0);
  if (!diagram) return null;
  const step = diagram.steps[active];
  return (
    <section className="rounded-2xl border border-line bg-card p-4 sm:p-5">
      <p className="text-[11px] tracking-[0.18em] text-gold uppercase">Schema zum Aufklappen</p>
      <h2 className="serif mt-1 text-2xl">{diagram.title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {diagram.steps.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setActive(index)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              index === active ? "border-ink bg-ink text-paper" : "border-line bg-paper"
            }`}
          >
            {index + 1}. {item.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[17px] leading-8">{step.text}</p>
    </section>
  );
}
