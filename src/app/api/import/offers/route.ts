import { NextRequest, NextResponse } from "next/server";
import { runAffiliateFeedImport } from "@/lib/affiliateFeeds";
import { runOfferImport } from "@/lib/importer";
import { runKinguinImport } from "@/lib/kinguin";
import { syncSupplierCatalog } from "@/lib/supplierCatalog";

export const revalidate = 0;
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Schutz: ?key=IMPORT_SECRET ODER Vercel-Cron (Authorization: Bearer CRON_SECRET).
  // Vercel sendet den Bearer-Header automatisch, wenn CRON_SECRET in den
  // Vercel-Environment-Variables gesetzt ist.
  const keyParam = request.nextUrl.searchParams.get("key");
  const importSecret = process.env.IMPORT_SECRET;
  const cronSecret = process.env.CRON_SECRET;
  const bearer = request.headers.get("authorization");

  const keyOk = !!importSecret && keyParam === importSecret;
  const cronOk = !!cronSecret && bearer === `Bearer ${cronSecret}`;

  if ((importSecret || cronSecret) && !keyOk && !cronOk) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Which source to import? Default: all configured sources
  const source = request.nextUrl.searchParams.get("source") || "all";

  const results: Record<string, any> = {
    success: true,
    version: "3.1-affiliate-ready",
    timestamp: new Date().toISOString(),
  };

  if (source === "all" || source === "suppliers" || source === "catalog") {
    try {
      results.suppliers = await syncSupplierCatalog();
    } catch (e: any) {
      console.error("Supplier catalog sync failed:", e);
      results.suppliers = { ok: false, error: e?.message };
    }
  }

  // Kinguin Import (direkte API; Provision nur mit KINGUIN_AFFILIATE_QUERY!)
  if (source === "all" || source === "kinguin") {
    try {
      const kinguinResult = await runKinguinImport(5);
      results.kinguin = kinguinResult;
    } catch (e: any) {
      console.error("Kinguin import failed:", e);
      results.kinguin = { ok: false, error: e?.message };
    }
  }

  // CheapShark Import (secondary source – free deals aggregator, keine Provision)
  if (source === "all" || source === "cheapshark") {
    try {
      const cheapsharkResult = await runOfferImport();
      results.cheapshark = cheapsharkResult;
    } catch (e: any) {
      console.error("CheapShark import failed:", e);
      results.cheapshark = { ok: false, error: e?.message };
    }
  }

  if (source === "all" || source === "affiliate" || source === "feeds") {
    try {
      const affiliateResult = await runAffiliateFeedImport();
      results.affiliate = affiliateResult;
    } catch (e: any) {
      console.error("Affiliate feed import failed:", e);
      results.affiliate = { ok: false, error: e?.message };
    }
  }

  const hasErrors =
    (results.suppliers && !results.suppliers.ok) ||
    (results.kinguin && !results.kinguin.ok) ||
    (results.cheapshark && !results.cheapshark.ok) ||
    (results.affiliate && !results.affiliate.ok);

  return NextResponse.json(results, { status: hasErrors ? 207 : 200 });
}
