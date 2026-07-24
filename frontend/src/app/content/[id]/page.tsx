import ContentDetail from "@/components/ContentDetail";
import PortalChrome from "@/components/PortalChrome";

export default function ContentDetailPage() {
  return (
    <PortalChrome activePath="">
      <section className="contentDetailWrap">
        <ContentDetail />
      </section>
    </PortalChrome>
  );
}
