import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { HomeChatButton } from "./HomeChatButton";
import { HomeHeaderAuth } from "./HomeHeaderAuth";

export const metadata: Metadata = {
  title: "QuickChat Demo — Drop-in React Chat for Supabase",
  description:
    "Test project for quick-chat-react v1.0.4: drop-in real-time chat with external Supabase auth, group chats, voice messages, file uploads, emoji reactions and read receipts.",
  openGraph: {
    title: "QuickChat Demo",
    description:
      "Drop-in real-time chat for React + Supabase. Test project for quick-chat-react.",
  },
};

const features = [
  { icon: "💬", title: "Real-time messaging", description: "Instant delivery via Supabase Realtime" },
  { icon: "👥", title: "Group chats", description: "Create and manage group conversations" },
  { icon: "🎙️", title: "Voice messages", description: "Record and send audio messages" },
  { icon: "📎", title: "File uploads", description: "Share photos and files in chat" },
  { icon: "😄", title: "Emoji reactions", description: "React to messages with emojis" },
  { icon: "✅", title: "Read receipts", description: "See when messages are read" },
  { icon: "🔒", title: "External auth", description: "Reuse your existing Supabase session" },
  { icon: "🌙", title: "Dark mode", description: "Light, dark, or system preference" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="px-4 md:px-6 h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <span className="text-xl">💬</span>
          <span>QuickChat Next.js Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors"
          >
            Chat
          </Link>
          <HomeHeaderAuth />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 md:px-6 py-16 md:py-24 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span>quick-chat-react v1.0.4</span>
            <span>·</span>
            <a
              href="https://www.npmjs.com/package/quick-chat-react"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              npm
            </a>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Drop-in real-time chat (Next.js Demo)
            <br className="hidden md:block" />
            <span className="text-indigo-600"> for React + Supabase</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Add full chat to your app in minutes. Messaging, group chats, voice messages,
            file uploads, emoji reactions, read receipts — all via props.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-xl font-semibold text-base transition-colors min-h-[44px] flex items-center justify-center"
            >
              Try the demo
            </Link>
            <a
              href="https://www.npmjs.com/package/quick-chat-react"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-3 rounded-xl font-semibold text-base transition-colors min-h-[44px] flex items-center justify-center"
            >
              View on npm
            </a>
          </div>
        </section>

        {/* Code snippet */}
        <section className="px-4 md:px-6 max-w-3xl mx-auto mb-16">
          <div className="rounded-2xl bg-slate-900 dark:bg-slate-800 text-slate-100 overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-slate-400">external-auth.tsx</span>
            </div>
            <pre className="overflow-x-auto text-sm p-4 leading-relaxed">
              <code>{`import { QuickChat } from "quick-chat-react";

const { data: { session } } = await supabase.auth.getSession();

<QuickChat
  supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
  supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
  authMode="external"
  userData={{
    id: session.user.id,
    name: session.user.user_metadata.display_name,
    accessToken: session.access_token,   // for Supabase RLS
    refreshToken: session.refresh_token, // prevents expiry after 1h
  }}
  showGroups allowVoiceMessages allowFileUpload
  allowReactions showOnlineStatus showReadReceipts
/>`}</code>
            </pre>
          </div>
        </section>

        {/* Features grid */}
        <section className="px-4 md:px-6 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center mb-10">
            Everything included
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center"
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">{f.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{f.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 md:px-6 pb-20 text-center">
          <div className="max-w-xl mx-auto bg-indigo-600 rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to test external auth?
            </h2>
            <p className="mt-3 text-indigo-200 text-sm md:text-base">
              Create an account and see how quick-chat-react reuses your Supabase session.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center justify-center bg-white hover:bg-indigo-50 px-8 py-3 rounded-xl font-semibold text-base transition-colors min-h-[44px]"
              style={{ color: "#4f46e5" }}
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "QuickChat Demo",
            applicationCategory: "CommunicationApplication",
            operatingSystem: "Web",
            description:
              "Demo of quick-chat-react v1.0.4: drop-in real-time React chat backed by Supabase with external auth support.",
            url: process.env.NEXT_PUBLIC_APP_URL ?? "https://quick-chat-demo.vercel.app",
            author: {
              "@type": "Person",
              name: "Andrey Kornyushko",
              url: "https://www.npmjs.com/~andrew_kornyushko",
            },
            softwareVersion: "1.0.4",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      <Footer />
      <HomeChatButton />
    </div>
  );
}
