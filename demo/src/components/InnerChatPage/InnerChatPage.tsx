import { QuickChat, ChatButton } from "quick-chat-react";
import "./InnerChatPage.css";

interface InnerChatPageProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  onOpenModal: () => void;
}

export function InnerChatPage({ supabaseUrl, supabaseAnonKey, onOpenModal }: InnerChatPageProps) {
  return (
    <div className="inner-chat-page">
      <QuickChat
        supabaseUrl={supabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
        authMode="built-in"
        height="100%"
        width="100%"
      />
      <ChatButton
        supabaseUrl={supabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
        onClick={onOpenModal}
        floating={true}
        position="bottom-right"
        label="Open in modal"
      />
    </div>
  );
}
