import HomeExperience from "@/components/HomeExperience";
import PortalChrome from "@/components/PortalChrome";

export default function HomePage() {
  return (
    <PortalChrome activePath="/">
      <HomeExperience />
    </PortalChrome>
  );
}
