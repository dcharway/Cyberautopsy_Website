import { Suspense } from "react";
import { VerifyClient } from "@/components/portal/VerifyClient";

export const metadata = {
  title: "Verify Email — CyberAutopsy",
  description: "Confirm your CyberAutopsy account email address.",
  robots: { index: false, follow: false }
};

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyClient />
    </Suspense>
  );
}
