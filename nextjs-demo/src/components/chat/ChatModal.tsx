"use client";

import { X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function ChatModal({ open, onClose, onUnreadCountChange }: ChatModalProps) {
  return (
    <div
      className={`fixed bottom-20 right-4 z-50 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ease-in-out ${
        open
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-6 pointer-events-none"
      }`}
      style={{ width: 390, height: 680 }}
    >
      {/* Modal header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">Chat</span>
          <span
            className="inline-flex items-center gap-1 text-[0.65rem] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
            title="External auth: your Supabase session is passed to QuickChat via the userData prop"
          >
            ⚡ External Auth
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Chat fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <ChatPanel
          height="100%"
          mobileLayout={true}
          onUnreadCountChange={onUnreadCountChange}
        />
      </div>
    </div>
  );
}
