import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Blocks } from "@/components/Blocks";
import { Diagram } from "@/components/Diagram";
import { GlossaryBrowser } from "@/components/GlossaryBrowser";
import { ReadToggle } from "@/components/StudyMemory";
import { course, getChapter, getPart, neighbors, partCaption, partPhoto } from "@/lib/course";

export function generateStaticParams() {
  return course.chapters.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  return { title: chapter ? chapter.title : "Kapitel" };
}

export default function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="py-16 text-ink-soft">Kapitel wird geladen …</p>}>
      <ChapterContent params={params} />
    </Suspense>
  );
}

async function ChapterContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();
  const part = getPart(chapter.id);
  const photo = partPhoto(part?.id ?? "A");
  const { prev, next } = neighbors(slug);
  const numbered = /^\d+$/.test(chapter.id);
  const glossary = chapter.id === "C" ? chapter.sections[0]?.blocks.filter((block) => block.type === "definition") : [];

  return (
    <article className="py-8">
      <p className="text-[11px] tracking-[0.18em] text-gold uppercase">
        {part ? `Teil ${part.id} · ${part.title}` : "Grundkurs"} · Kapitel {chapter.id}
      </p>
      <h1 className="serif mt-2 max-w-3xl text-4xl leading-tight sm:text-5xl">{chapter.title}</h1>
      <div className="mt-4">
        <ReadToggle chapterId={chapter.id} title={chapter.title} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <figure>
          <Image
            src={photo}
            alt={partCaption(part?.id ?? "A")}
            width={1280}
            height={800}
            className="aspect-[16/10] w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-2 text-sm leading-6 text-ink-soft">{partCaption(part?.id ?? "A")}</figcaption>
        </figure>
        {numbered ? (
          <figure className="overflow-hidden rounded-2xl bg-ink">
            <video
              controls
              preload="metadata"
              poster={`/media/posters/kapitel-${chapter.id}.jpg`}
              className="aspect-video w-full"
            >
              <source src={`/media/videos/kapitel-${chapter.id}.mp4`} type="video/mp4" />
            </video>
            <figcaption className="px-4 py-3 text-sm text-gold-soft">
              Erklärfilm ohne Ton. Die Sätze stehen im Bild, der Abschnitt darunter führt sie aus.
            </figcaption>
          </figure>
        ) : (
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="serif text-2xl">Nachschlagen</p>
            <p className="mt-2 leading-7 text-ink-soft">
              Dieser Anhang bündelt Fristen, Abkürzungen oder Begriffe aus den zwanzig Kapiteln. Die Erklärfilme liegen
              bei den Kapiteln selbst.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Diagram chapterId={chapter.id} />
      </div>

      {chapter.intro.length > 0 && (
        <div className="mt-8 max-w-3xl">
          <Blocks blocks={chapter.intro} />
        </div>
      )}

      {chapter.id !== "C" && chapter.sections.length > 1 && (
        <nav className="sticky top-0 z-10 -mx-4 mt-8 overflow-x-auto border-y border-line bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
          <ul className="flex min-w-max gap-2">
            {chapter.sections.map((section) => (
              <li key={section.id}>
                <a href={`#abschnitt-${section.id}`} className="inline-block rounded-full border border-line px-3 py-1 text-sm">
                  {section.id} {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {chapter.id === "C" ? (
        <div className="mt-8">
          <GlossaryBrowser
            entries={(glossary ?? []).map((block) => ({ title: block.title ?? "Begriff", text: block.text ?? "" }))}
          />
        </div>
      ) : (
        <div className="mt-8 max-w-3xl space-y-12">
          {chapter.sections.map((section) => (
            <section key={section.id} id={`abschnitt-${section.id}`} className="scroll-mt-24">
              <h2 className="serif text-3xl">
                <span className="mr-2 text-gold">{section.id}</span>
                {section.title}
              </h2>
              <div className="mt-4">
                <Blocks blocks={section.blocks} />
              </div>
            </section>
          ))}
        </div>
      )}

      {chapter.quellen && <p className="mt-10 max-w-3xl text-sm leading-6 text-ink-soft">Quellen: {chapter.quellen}</p>}

      <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-line pt-4 text-sm">
        {prev ? (
          <Link href={`/lernen/${prev.slug}`} className="text-burgundy underline decoration-gold">
            ← {prev.id} {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/lernen/${next.slug}`} className="text-burgundy underline decoration-gold">
            {next.id} {next.title} →
          </Link>
        )}
      </div>
    </article>
  );
}
