import ContentBrowser from "@/components/ContentBrowser";
import PageIntro from "@/components/PageIntro";
import PortalChrome from "@/components/PortalChrome";

export default function BlogsPage() {
  return (
    <PortalChrome activePath="/blogs">
      <PageIntro
        eyebrowEn="Stories and ideas"
        eyebrowZh="故事与观点"
        titleEn="Sustainability Blogs"
        titleZh="可持续发展专题文章"
        textEn="Explore student-friendly stories, reflections and practical explanations of sustainability topics."
        textZh="通过便于理解的校园故事、观点与实践解读，进一步认识可持续发展议题。"
      />
      <ContentBrowser mode="blogs" />
    </PortalChrome>
  );
}
