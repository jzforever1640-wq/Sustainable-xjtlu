"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  apiRequest,
  ContentItem,
  formatContentDate,
} from "@/lib/portal";
import FeedbackForm from "./FeedbackForm";
import { usePortalLanguage } from "./PortalChrome";

const text = {
  en: {
    back: "Back to content",
    loading: "Loading article...",
    notFound: "This article could not be found.",
    save: "Save to favorites",
    remove: "Remove favorite",
    source: "Open original source",
    signIn: "Please sign in before saving content.",
  },
  zh: {
    back: "返回内容列表",
    loading: "正在加载文章……",
    notFound: "未找到该文章。",
    save: "收藏文章",
    remove: "取消收藏",
    source: "查看原始来源",
    signIn: "请先登录，再收藏内容。",
  },
} as const;

export default function ContentDetail() {
  const params = useParams<{ id: string }>();
  const { language } = usePortalLanguage();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [favorite, setFavorite] = useState(false);
  const t = text[language];
  const contentId = Number(params.id);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("sx_token") ?? "";
    const timer = window.setTimeout(() => setToken(savedToken), 0);

    apiRequest<{ item: ContentItem }>(`/api/contents/${params.id}`)
      .then((data) => setItem(data.item))
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));

    if (savedToken) {
      apiRequest<{ items: { content: ContentItem }[] }>("/api/favorites", {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((data) =>
          setFavorite(
            data.items.some((favoriteItem) => favoriteItem.content.id === contentId),
          ),
        )
        .catch(() => setFavorite(false));
    }

    return () => window.clearTimeout(timer);
  }, [contentId, params.id]);

  async function toggleFavorite() {
    if (!item) return;
    if (!token) {
      setMessage(t.signIn);
      window.setTimeout(() => {
        window.location.href = "/account/login";
      }, 600);
      return;
    }

    try {
      const data = await apiRequest<{ message: string }>(
        `/api/favorites/${item.id}`,
        {
          method: favorite ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setFavorite(!favorite);
      setMessage(data.message);
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  if (loading) {
    return <section className="contentDetail routePanel">{t.loading}</section>;
  }

  if (!item) {
    return (
      <section className="contentDetail routePanel">
        <h1>{t.notFound}</h1>
        {message && <p>{message}</p>}
        <Link href="/search">{t.back}</Link>
      </section>
    );
  }

  return (
    <>
      <article className="contentDetail routePanel">
        <Link className="backLink" href="/search">
          <span aria-hidden="true">&larr;</span> {t.back}
        </Link>
        <span className="pill">{item.category}</span>
        <h1>{item.title}</h1>
        <time>{formatContentDate(item.published_at, language)}</time>
        {item.cover_image_url && (
          // The URL comes from the Flask content API.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="articleImage" src={item.cover_image_url} alt="" />
        )}
        {item.summary && <p className="lead">{item.summary}</p>}
        <p className="contentBody">{item.body}</p>
        <div className="actions">
          <button type="button" onClick={toggleFavorite}>
            {favorite ? t.remove : t.save}
          </button>
          {item.source_url && (
            <a href={item.source_url} target="_blank" rel="noreferrer">
              {t.source}
            </a>
          )}
        </div>
        {message && <p className="authMessage">{message}</p>}
      </article>
      <section className="contentFeedback">
        <FeedbackForm contentId={item.id} />
      </section>
    </>
  );
}
