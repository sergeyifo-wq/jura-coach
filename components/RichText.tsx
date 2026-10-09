import Link from "next/link";
import { sectionHref } from "@/lib/course";

export function RichText({ text }: { text: string }) {
  const parts = text.split(/(Abschnitt\s+\d+\.\d+)/g);
  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^Abschnitt\s+(\d+\.\d+)$/);
        if (!match) return <span key={index}>{part}</span>;
        const href = sectionHref.get(match[1]);
        if (!href) return <span key={index}>{part}</span>;
        return (
          <Link key={index} href={href} className="text-burgundy underline decoration-gold/70">
            {part}
          </Link>
        );
      })}
    </>
  );
}
