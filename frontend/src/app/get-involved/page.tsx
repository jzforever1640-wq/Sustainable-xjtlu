"use client";

import Link from "next/link";
import FeedbackForm from "@/components/FeedbackForm";
import PageIntro from "@/components/PageIntro";
import PortalChrome, {
  usePortalLanguage,
} from "@/components/PortalChrome";

function InvolvementContent() {
  const { language } = usePortalLanguage();
  const cards = [
    {
      number: "01",
      en: "Discover campus activities",
      zh: "发现校园活动",
      enText: "Browse current updates and find opportunities to participate.",
      zhText: "浏览最新校园动态，查找可以参与的活动机会。",
      href: "/news",
    },
    {
      number: "02",
      en: "Build your knowledge",
      zh: "积累可持续知识",
      enText: "Read stories and practical explanations before taking action.",
      zhText: "在采取行动前，阅读故事与实践性主题解读。",
      href: "/blogs",
    },
    {
      number: "03",
      en: "Improve the platform",
      zh: "共同改进平台",
      enText: "Submit feedback so the next version is clearer and easier to use.",
      zhText: "提交反馈，帮助下一版本变得更清晰、更易使用。",
      href: "#feedback-form",
    },
  ];

  return (
    <>
      <section className="involvementGrid">
        {cards.map((card) =>
          card.href.startsWith("#") ? (
            <a className="involvementCard" href={card.href} key={card.number}>
              <span>{card.number}</span>
              <h2>{language === "en" ? card.en : card.zh}</h2>
              <p>{language === "en" ? card.enText : card.zhText}</p>
              <strong aria-hidden="true">&rarr;</strong>
            </a>
          ) : (
            <Link className="involvementCard" href={card.href} key={card.number}>
              <span>{card.number}</span>
              <h2>{language === "en" ? card.en : card.zh}</h2>
              <p>{language === "en" ? card.enText : card.zhText}</p>
              <strong aria-hidden="true">&rarr;</strong>
            </Link>
          ),
        )}
      </section>
      <section className="feedbackRoute" id="feedback-form">
        <FeedbackForm />
      </section>
    </>
  );
}

export default function GetInvolvedPage() {
  return (
    <PortalChrome activePath="/get-involved">
      <PageIntro
        eyebrowEn="Take part"
        eyebrowZh="参与行动"
        titleEn="Get Involved"
        titleZh="参与可持续发展行动"
        textEn="Move from reading to action through campus activities, shared knowledge and a direct feedback channel."
        textZh="通过校园活动、知识共享与直接反馈渠道，从信息获取进一步走向实际行动。"
      />
      <InvolvementContent />
    </PortalChrome>
  );
}
