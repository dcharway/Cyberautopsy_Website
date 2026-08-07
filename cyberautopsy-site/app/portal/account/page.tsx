import { Suspense } from "react";
import { AccountPanel } from "@/components/portal/AccountPanel";

export const metadata = {
  title: "Account — CyberAutopsy Client Portal",
  description:
    "Manage your CyberAutopsy subscription, payment methods, invoices, and account details.",
  robots: { index: false, follow: false }
};

export default function AccountPage() {
  return (
    <Suspense>
      <AccountPanel />
    </Suspense>
  );
}
