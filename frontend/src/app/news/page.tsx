import ContentBrowser from "@/components/ContentBrowser";
import PageIntro from "@/components/PageIntro";
import PortalChrome from "@/components/PortalChrome";

export default function NewsPage() {
  return (
    <PortalChrome activePath="/news">
      <PageIntro
        eyebrowEn="Campus updates"
        eyebrowZh="校园动态"
        titleEn="Sustainability News"
        titleZh="可持续发展校园动态"
        textEn="Read the latest announcements, events and sustainability updates published through the platform database."
        textZh="查看由平台数据库发布的最新通知、活动与可持续发展校园动态。"
      />
      <ContentBrowser mode="news" />
    </PortalChrome>
  );
}
