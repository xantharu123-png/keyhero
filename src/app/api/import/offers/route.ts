import { NextRequest, NextResponse } from "next/server";
import { runAffiliateFeedImport } from "@/lib/affiliateFeeds";
import { runOfferImport } from "@/lib/importer";
import { runKinguinImport } from "@/lib/kinguin";
import { syncSupplierCatalog } from "@/lib/supplierCatalog";

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

  // Which source to import? Default: all configured sources
  const source = request.nextUrl.searchParams.get("source") || "all";

  const results: Record<string, any> = {
    success: true,
    version: "3.0-supplier-feeds",
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
