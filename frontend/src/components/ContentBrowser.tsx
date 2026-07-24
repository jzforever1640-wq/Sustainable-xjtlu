"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  ContentItem,
  formatContentDate,
} from "@/lib/portal";
import { usePortalLanguage } from "./PortalChrome";

type BrowserMode = "all" | "news" | "blogs" | "topic";

const text = {
  en: {
    search: "Search by keyword",
    category: "All categories",
    loading: "Loading content...",
    empty: "No matching content has been published yet.",
    read: "Open article",
    results: "result(s)",
    databaseNote: "Content shown here is loaded from the platform database.",
  },
  zh: {
    search: "按关键词搜索",
    category: "全部分类",
    loading: "正在加载内容……",
    empty: "数据库中暂时没有符合条件的已发布内容。",
    read: "打开文章",
    results: "条结果",
    databaseNote: "本页内容由平台后端数据库实时提供。",
  },
} as const;

function matchesMode(item: ContentItem, mode: BrowserMode) {
  const category = item.category.toLowerCase();
  if (mode === "news") {
    return ["news", "announcement", "event", "动态", "通知", "活动"].some(
      (keyword) => category.includes(keyword),
    );
  }
  if (mode === "blogs") {
    return ["blog", "article", "story", "博客", "文章", "故事"].some(
      (keyword) => category.includes(keyword),
    );
  }
  return true;
}

export default function ContentBrowser({
  mode = "all",
  initialQuery = "",
}: {
  mode?: BrowserMode;
  initialQuery?: string;
}) {
  const { language } = usePortalLanguage();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const t = text[language];

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ page: "1", page_size: "50" });
      if (query.trim()) params.set("q", query.trim());
      if (category !== "All") params.set("category", category);

      setLoading(true);
      apiRequest<{ items: ContentItem[] }>(`/api/contents?${params}`, {
        signal: controller.signal,
      })
      .then((data) => setItems(data.items ?? []))
      .catch((error: Error) => {
        if (error.name !== "AbortError") setMessage(error.message);
      })
      .finally(() => setLoading(false));
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [category, query]);

  const modeItems = useMemo(() => {
    const matched = items.filter((item) => matchesMode(item, mode));
    return (mode === "news" || mode === "blogs") && matched.length === 0
      ? items
      : matched;
  }, [items, mode]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(modeItems.map((item) => item.category)))],
    [modeItems],
  );

  const filteredItems = modeItems;

  return (
    <section className="routeContent">
      <div className="routeToolbar">
        <input
          aria-label={t.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.search}
        />
        <select
          aria-label={t.category}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? t.category : item}
            </option>
          ))}
        </select>
      </div>

      <div className="routeMeta">
        <span>
          {loading
            ? t.loading
            : language === "en"
              ? `${filteredItems.length} ${t.results}`
              : `${filteredItems.length} ${t.results}`}
        </span>
        <small>{t.databaseNote}</small>
      </div>

      {message && <p className="message routeMessage">{message}</p>}
      {!loading && filteredItems.length === 0 && (
        <div className="emptyState">{t.empty}</div>
      )}

      <div className="articleCardGrid">
        {filteredItems.map((item) => (
          <article className="articleCard" key={item.id}>
            {item.cover_image_url ? (
              // The URL comes from the Flask content API.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.cover_image_url} alt="" />
            ) : (
              <div className="articleCardPlaceholder" aria-hidden="true">
                {item.category.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <span className="pill">{item.category}</span>
              <h2>{item.title}</h2>
              <p>{item.summary ?? item.body.slice(0, 150)}</p>
              <time>{formatContentDate(item.published_at, language)}</time>
              <Link href={`/content/${item.id}`}>
                {t.read} <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
