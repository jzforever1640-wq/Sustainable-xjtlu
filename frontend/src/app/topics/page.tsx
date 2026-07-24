import PageIntro from "@/components/PageIntro";
import PortalChrome from "@/components/PortalChrome";
import TopicsExplorer from "@/components/TopicsExplorer";

export default function TopicsPage() {
  return (
    <PortalChrome activePath="/topics">
      <PageIntro
        eyebrowEn="United Nations Sustainable Development Goals"
        eyebrowZh="联合国可持续发展目标"
        titleEn="All 17 SDG Topics"
        titleZh="全部 17 项可持续发展目标"
        textEn="Choose a goal to open a filtered view of related content from the platform database."
        textZh="选择一项目标，打开独立的相关内容筛选页面。"
      />
      <TopicsExplorer />
    </PortalChrome>
  );
}
