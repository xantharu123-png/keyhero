import { NextRequest, NextResponse } from "next/server";
import { runOfferImport } from "@/lib/importer";

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

  try {
    const res = await runOfferImport();
    return NextResponse.json(
      { success: true, timestamp: new Date().toISOString(), ...res },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Import failed:", e);
    return NextResponse.json(
      { success: false, error: e?.message ?? "import failed", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
