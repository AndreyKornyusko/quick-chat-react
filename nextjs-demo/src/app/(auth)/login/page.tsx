import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to QuickChat Demo",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
