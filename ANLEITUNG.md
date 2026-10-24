# KeyHero Affiliate-Setup — Schritt für Schritt

So kommt ihr von null auf Provisionen. Reihenfolge bewusst gewählt:
erst die 5-Minuten-Aufgabe, dann die Programme nach Aufwand/Nutzen.

---

## Schritt 0: Vercel absichern (5 Minuten)

Damit der tägliche Import (06:00 UTC) geschützt ist und weiterläuft.

1. Auf https://vercel.com einloggen → Projekt **keyhero** öffnen.
2. Oben auf **Settings** → links **Environment Variables**.
3. Zwei Variablen anlegen (Environment: **Production** + **Preview**):

| Key | Value |
|---|---|
| `IMPORT_SECRET` | Wert aus eurer `.env.local` kopieren |
| `CRON_SECRET` | Wert aus eurer `.env.local` kopieren |

⚠️ Die Werte niemals in diese Datei oder ins Repo schreiben — das
GitHub-Repo ist öffentlich.

4. Danach einmal neu deployen: Tab **Deployments** → beim neuesten
   erfolgreichen Deployment auf **⋯** → **Redeploy**.

✅ Fertig, wenn `https://eure-domain/api/import/offers` ohne Key `401 Unauthorized` zeigt.

---

## Schritt 1: Eneba (schnellster Start, 10 Minuten)

Direktes Programm, Preisvergleichsseiten sind ausdrücklich erlaubt,
2–5 % Provision, 30-Tage-Cookie, XML/CSV-Produktfeed.

1. Auf https://www.eneba.com einen Account erstellen bzw. einloggen.
2. https://www.eneba.com/become-affiliate öffnen und das Formular
   absenden (Website: eure KeyHero-Domain, Typ: Preisvergleich/Deals).
3. Ein Affiliate-Manager meldet sich per E-Mail (1–3 Werktage).
4. Nach Freischaltung im Affiliate-Panel den **Produktfeed (XML/CSV)**
   anfordern/aktivieren → ihr bekommt eine Feed-URL.
5. **Feed-URL an mich schicken** → ich trage sie als `ENEBA_FEED_URL`
   ein und teste den Import.

---

## Schritt 2: AWIN (Hauptachse, 20 Minuten + Wartezeit)

Größtes Netzwerk für eure Shops: Fanatical, Green Man Gaming,
Gamesplanet, MMOGA, Loaded/CDKeys u. a. (je 3–5 % Provision).

1. Registrieren: https://ui.awin.com/publisher-signup/de/awin
   - Als Typ **Publisher** wählen.
   - Website: eure KeyHero-Domain; Kategorie: Preisvergleich / Shopping.
   - Impressum/Datenschutz habt ihr bereits — gut für die Prüfung.
2. E-Mail bestätigen, Profil + **Bankdaten und Steuerinfos** ausfüllen
   (sonst keine Auszahlung).
3. AWIN prüft die Website manuell (einige Tage bis ~2 Wochen).
4. Nach Freischaltung: Menü **Advertiser → Programme suchen** und
   diesen Shops einzeln beitreten (Button „Programm beitreten"):
   - **Fanatical** (Merchant-ID 118821)
   - **Green Man Gaming**
   - **Gamesplanet**
   - **MMOGA**
   - **Loaded (CDKeys)**
5. Sobald ein Advertiser euch akzeptiert hat:
   **Toolbox → Create-a-Feed** → Advertiser auswählen → Format **CSV** →
   Feed-URL kopieren.
6. **Jede Feed-URL an mich schicken** — der Importer versteht das
   AWIN-Format bereits (`aw_deep_link` & Co. sind eingebaut).

---

## Schritt 3: Kinguin UP! (10 Minuten + Wartezeit)

2,5–5 % Provision, 30-Tage-Cookie, 50.000+ Produkte.

1. Registrieren: https://affiliate.kinguin.net → **Affiliates Signup**
   (alternativ: E-Mail an affiliate@kinguin.net).
2. Nach Freischaltung im Dashboard einen Reflink/Tracking-Link
   erzeugen und das **Tracking-Format** notieren (z. B. `?r=DEINE-ID`).
3. **Den Parameter an mich schicken** → ich setze ihn als
   `KINGUIN_AFFILIATE_QUERY`, danach verdienen alle Kinguin-Links mit.

⚠️ Nicht verwechseln: https://www.kinguin.net/integration ist die
**Seller-/Wholesale-API** (Keys selbst verkaufen) — für euch NICHT nötig.
Sie liefert zwar Live-Preise (`KINGUIN_API_KEY`), ist aber optional.

---

## Schritt 4: G2A Goldmine (optional, 5 Minuten, sofort aktiv)

Bis 5 %, aber nur 24-Stunden-Cookie, kein Produktdaten-Feed.

1. https://www.g2a.com/goldmine mit eurem G2A-Account aktivieren.
2. Reflink erzeugen → fertig. Wegen fehlendem Feed nur Ergänzung.

---

## Schritt 5: Rest läuft bei mir

Sobald die erste Feed-URL da ist, mache ich:

- Feed-URL in `.env.local` + Vercel eintragen
- Import testen (`/api/import/offers?source=feeds`)
- Prüfen, ob Preise + getrackte Links sauber in der DB landen
- Klick-Auswertung: `/api/stats/clicks?key=IMPORT_SECRET`

---

## Realistische Zeitleiste

| Wann | Was |
|---|---|
| Heute | Vercel (Schritt 0) + Eneba/G2A/Kinguin-Anmeldungen raus |
| Diese Woche | AWIN-Anmeldung; Eneba-Freischaltung → erster Live-Feed |
| 1–2 Wochen | AWIN geprüft → Advertiser beitreten → 4–5 weitere Feeds |
| Danach | SEO/Traffic aufbauen — 2–5 % Provision ≈ 1–3 € pro Sale |
