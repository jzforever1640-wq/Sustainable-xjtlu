import AccountOverview from "@/components/AccountOverview";
import PortalChrome from "@/components/PortalChrome";

export default function AccountPage() {
  return (
    <PortalChrome activePath="">
      <AccountOverview />
    </PortalChrome>
  );
}
