"use client";

import { useMemo } from "react";
import { QuickChat } from "quick-chat-react";
import { useSession } from "@/hooks/useSession";
import { Spinner } from "@/components/ui";

interface ChatPanelProps {
  onUnreadCountChange?: (count: number) => void;
  onConversationSelect?: (id: string) => void;
  height?: string;
  mobileLayout?: boolean;
}

export function ChatPanel({
  onUnreadCountChange,
  onConversationSelect,
  height = "calc(100dvh - 64px)",
  mobileLayout,
}: ChatPanelProps) {
  const { session, loading } = useSession();

  // Must be before early returns to satisfy Rules of Hooks.
  // Stable reference prevents the library's internal subscription effect from
  // re-running on every render (which caused the conversation_members loop).
  const userData = useMemo(
    () =>
      session
        ? {
            id: session.user.id,
            name:
              session.user.user_metadata?.display_name ??
              session.user.email?.split("@")[0] ??
              "User",
            avatar: session.user.user_metadata?.avatar_url,
            email: session.user.email,
            description: session.user.user_metadata?.bio,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          }
        : undefined,
    [
      session?.user.id,
      session?.user.email,
      session?.user.user_metadata?.display_name,
      session?.user.user_metadata?.avatar_url,
      session?.user.user_metadata?.bio,
      session?.access_token,
      session?.refresh_token,
    ]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!session || !userData) return null;

  return (
    <QuickChat
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
      // External auth mode: reuse your app's Supabase session
      authMode="external"
      userData={userData}
      // Theme follows system preference
      theme="system"
      // Feature flags — all enabled for thorough testing
      showGroups={true}
      allowVoiceMessages={true}
      allowFileUpload={true}
      allowReactions={true}
      showOnlineStatus={true}
      showReadReceipts={true}
      // Sizing
      height={height}
      width="100%"
      mobileLayout={mobileLayout}
      // Callbacks
      onUnreadCountChange={onUnreadCountChange}
      onConversationSelect={onConversationSelect}
    />
  );
}
