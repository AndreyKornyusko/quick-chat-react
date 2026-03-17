"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";

export function DashboardClient() {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div className="h-[calc(100dvh-128px)] md:h-[calc(100dvh-64px)]">
      {/* Desktop: QuickChat inline, full height */}
      <div className="hidden md:flex flex-col h-full">
        <div
          className="flex items-center gap-2 px-4 py-1.5 text-[0.68rem] font-semibold tracking-wide uppercase bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-b border-green-200 dark:border-green-800 shrink-0"
          title="External auth: your Supabase session is passed to QuickChat via the userData prop"
        >
          ⚡ External Auth Demo — session passed via <code className="font-mono normal-case tracking-normal">userData</code> prop
        </div>
        <div className="flex-1 min-h-0">
          <ChatPanel
            height="100%"
            onUnreadCountChange={setUnreadCount}
          />
        </div>
      </div>

      {/* Mobile: placeholder — actual chat opens via ChatModal in layout */}
      <div className="md:hidden flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">Open chat</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tap the chat button below
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium px-3 py-1 rounded-full">
            {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
