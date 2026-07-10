import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum - KeyHero" };

export default function Page() {
  return (
    <div className="container-xl px-4 py-10 text-sm text-textDim">
      <h1 className="mb-3 text-3xl font-bold text-textBright">Impressum</h1>
      <p>
        <b>Betreiber:</b> KeyHero
      </p>
      <p>
        <b>Adresse:</b> Schweiz
      </p>
      <p>
        <b>Kontakt:</b> siehe Kontaktseite
      </p>
      <p className="mt-4 max-w-2xl text-textDim/80">
        Keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität der Inhalte. KeyHero verkauft keine Keys, sondern
        vergleicht Angebote externer Händler.
      </p>
    </div>
  );
}
