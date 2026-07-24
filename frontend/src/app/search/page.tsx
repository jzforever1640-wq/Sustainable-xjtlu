import ContentBrowser from "@/components/ContentBrowser";
import PageIntro from "@/components/PageIntro";
import PortalChrome from "@/components/PortalChrome";

export default function SearchPage() {
  return (
    <PortalChrome activePath="/search">
      <PageIntro
        eyebrowEn="Search the platform"
        eyebrowZh="搜索平台"
        titleEn="Find Sustainability Content"
        titleZh="查找可持续发展内容"
        textEn="Search all published news, blogs, activities and resources in one place."
        textZh="在一个页面中搜索所有已发布的动态、文章、活动与学习资源。"
      />
      <ContentBrowser />
    </PortalChrome>
  );
}
