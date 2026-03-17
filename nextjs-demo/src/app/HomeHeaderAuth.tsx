"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { UserAvatar } from "quick-chat-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

export function HomeHeaderAuth() {
  const { session } = useSession();
  const router = useRouter();
  const { setTheme } = useTheme();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (session) {
    const userData = {
      id: session.user.id,
      name:
        session.user.user_metadata?.display_name ??
        session.user.email?.split("@")[0] ??
        "User",
      avatar: session.user.user_metadata?.avatar_url,
      email: session.user.email,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };

    return (
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
          className="hidden sm:flex p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] items-center justify-center"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="hidden sm:block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="text-sm bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] flex items-center"
      >
        <span className="hidden sm:inline">Get started</span>
        <span className="sm:hidden">Sign up</span>
      </Link>
    </>
  );
}
