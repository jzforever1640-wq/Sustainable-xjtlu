"use client";

import { usePortalLanguage } from "./PortalChrome";

export default function PageIntro({
  eyebrowEn,
  eyebrowZh,
  titleEn,
  titleZh,
  textEn,
  textZh,
}: {
  eyebrowEn: string;
  eyebrowZh: string;
  titleEn: string;
  titleZh: string;
  textEn: string;
  textZh: string;
}) {
  const { language } = usePortalLanguage();

  return (
    <section className="subpageHero">
      <p className="eyebrow">
        {language === "en" ? eyebrowEn : eyebrowZh}
      </p>
      <h1>{language === "en" ? titleEn : titleZh}</h1>
      <p>{language === "en" ? textEn : textZh}</p>
    </section>
  );
}
