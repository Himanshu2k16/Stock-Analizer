import { NextResponse } from "next/server";
import { getGoogleNews } from "@/modules/market/lib/news";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "NSE stock market India";
  const articles = await getGoogleNews(query, 10);

  return NextResponse.json({ articles, fetchedAt: new Date().toISOString() });
}
