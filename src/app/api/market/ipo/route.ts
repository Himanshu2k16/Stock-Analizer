import { NextResponse } from "next/server";
import { getGoogleNews } from "@/modules/market/lib/news";

export async function GET() {
  const articles = await getGoogleNews("India IPO subscription upcoming IPO stock market", 10);
  return NextResponse.json({ articles, fetchedAt: new Date().toISOString() });
}
