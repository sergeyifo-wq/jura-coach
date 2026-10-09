import Link from "next/link";
import { course, countFalls, getChapter } from "@/lib/course";

export const metadata = { title: "Lernen" };

export default function LearnIndexPage() {
  return (
    <div className="py-8">
      <p className="text-[11px] tracking-[0.2em] text-gold uppercase">Grundkurs</p>
      <h1 className="serif mt-2 text-4xl sm:text-5xl">Jedes Kapitel an einem Ort</h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-ink-soft">
        Lies den Abschnitt, sieh dir Bild und Erklärfilm an und löse die Fälle erst danach. Die Musterlösung bleibt
        zu, bis du sie selbst aufschlägst.
      </p>
      <div className="mt-8 space-y-10">
        {course.parts.map((part) => (
          <section key={part.id}>
            <h2 className="serif text-3xl">
              <span className="text-gold">{part.id}</span> {part.title}
            </h2>
            <p className="text-sm text-ink-soft">{part.kicker}</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {part.chapterSlugs.map((slug) => {
                const chapter = getChapter(slug);
                if (!chapter) return null;
                return (
                  <li key={slug}>
                    <Link href={`/lernen/${slug}`} className="flex items-baseline justify-between gap-4 py-3 hover:text-burgundy">
                      <span>
                        <span className="mr-3 text-gold">{chapter.id}</span>
                        <span className="serif text-xl">{chapter.title}</span>
                      </span>
                      <span className="shrink-0 text-sm text-ink-soft">{countFalls(chapter)} Fälle</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
