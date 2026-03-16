"use client";

import { useState } from "react";
import { ChatButton } from "quick-chat-react";
import { ChatModal } from "@/components/chat/ChatModal";
import { useSession } from "@/hooks/useSession";

export function HomeChatButton() {
  const { session } = useSession();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!session) return null;

  const userData = {
    id: session.user.id,
    name:
      session.user.user_metadata?.display_name ??
      session.user.email?.split("@")[0] ??
      "User",
    avatar: session.user.user_metadata?.avatar_url,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };

  return (
    <>
      <ChatButton
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
        userData={userData}
        floating={true}
        position="bottom-right"
        size="md"
        label="Open chat"
        onClick={() => setIsChatOpen(true)}
      />
      <ChatModal
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUnreadCountChange={() => {}}
      />
    </>
  );
}
