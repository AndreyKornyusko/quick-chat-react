import { useEffect } from "react";
import { QuickChat, type UserData, type ThemeColors } from "quick-chat-react";
import "./ChatModal.css";

const CUSTOM_THEME: ThemeColors = {
  light: {
    primary:                 "258 90% 60%",
    primaryForeground:       "0 0% 100%",
    chatBubbleOut:           "258 65% 76%",
    chatBubbleOutForeground: "258 50% 10%",
    chatBubbleIn:            "258 20% 96%",
    chatBubbleInForeground:  "258 30% 15%",
    muted:                   "258 25% 82%",
    mutedForeground:         "258 35% 28%",
    chatGradientFrom:        "258 70% 55%",
    chatGradientVia:         "280 65% 58%",
    chatGradientTo:          "310 60% 60%",
  },
  dark: {
    primary:                 "258 85% 68%",
    primaryForeground:       "0 0% 100%",
    chatBubbleOut:           "258 50% 32%",
    chatBubbleOutForeground: "258 80% 94%",
    chatBubbleIn:            "258 18% 20%",
    chatBubbleInForeground:  "210 15% 90%",
    muted:                   "258 20% 22%",
    mutedForeground:         "258 30% 70%",
    chatGradientFrom:        "258 45% 18%",
    chatGradientVia:         "275 40% 22%",
    chatGradientTo:          "300 35% 20%",
  },
};

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
          <span
            className={`chat-modal__auth-badge ${
              currentUser
                ? "chat-modal__auth-badge--external"
                : "chat-modal__auth-badge--builtin"
            }`}
            title={
              currentUser
                ? "External auth: your app's session is passed to QuickChat via userData prop"
                : "Built-in auth: QuickChat renders its own login/signup UI"
            }
          >
            {currentUser ? "⚡ External Auth Demo" : "🔑 Built-in Auth Demo"}
          </span>
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
              themeColors={CUSTOM_THEME}
              height="100%"
              width="100%"
            />
          ) : (
            // Built-in auth mode: QuickChat renders its own login/signup UI.
            <QuickChat
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              authMode="built-in"
              themeColors={CUSTOM_THEME}
              height="100%"
              width="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
}
