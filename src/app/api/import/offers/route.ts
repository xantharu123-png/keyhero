import { NextRequest, NextResponse } from "next/server";
import { runOfferImport } from "@/lib/importer";
import { runKinguinImport } from "@/lib/kinguin";

export const revalidate = 0;
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Optional: protect with a secret key
  const authHeader = request.nextUrl.searchParams.get("key");
  const expectedKey = process.env.IMPORT_SECRET;

  if (expectedKey && authHeader !== expectedKey) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Which source to import? Default: both
  const source = request.nextUrl.searchParams.get("source") || "all";

  const results: Record<string, any> = {
    success: true,
    version: "2.0-kinguin",
    timestamp: new Date().toISOString(),
  };

  // Kinguin Import (primary source – real affiliate money)
  if (source === "all" || source === "kinguin") {
    try {
      const kinguinResult = await runKinguinImport(5);
      results.kinguin = kinguinResult;
    } catch (e: any) {
      console.error("Kinguin import failed:", e);
      results.kinguin = { ok: false, error: e?.message };
    }
  }

  // CheapShark Import (secondary source – free deals aggregator)
  if (source === "all" || source === "cheapshark") {
    try {
      const cheapsharkResult = await runOfferImport();
      results.cheapshark = cheapsharkResult;
    } catch (e: any) {
      console.error("CheapShark import failed:", e);
      results.cheapshark = { ok: false, error: e?.message };
    }
  }

  const hasErrors =
    (results.kinguin && !results.kinguin.ok) ||
    (results.cheapshark && !results.cheapshark.ok);

  return NextResponse.json(results, { status: hasErrors ? 207 : 200 });
}
