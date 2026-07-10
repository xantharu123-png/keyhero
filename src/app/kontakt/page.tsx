import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kontakt - KeyHero" };

export default function Page() {
  return (
    <div className="container-xl px-4 py-10 text-sm text-textDim">
      <h1 className="mb-3 text-3xl font-bold text-textBright">Kontakt</h1>
      <p>
        Schreiben Sie uns eine Nachricht:{" "}
        <a href="mailto:kontakt@keyhero.ch" className="text-neonBlue">
          kontakt@keyhero.ch
        </a>
      </p>
      <p className="mt-2">Wir antworten in der Regel zeitnah.</p>
    </div>
  );
}
