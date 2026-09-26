"use client";

import { ArrowUpRight } from "lucide-react";
import { EmptyState, Panel } from "@/components/ui";
import { useNewsFeed } from "../hooks/useNewsFeed";
import { timeAgo } from "@/lib/format";

export function NewsList({ label, title, url }: { label: string; title: string; url: string }) {
  const { articles, loading } = useNewsFeed(url);

  return (
    <Panel label={label} title={title}>
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => index).map((index) => (
            <div key={index} className="animate-pulse space-y-2">
              <div className="h-3 w-24 rounded bg-ink-800" />
              <div className="h-3 w-full rounded bg-ink-800" />
            </div>
          ))}
        </div>
      )}
      {!loading && articles.length === 0 && <EmptyState>Feed unavailable right now — nothing invented in its place.</EmptyState>}
      <ul className="divide-y divide-hairline">
        {articles.slice(0, 7).map((article) => (
          <li key={article.id}>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="label-mono mb-1">
                  {article.source} · {timeAgo(article.publishedAt)}
                </p>
                <p className="text-sm leading-snug text-paper-dim transition-colors group-hover:text-paper">{article.title}</p>
              </div>
              <ArrowUpRight size={15} className="mt-1 shrink-0 text-paper-faint transition-colors group-hover:text-accent-bright" />
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
