import { QuickChat, type UserData } from "quick-chat-react";
import "./ChatFloatingPanel.css";

interface ChatFloatingPanelProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  currentUser?: UserData | null;
  open: boolean;
  onClose: () => void;
}

export function ChatFloatingPanel({ supabaseUrl, supabaseAnonKey, currentUser, open, onClose }: ChatFloatingPanelProps) {
  return (
    <div className={`chat-floating-panel${open ? " chat-floating-panel--open" : ""}`}>
      <div className="chat-floating-panel__header">
        <div className="chat-floating-panel__title-group">
          <span className="chat-floating-panel__title">Chat</span>
          <span
            className={`chat-floating-panel__auth-badge ${
              currentUser
                ? "chat-floating-panel__auth-badge--external"
                : "chat-floating-panel__auth-badge--builtin"
            }`}
            title={
              currentUser
                ? "External auth: your app's session is passed to QuickChat via userData prop"
                : "Built-in auth: QuickChat renders its own login/signup UI"
            }
          >
            {currentUser ? "⚡ External Auth" : "🔑 Built-in Auth"}
          </span>
        </div>
        <button className="chat-floating-panel__close" onClick={onClose} aria-label="Close chat">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="chat-floating-panel__content">
        {open && (
          currentUser ? (
            <QuickChat
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              authMode="external"
              userData={currentUser}
              height="100%"
              width="100%"
              mobileLayout={true}
            />
          ) : (
            <QuickChat
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              authMode="built-in"
              height="100%"
              width="100%"
              mobileLayout={true}
            />
          )
        )}
      </div>
    </div>
  );
}
