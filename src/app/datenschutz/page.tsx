import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutz - KeyHero" };

export default function Page() {
  return (
    <div className="container-xl px-4 py-10 text-sm text-textDim">
      <h1 className="mb-3 text-3xl font-bold text-textBright">Datenschutz</h1>
      <p className="max-w-2xl">
        Wir verarbeiten so wenig personenbezogene Daten wie möglich. Zugriffsdaten wie Server-Logs werden zur
        Sicherstellung des Betriebs verarbeitet.
      </p>
      <p className="mt-2 max-w-2xl">
        Analytics: Wenn aktiviert, nutzen wir Plausible Analytics ohne Cookies und mit Fokus auf datensparsame
        Auswertung.
      </p>
      <p className="mt-2">Bei Fragen kontaktieren Sie uns über die Kontaktseite.</p>
    </div>
  );
}
