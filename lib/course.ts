import raw from "@/data/course.json";

export type Block = {
  type: string;
  text?: string;
  title?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  code?: string;
  quelle?: string;
  id?: string;
};

export type Section = {
  id: string;
  title: string;
  blocks: Block[];
};

export type Chapter = {
  id: string;
  slug: string;
  title: string;
  intro: Block[];
  sections: Section[];
  quellen?: string;
};

export type Part = {
  id: string;
  title: string;
  kicker: string;
  chapters: string[];
  chapterSlugs: string[];
};

export type Course = {
  title: string;
  stand: string;
  jurisdiction: string;
  parts: Part[];
  chapters: Chapter[];
};

export const course = raw as unknown as Course;

const bySlug = new Map(course.chapters.map((chapter) => [chapter.slug, chapter]));
const byId = new Map(course.chapters.map((chapter) => [chapter.id, chapter]));

export const sectionHref = new Map<string, string>();
for (const chapter of course.chapters) {
  for (const section of chapter.sections) {
    sectionHref.set(section.id, `/lernen/${chapter.slug}#abschnitt-${section.id}`);
  }
}

export function getChapter(slug: string) {
  return bySlug.get(slug);
}

export function getChapterById(id: string) {
  return byId.get(id);
}

export function getPart(chapterId: string) {
  return course.parts.find((part) => part.chapters.includes(chapterId));
}

export function chapterList() {
  return course.chapters;
}

export function neighbors(slug: string) {
  const index = course.chapters.findIndex((chapter) => chapter.slug === slug);
  return {
    prev: index > 0 ? course.chapters[index - 1] : undefined,
    next: index >= 0 && index < course.chapters.length - 1 ? course.chapters[index + 1] : undefined,
  };
}

export function partPhoto(partId: string) {
  const files: Record<string, string> = {
    A: "/media/photos/teil-a-grundlagen.jpg",
    B: "/media/photos/teil-b-personen.jpg",
    C: "/media/photos/teil-c-sachen.jpg",
    D: "/media/photos/teil-d-vertraege.jpg",
    E: "/media/photos/teil-e-haftung.jpg",
    F: "/media/photos/teil-f-grenzueberschreitend.jpg",
    G: "/media/photos/teil-g-unternehmen.jpg",
    H: "/media/photos/teil-h-markt.jpg",
    Z: "/media/photos/teil-a-grundlagen.jpg",
  };
  return files[partId] ?? files.A;
}

export function partCaption(partId: string) {
  const captions: Record<string, string> = {
    A: "Waage, Heft und Siegel: Recht ordnet das Zusammenleben und ist notfalls erzwingbar.",
    B: "Drei Stühle, ein Schlüssel: Rechtsfähigkeit, Geschäftsfähigkeit und Vertretung sind nicht dasselbe.",
    C: "Schlüssel und Haus: Besitz, Eigentum und Grundbuch entscheiden, wer die Sache hat und wem sie gehört.",
    D: "Zwei Tassen, ein Blatt: Ein Vertrag entsteht durch Angebot und deckungsgleiche Annahme.",
    E: "Scherbe und Glocke: Schadenersatz und Bereicherung greifen auch ohne Vertrag.",
    F: "Globus und Kiste: Bei Auslandsbezug stellt sich zuerst die Frage, welches Recht gilt.",
    G: "Laden und Siegel: Wer unternehmerisch auftritt, haftet nach eigenen Regeln.",
    H: "Karte, Siegel, Skizze: Wertpapiere, Wettbewerb und Immaterialgüter schützen den Markt und die Idee.",
    Z: "Das Nachschlagewerk: Fristen, Abkürzungen und die gesammelten Begriffe.",
  };
  return captions[partId] ?? captions.A;
}

export type CaseRef = {
  code: string;
  title: string;
  chapterId: string;
  chapterTitle: string;
  slug: string;
  sectionId: string;
};

export function allCases(): CaseRef[] {
  const cases: CaseRef[] = [];
  for (const chapter of course.chapters) {
    if (chapter.id === "E") continue;
    for (const section of chapter.sections) {
      for (const block of section.blocks) {
        if (block.type !== "fall") continue;
        cases.push({
          code: block.code ?? "",
          title: block.title || block.text?.slice(0, 80) || "Fall",
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          slug: chapter.slug,
          sectionId: section.id,
        });
      }
    }
  }
  return cases;
}

export function searchCourse(query: string) {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const hits: { href: string; title: string; kicker: string; snippet: string }[] = [];
  for (const chapter of course.chapters) {
    const blobs: { href: string; kicker: string; text: string }[] = [];
    blobs.push({
      href: `/lernen/${chapter.slug}`,
      kicker: `Kapitel ${chapter.id}`,
      text: `${chapter.title} ${chapter.intro.map((block) => block.text ?? "").join(" ")}`,
    });
    for (const section of chapter.sections) {
      const text = section.blocks
        .map((block) =>
          [block.title, block.text, ...(block.items ?? []), ...(block.rows ?? []).flat()].filter(Boolean).join(" "),
        )
        .join(" ");
      blobs.push({
        href: `/lernen/${chapter.slug}#abschnitt-${section.id}`,
        kicker: `Abschnitt ${section.id}`,
        text: `${section.title} ${text}`,
      });
    }
    for (const blob of blobs) {
      const index = blob.text.toLowerCase().indexOf(needle);
      if (index < 0) continue;
      const start = Math.max(0, index - 70);
      const snippet = `${start > 0 ? "…" : ""}${blob.text.slice(start, index + needle.length + 110).trim()}${
        index + needle.length + 110 < blob.text.length ? "…" : ""
      }`;
      hits.push({ href: blob.href, title: chapter.title, kicker: blob.kicker, snippet });
      if (hits.length >= 24) return hits;
    }
  }
  return hits;
}

export function countFalls(chapter: Chapter) {
  return chapter.sections.reduce(
    (sum, section) => sum + section.blocks.filter((block) => block.type === "fall").length,
    0,
  );
}
