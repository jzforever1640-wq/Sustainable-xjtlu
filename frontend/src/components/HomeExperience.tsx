"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import home from "@/data/home.json";
import { apiRequest, ContentItem, formatContentDate } from "@/lib/portal";
import { usePortalLanguage } from "./PortalChrome";

function TopicIcon({ name }: { name: string }) {
  const symbols: Record<string, string> = {
    leaf: "⌁",
    building: "▥",
    cap: "⌂",
    people: "◌",
    globe: "◎",
    bolt: "ϟ",
  };
  return <strong aria-hidden="true">{symbols[name] ?? "•"}</strong>;
}

export default function HomeExperience() {
  const { language } = usePortalLanguage();
  const [stories, setStories] = useState<ContentItem[]>(home.fallbackStories);
  const t = home.copy[language];

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<{ items: ContentItem[] }>("/api/contents?page=1&page_size=3", {
      signal: controller.signal,
    })
      .then((data) => {
        if (data.items?.length) setStories(data.items);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <>
      <section className="hero" id="home">
        <div className="heroCopy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>Sustainable<span>XJTLU</span></h1>
          <p>{t.heroIntro}</p>
          <Link className="primaryCta" href="/get-involved">
            {t.getInvolved} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="heroArtwork" aria-hidden="true">
          <h2>{t.heroStatement}</h2>
          <div className="campusSun" />
          <div className="campusCloud cloudOne" />
          <div className="campusCloud cloudTwo" />
          <div className="campusBuilding"><i /><i /><i /><i /><i /><i /></div>
          <div className="campusTrees"><span /><span /><span /><span /><span /></div>
        </div>
      </section>

      <section className="topics" id="sdg-topics">
        <div className="sectionTitle">
          <div><p className="eyebrow">{t.topicsEyebrow}</p><h2>{t.topicsTitle}</h2></div>
          <Link href="/topics">{t.viewAll} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="topicGrid">
          {home.topics.map((topic) => (
            <Link className={`topicCard ${topic.color}`} href={`/topics?topic=${encodeURIComponent(topic.nameEn)}`} key={topic.nameEn}>
              <TopicIcon name={topic.icon} />
              <span>{language === "en" ? topic.nameEn : topic.nameZh}</span>
              <small>{language === "en" ? topic.descriptionEn : topic.descriptionZh}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="featureGrid">
        {home.portals.map((card) => (
          <article className="featureCard" key={card.id}>
            <div className="featureIcon">{card.letter}</div>
            <div>
              <h2>{language === "en" ? card.titleEn : card.titleZh}</h2>
              <p>{language === "en" ? card.textEn : card.textZh}</p>
              <Link href={card.href}>{language === "en" ? card.linkEn : card.linkZh} <span aria-hidden="true">→</span></Link>
            </div>
            <span className="ghostText">{card.letter === "G" ? "JOIN" : card.titleEn.toUpperCase()}</span>
          </article>
        ))}
      </section>

      <section className="searchBand">
        <div className="searchBadge" aria-hidden="true">⌕</div>
        <div><h2>{t.searchTitle}</h2><p>{t.searchText}</p></div>
        <Link className="searchBandAction" href="/search">{t.searchTitle} <span aria-hidden="true">→</span></Link>
      </section>

      <section className="homeStories">
        <div className="sectionTitle">
          <div><p className="eyebrow">{t.latestEyebrow}</p><h2>{t.latestTitle}</h2></div>
          <Link href="/search">{t.searchTitle} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="homeStoryGrid">
          {stories.slice(0, 3).map((story, index) => (
            <article className="homeStory" key={story.id}>
              <div className={`homeStoryArt tone${index + 1}`}><span>{story.category}</span><strong>0{index + 1}</strong></div>
              <div className="homeStoryBody">
                <span className="pill">{story.category}</span>
                <h3>{story.title}</h3>
                <p>{story.summary ?? story.body.slice(0, 150)}</p>
                <time>{formatContentDate(story.published_at, language)}</time>
                <Link href={story.id > 0 ? `/content/${story.id}` : "/search"}>{t.read} <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
