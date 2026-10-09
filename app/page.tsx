import Image from "next/image";
import Link from "next/link";
import { course, countFalls, partPhoto } from "@/lib/course";
import { StudyProgress } from "@/components/StudyMemory";

export default function HomePage() {
  const falls = course.chapters.reduce((sum, chapter) => sum + countFalls(chapter), 0);
  return (
    <div>
      <section className="grid items-center gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-16">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Privatrecht · Das Superbuch</p>
          <h1 className="serif mt-3 text-5xl leading-[0.95] text-ink sm:text-6xl">
            Der Stoff des ersten Semesters, zum Lernen und zur Klausur.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink-soft">
            Zwanzig Kapitel österreichisches Privatrecht, Rechtsstand Herbst 2026: Grundlagen, Personen, Sachen,
            Verträge, Schadenersatz, Unternehmen, Wettbewerb. Zu jedem Kapitel ein Bild, ein kurzer Erklärfilm und die
            Fälle mit Musterlösung. Danach eine Klausur mit Note.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/lernen" className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper">
              Kapitel aufschlagen
            </Link>
            <Link href="/klausur" className="rounded-full border border-burgundy px-5 py-2.5 text-sm text-burgundy">
              Probeklausur starten
            </Link>
          </div>
          <div className="mt-6">
            <StudyProgress total={course.chapters.length} />
          </div>
        </div>
        <figure>
          <Image
            src={partPhoto("A")}
            alt="Waage, geschlossenes Heft und Siegel auf einem Holztisch"
            width={1280}
            height={800}
            priority
            className="aspect-[16/10] w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-2 text-sm text-ink-soft">
            Recht ist erzwingbar. Moral, Sitte und Brauch sind es nicht.
          </figcaption>
        </figure>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ["20", "Kapitel zum Durcharbeiten"],
          [String(falls), "Fälle mit Musterlösung"],
          ["60 min", "Probeklausur, danach die Note"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-line bg-card px-4 py-4">
            <p className="serif text-3xl">{value}</p>
            <p className="text-sm text-ink-soft">{label}</p>
          </div>
        ))}
      </section>
      <section className="mt-12">
        <h2 className="serif text-3xl">Acht Teile, ein roter Faden</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {course.parts
            .filter((part) => part.id !== "Z")
            .map((part) => (
              <Link key={part.id} href={`/lernen/${part.chapterSlugs[0]}`} className="group overflow-hidden rounded-2xl border border-line bg-card">
                <Image src={partPhoto(part.id)} alt="" width={1280} height={800} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="text-[11px] tracking-[0.18em] text-gold uppercase">
                    Teil {part.id} · {part.kicker}
                  </p>
                  <h3 className="serif text-2xl group-hover:text-burgundy">{part.title}</h3>
                  <p className="text-sm text-ink-soft">{part.chapters.length} Kapitel</p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
