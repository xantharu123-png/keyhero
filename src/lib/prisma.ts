import { PrismaClient } from "@prisma/client";

/**
 * Der Supabase-Pooler im Session-Modus (Port 5432) erlaubt nur 15 Clients.
 * Auf Vercel hält jede Funktions-Instanz eigene Verbindungen, bis der Pool voll
 * ist (EMAXCONNSESSION) und die Seite ausfällt. Zur Laufzeit daher auf den
 * Transaction-Modus (Port 6543) umschreiben – gleicher Host, gleiche
 * Zugangsdaten. Die Prisma-CLI (db push) liest DATABASE_URL direkt und
 * bleibt auf 5432.
 */
export function getRuntimeDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;

  try {
    const url = new URL(raw);
    if (!url.hostname.endsWith(".pooler.supabase.com")) return raw;

    url.port = "6543";
    url.searchParams.set("pgbouncer", "true");
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    return url.toString();
  } catch {
    return raw; // Im Zweifel unverändert verbinden
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getRuntimeDatabaseUrl(process.env.DATABASE_URL),
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
