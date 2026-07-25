"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePortalLanguage } from "./PortalChrome";
import ContentBrowser from "./ContentBrowser";

const allSdgs = [
  ["No Poverty", "无贫穷"],
  ["Zero Hunger", "零饥饿"],
  ["Good Health and Well-being", "良好健康与福祉"],
  ["Quality Education", "优质教育"],
  ["Gender Equality", "性别平等"],
  ["Clean Water and Sanitation", "清洁饮水和卫生设施"],
  ["Affordable and Clean Energy", "经济适用的清洁能源"],
  ["Decent Work and Economic Growth", "体面工作和经济增长"],
  ["Industry, Innovation and Infrastructure", "产业、创新和基础设施"],
  ["Reduced Inequalities", "减少不平等"],
  ["Sustainable Cities and Communities", "可持续城市和社区"],
  ["Responsible Consumption and Production", "负责任消费和生产"],
  ["Climate Action", "气候行动"],
  ["Life Below Water", "水下生物"],
  ["Life on Land", "陆地生物"],
  ["Peace, Justice and Strong Institutions", "和平、正义与强大机构"],
  ["Partnerships for the Goals", "促进目标实现的伙伴关系"],
] as const;

function sdgTag(index: number, name: string) {
  return `SDG ${index + 1} ${name}`;
}

export default function TopicsExplorer() {
  const { language } = usePortalLanguage();
  const [selectedTopic, setSelectedTopic] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const topic =
        new URLSearchParams(window.location.search).get("topic") ?? "";
      setSelectedTopic(topic);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="routeContent topicsRoute">
        <div className="sdgList">
          {allSdgs.map(([en, zh], index) => (
            <Link
              className={selectedTopic === en ? "active" : ""}
              href={`/topics?topic=${encodeURIComponent(en)}`}
              key={en}
              onClick={() => setSelectedTopic(en)}
              scroll={false}
            >
              <strong>{index + 1}</strong>
              <span>{language === "en" ? en : zh}</span>
            </Link>
          ))}
        </div>
      </section>
      {selectedTopic && (
        <section className="topicResultsHeading">
          <p className="eyebrow">
            {language === "en" ? "Related platform content" : "平台相关内容"}
          </p>
          <h2>
            {language === "en"
              ? `Results for “${selectedTopic}”`
              : `“${selectedTopic}”相关结果`}
          </h2>
        </section>
      )}
      <ContentBrowser
        mode="topic"
        initialSdg={
          selectedTopic
            ? sdgTag(
                allSdgs.findIndex(([en]) => en === selectedTopic),
                selectedTopic,
              )
            : ""
        }
      />
    </>
  );
}
