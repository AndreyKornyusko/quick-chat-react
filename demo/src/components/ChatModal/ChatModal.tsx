import { useEffect } from "react";
import { QuickChat } from "quick-chat-react";
import type { UserData } from "quick-chat-react";
import "./ChatModal.css";

interface ChatModalProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  currentUser: UserData | null;
  onClose: () => void;
}

export function ChatModal({ supabaseUrl, supabaseAnonKey, currentUser, onClose }: ChatModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal__bar">
          <button className="chat-modal__close" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        </div>
        {/*
         * Two auth flows:
         * - currentUser present → authMode="external": chat opens immediately, no login needed
         * - currentUser null    → authMode="built-in": chat renders its own login screen
         *
         * key={...} forces a clean remount when the user switches identity
         */}
        <div className="chat-modal__content">
          <QuickChat
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
            authMode={currentUser ? "external" : "built-in"}
            userData={currentUser ?? undefined}
            key={currentUser?.id ?? "guest"}
            height="100%"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}
