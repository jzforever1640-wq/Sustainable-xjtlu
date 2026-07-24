"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/portal";
import { usePortalLanguage } from "./PortalChrome";

const text = {
  en: {
    title: "Share your feedback",
    text: "Tell us what is difficult to find, unclear, or missing. Your response is stored by the existing feedback API.",
    suggestion: "Suggestion",
    content: "Content issue",
    bug: "Bug report",
    general: "General feedback",
    rating: "Rating",
    placeholder: "What should be improved?",
    submit: "Submit feedback",
    submitted: "Thank you. Your feedback has been submitted.",
  },
  zh: {
    title: "提交反馈",
    text: "请告诉我们哪些信息难以查找、表述不清或仍有缺失。反馈将通过现有后端接口保存。",
    suggestion: "改进建议",
    content: "内容问题",
    bug: "功能问题",
    general: "一般反馈",
    rating: "评分",
    placeholder: "你希望平台改进什么？",
    submit: "提交反馈",
    submitted: "感谢你的反馈，内容已成功提交。",
  },
} as const;

export default function FeedbackForm({ contentId }: { contentId?: number }) {
  const { language } = usePortalLanguage();
  const [token, setToken] = useState("");
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [working, setWorking] = useState(false);
  const t = text[language];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToken(window.localStorage.getItem("sx_token") ?? "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setStatus("");

    try {
      const data = await apiRequest<{ message: string }>("/api/feedback", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({
          ...(contentId ? { content_id: contentId } : {}),
          feedback_type: feedbackType,
          rating,
          message,
        }),
      });
      setMessage("");
      setStatus(data.message || t.submitted);
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <article className="routePanel feedbackRoutePanel">
      <p className="eyebrow">{language === "en" ? "Feedback loop" : "反馈闭环"}</p>
      <h2>{t.title}</h2>
      <p>{t.text}</p>
      <form onSubmit={submit}>
        <div className="formRow">
          <select
            value={feedbackType}
            onChange={(event) => setFeedbackType(event.target.value)}
          >
            <option value="suggestion">{t.suggestion}</option>
            <option value="content_issue">{t.content}</option>
            <option value="bug">{t.bug}</option>
            <option value="general">{t.general}</option>
          </select>
          <select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          >
            {[5, 4, 3, 2, 1].map((score) => (
              <option key={score} value={score}>
                {t.rating} {score}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t.placeholder}
          required
        />
        <button type="submit" disabled={working}>
          {t.submit} <span aria-hidden="true">&rarr;</span>
        </button>
      </form>
      {status && <p className="authMessage">{status}</p>}
    </article>
  );
}
