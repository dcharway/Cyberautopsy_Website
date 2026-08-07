import { SignupForm } from "@/components/portal/SignupForm";
import { Suspense } from "react";

export const metadata = {
  title: "Create Your Account — CyberAutopsy GRC",
  description: "Create a CyberAutopsy Client Portal account and pick a subscription plan.",
  robots: { index: false, follow: false }
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
