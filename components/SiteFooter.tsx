export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-soft sm:px-6">
        <p>
          Rechtsstand Herbst 2026. Paragraphen ohne Gesetzesangabe sind solche des ABGB. Der Kurs ersetzt weder den
          Gesetzestext noch die Lehrveranstaltung.
        </p>
        <p>
          Für Prüfung und Praxis gilt der aktuelle Text im{" "}
          <a className="underline decoration-gold" href="https://www.ris.bka.gv.at" target="_blank" rel="noreferrer">
            Rechtsinformationssystem des Bundes
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
