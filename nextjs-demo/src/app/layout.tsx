import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "quick-chat-react/style.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://quick-chat-demo.vercel.app"
  ),
  title: {
    template: "%s | QuickChat Demo",
    default: "QuickChat Demo — Drop-in React Chat for Supabase",
  },
  description:
    "A Next.js 15 demo showcasing quick-chat-react: drop-in real-time messaging, group chats, voice messages, file uploads and emoji reactions — all via props, backed by Supabase.",
  keywords: [
    "react chat",
    "supabase chat",
    "quick-chat-react",
    "real-time messaging",
    "next.js chat",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "QuickChat Demo",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "QuickChat Demo" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
