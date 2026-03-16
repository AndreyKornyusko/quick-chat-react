"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ChatModal } from "@/components/chat/ChatModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div className="flex flex-col min-h-dvh">
      <Navbar />

      {/* Page content — leave room for bottom nav on mobile */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Mobile bottom navigation */}
      <MobileNav
        unreadCount={unreadCount}
        onChatClick={() => setIsChatOpen(true)}
      />

      {/* Chat modal — mobile full screen */}
      <ChatModal
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}
