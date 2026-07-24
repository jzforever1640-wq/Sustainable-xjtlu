import AuthForm from "@/components/AuthForm";
import PortalChrome from "@/components/PortalChrome";

export default function RegisterPage() {
  return (
    <PortalChrome activePath="">
      <AuthForm mode="register" />
    </PortalChrome>
  );
}
