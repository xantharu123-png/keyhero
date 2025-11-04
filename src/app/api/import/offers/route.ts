// @ts-nocheck
import { NextResponse } from "next/server";
import { runOfferImport } from "@/lib/importer";

export const revalidate = 0;

export async function GET() {
  try {
    const res = await runOfferImport();
    return NextResponse.json({ success: true, ...res }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? "import failed" }, { status: 500 });
  }
}
