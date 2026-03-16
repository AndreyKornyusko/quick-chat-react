import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";

// Auth-gated page — never statically generated
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
