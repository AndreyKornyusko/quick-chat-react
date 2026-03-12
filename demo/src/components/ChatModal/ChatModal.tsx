import { useEffect } from "react";
import { QuickChat, type UserData } from "quick-chat-react";
import "./ChatModal.css";

interface ChatModalProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  currentUser?: UserData | null;
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
        <div className="chat-modal__content">
          {currentUser ? (
            // External auth mode: demo user is already logged in, pass their data.
            // In production, userData.accessToken should be a real Supabase JWT
            // from your backend (e.g. supabase.auth.admin.generateLink()).
            <QuickChat
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              authMode="external"
              userData={currentUser}
              height="100%"
              width="100%"
            />
          ) : (
            // Built-in auth mode: QuickChat renders its own login/signup UI.
            <QuickChat
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              authMode="built-in"
              height="100%"
              width="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
}
