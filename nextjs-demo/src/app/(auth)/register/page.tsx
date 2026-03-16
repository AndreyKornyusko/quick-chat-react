import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a QuickChat Demo account",
  robots: { index: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
