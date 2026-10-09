import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20">
      <p className="text-[11px] tracking-[0.2em] text-gold uppercase">404</p>
      <h1 className="serif mt-2 text-4xl">Diese Seite gibt es im Grundkurs nicht.</h1>
      <Link href="/lernen" className="mt-4 inline-block text-burgundy underline decoration-gold">
        Zurück zu den Kapiteln
      </Link>
    </div>
  );
}
