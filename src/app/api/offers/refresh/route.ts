import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Testversion
  return NextResponse.json({ ok: true });
}
