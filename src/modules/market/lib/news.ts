import type { NewsArticle } from "@/types/market";

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function pick(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

export async function getGoogleNews(query: string, count = 8): Promise<NewsArticle[]> {
  const q = encodeURIComponent(`${query} when:7d`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
  const response = await fetch(url, {
    next: { revalidate: 300 },
    headers: { "user-agent": "Mozilla/5.0 PersonalAIInvestmentAgent/1.0" },
  });

  if (!response.ok) throw new Error(`Google News returned ${response.status}`);

  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, count).map((match, index) => ({
    id: `${query}-${index}-${pick(match[1], "guid") || pick(match[1], "title")}`,
    title: pick(match[1], "title"),
    link: pick(match[1], "link"),
    source: pick(match[1], "source") || "Google News",
    publishedAt: new Date(pick(match[1], "pubDate")).toISOString(),
    query,
  }));
}
