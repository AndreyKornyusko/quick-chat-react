"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MessageSquare } from "lucide-react";
import { UserAvatar } from "quick-chat-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

export function Navbar() {
  const { session } = useSession();
  const router = useRouter();
  const { setTheme } = useTheme();

  const userData = session
    ? {
        id: session.user.id,
        name:
          session.user.user_metadata?.display_name ??
          session.user.email?.split("@")[0] ??
          "User",
        avatar: session.user.user_metadata?.avatar_url,
        email: session.user.email,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      }
    : undefined;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white min-w-0">
        <MessageSquare className="h-5 w-5 text-indigo-600 shrink-0" />
        <span className="truncate">
          <span>QuickChat</span>
          <span className="hidden sm:inline"> Next.js Demo</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
        <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Dashboard
        </Link>
        <a
          href="https://www.npmjs.com/package/quick-chat-react"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          npm package
        </a>
      </nav>

      {/* UserAvatar + logout */}
      {session && userData && (
        <div className="flex items-center gap-2">
          <UserAvatar
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
            supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
            authMode="external"
            userData={userData}
            showName={false}
            size="md"
            floating={false}
            onLogout={handleLogout}
            onThemeChange={(t) => setTheme(t)}
          />
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
