import AuthForm from "@/components/AuthForm";
import PortalChrome from "@/components/PortalChrome";

export default function LoginPage() {
  return (
    <PortalChrome activePath="">
      <AuthForm mode="login" />
    </PortalChrome>
  );
}
