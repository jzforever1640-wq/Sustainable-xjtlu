"use client";

import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import PortalChrome, {
  usePortalLanguage,
} from "@/components/PortalChrome";

function AboutContent() {
  const { language } = usePortalLanguage();
  const items = [
    {
      en: "Discover",
      zh: "发现",
      enText: "Bring scattered sustainability information into one place.",
      zhText: "将分散的可持续发展信息整合到同一平台。",
    },
    {
      en: "Interact",
      zh: "互动",
      enText: "Let users search, read, save and respond to useful content.",
      zhText: "支持用户搜索、阅读、收藏并反馈有用内容。",
    },
    {
      en: "Improve",
      zh: "改进",
      enText: "Use feedback from the pilot to guide the next platform version.",
      zhText: "利用试点反馈指导平台下一版本的优化。",
    },
  ];

  return (
    <section className="aboutRoute">
      <div className="aboutRouteGrid">
        {items.map((item, index) => (
          <article className="routePanel" key={item.en}>
            <span>0{index + 1}</span>
            <h2>{language === "en" ? item.en : item.zh}</h2>
            <p>{language === "en" ? item.enText : item.zhText}</p>
          </article>
        ))}
      </div>
      <div className="pilotNotice">
        <div>
          <p className="eyebrow">
            {language === "en" ? "Pilot notice" : "测试说明"}
          </p>
          <h2>
            {language === "en"
              ? "Student Project Beta"
              : "学生项目测试版"}
          </h2>
        </div>
        <p>
          {language === "en"
            ? "This platform is for project research and user testing. It does not represent an official XJTLU information channel."
            : "本平台仅用于项目研究与用户测试，不代表西交利物浦大学官方信息发布渠道。"}
        </p>
        <Link href="/get-involved">
          {language === "en" ? "Share feedback" : "提交反馈"}
          <span aria-hidden="true"> &rarr;</span>
        </Link>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <PortalChrome activePath="/about">
      <PageIntro
        eyebrowEn="About the pilot"
        eyebrowZh="关于平台试点"
        titleEn="A Clearer Sustainability Information Loop"
        titleZh="构建更清晰的可持续发展信息闭环"
        textEn="Sustainable XJTLU is a student-built pilot that connects discovery, interaction and feedback in one platform."
        textZh="Sustainable XJTLU 是一个学生搭建的试点平台，将信息发现、用户互动与反馈改进连接起来。"
      />
      <AboutContent />
    </PortalChrome>
  );
}
