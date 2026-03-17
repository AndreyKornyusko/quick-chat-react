import { QuickChat } from "quick-chat-react";
import "./InnerChatPage.css";

interface InnerChatPageProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  onOpenModal: () => void;
}

export function InnerChatPage({ supabaseUrl, supabaseAnonKey }: InnerChatPageProps) {
  return (
    <div className="inner-chat-page">
      <div
        className="inner-chat-page__auth-banner"
        title="Built-in auth: QuickChat renders its own login/signup UI — no external session needed"
      >
        🔑 Built-in Auth Demo — QuickChat manages login &amp; signup itself
      </div>
      <div className="inner-chat-page__chat-wrapper">
        <QuickChat
          supabaseUrl={supabaseUrl}
          supabaseAnonKey={supabaseAnonKey}
          authMode="built-in"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}
