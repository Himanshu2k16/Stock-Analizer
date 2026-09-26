"use client";

import { useEffect, useState } from "react";
import type { NewsArticle } from "@/types/market";

interface FeedState {
  url: string;
  articles: NewsArticle[];
}

export function useNewsFeed(url: string | null) {
  const [feed, setFeed] = useState<FeedState | null>(null);

  useEffect(() => {
    if (!url) return;
    let active = true;
    fetch(url, { cache: "no-store" })
      .then((response) => response.json() as Promise<{ articles: NewsArticle[] }>)
      .then((payload) => {
        if (active) setFeed({ url, articles: payload.articles ?? [] });
      })
      .catch(() => {
        if (active) setFeed({ url, articles: [] });
      });
    return () => {
      active = false;
    };
  }, [url]);

  return {
    articles: feed?.url === url ? feed.articles : [],
    loading: Boolean(url) && feed?.url !== url,
  };
}
