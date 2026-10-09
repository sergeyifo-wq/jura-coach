import { RichText } from "@/components/RichText";
import { CaseStudy } from "@/components/CaseStudy";
import type { Block } from "@/lib/course";

const labels: Record<string, string> = {
  definition: "Definition",
  merke: "Merke",
  beispiel: "Beispiel",
  ausnahme: "Ausnahme",
  fehler: "Typischer Fehler",
  neu: "Neuere Rechtslage",
  blick: "Auf einen Blick",
  quellen: "Quellen",
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  const nodes = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.type === "fall") {
      const next = blocks[index + 1];
      const solution = next?.type === "loesung" ? next : undefined;
      if (solution) index += 1;
      nodes.push(<CaseStudy key={`fall-${block.code}-${index}`} fall={block} solution={solution} />);
      continue;
    }
    if (block.type === "loesung") continue;
    nodes.push(<BlockView key={`${block.type}-${index}`} block={block} />);
  }
  return <div className="space-y-5">{nodes}</div>;
}

function BlockView({ block }: { block: Block }) {
  if (block.type === "p" && block.text) {
    return (
      <p className="text-[17px] leading-8 text-ink">
        <RichText text={block.text} />
      </p>
    );
  }
  if (block.type === "h3") {
    return (
      <h3 id={block.id} className="serif scroll-mt-24 pt-2 text-2xl text-ink">
        <span className="mr-2 text-gold">{block.id}</span>
        {block.title}
      </h3>
    );
  }
  if (block.type === "ul" || block.type === "ol") {
    const items = block.items ?? [];
    const List = block.type === "ol" ? "ol" : "ul";
    return (
      <List className={`space-y-2 pl-5 text-[17px] leading-7 ${block.type === "ol" ? "list-decimal" : "list-disc"}`}>
        {items.map((item) => (
          <li key={item}>
            <RichText text={item} />
          </li>
        ))}
      </List>
    );
  }
  if (block.type === "table") {
    const headers = (block.headers ?? []).filter(Boolean);
    return (
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          {headers.length > 0 && (
            <thead className="bg-ink text-gold-soft">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-3 py-2 font-medium tracking-wide">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {(block.rows ?? []).map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-line odd:bg-card even:bg-paper">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 align-top leading-6">
                    <RichText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (labels[block.type]) {
    return <Callout block={block} />;
  }
  return null;
}

function Callout({ block }: { block: Block }) {
  const tone =
    block.type === "merke" || block.type === "fehler"
      ? "border-burgundy bg-[#f8efe9]"
      : block.type === "blick"
        ? "border-ink bg-[#eef2f6]"
        : "border-gold bg-gold-soft/40";
  return (
    <aside className={`rounded-xl border-l-4 px-4 py-3 ${tone}`}>
      <p className="text-[11px] tracking-[0.18em] text-burgundy uppercase">{labels[block.type]}</p>
      {block.title && <p className="serif mt-1 text-xl text-ink">{block.title}</p>}
      {block.text && (
        <p className="mt-2 leading-7">
          <RichText text={block.text} />
        </p>
      )}
      {block.items && block.items.length > 0 && (
        <ul className="mt-2 space-y-2 leading-7">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-gold">✓</span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
