import { PortalSignIn } from "@/components/PortalSignIn";

export const metadata = {
  title: "Client Portal — Sign In",
  description:
    "Sign in to the CyberAutopsy GRC workspace. Multi-factor authentication enforced. Sessions logged per DFARS 7012.",
  robots: { index: false, follow: false }
};

export default function PortalSignInPage() {
  return <PortalSignIn />;
}
