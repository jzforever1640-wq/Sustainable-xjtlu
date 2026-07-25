export type Language = "en" | "zh";

export type ContentItem = {
  id: number;
  title: string;
  summary: string | null;
  body: string;
  category: string;
  source_url: string | null;
  cover_image_url: string | null;
  sdg_tags: string[];
  published_at: string | null;
};

export type User = {
  id: number;
  email: string;
  display_name: string;
  role: string;
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? `Request failed: ${response.status}`);
  }

  return data;
}

export function formatContentDate(value: string | null, language: Language) {
  if (!value) {
    return language === "zh" ? "最近发布" : "Recently published";
  }

  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-GB", {
    day: "numeric",
    month: language === "zh" ? "long" : "short",
    year: "numeric",
  }).format(new Date(value));
}
