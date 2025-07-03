// pages/api/export.ts or app/api/export/route.ts (depending on your Next.js version)

import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pdfExports } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 50);

    const exports = await db
      .select()
      .from(pdfExports)
      .orderBy(desc(pdfExports.createdAt))
      .offset(offset)
      .limit(limit);

    const hasMore = exports.length === limit;

    return NextResponse.json({ exports, hasMore });
  } catch (error) {
    console.error("Error fetching exports:", error);
    return NextResponse.json({ error: "Failed to fetch exports" }, { status: 500 });
  }
}