import { ChatButton } from "quick-chat-react";
import type { UserData } from "quick-chat-react";
import "./ChatButtonShowcase.css";

interface ChatButtonShowcaseProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  currentUser: UserData | null;
  onOpenChat: () => void;
}

const VARIANTS = [
  {
    label: "Default",
    code: `<ChatButton\n  floating={false}\n/>`,
    props: {},
  },
  {
    label: "Sizes",
    code: `<ChatButton\n  floating={false}\n  size="sm"\n/>`,
    props: { size: "sm" as const },
  },
  {
    label: "Sizes",
    code: `<ChatButton\n  floating={false}\n  size="lg"\n/>`,
    props: { size: "lg" as const },
  },
  {
    label: "Custom color",
    code: `<ChatButton\n  floating={false}\n  buttonColor="#16a34a"\n  iconColor="#fff"\n/>`,
    props: { buttonColor: "#16a34a", iconColor: "#ffffff" },
  },
  {
    label: "Custom color",
    code: `<ChatButton\n  floating={false}\n  buttonColor="#ea580c"\n  iconColor="#fff"\n/>`,
    props: { buttonColor: "#ea580c", iconColor: "#ffffff" },
  },
  {
    label: "Custom color",
    code: `<ChatButton\n  floating={false}\n  buttonColor="#0f172a"\n  iconColor="#fff"\n/>`,
    props: { buttonColor: "#0f172a", iconColor: "#ffffff" },
  },
  {
    label: "Unread badge",
    code: `<ChatButton\n  floating={false}\n  unreadCount={5}\n/>`,
    props: { unreadCount: 5 },
  },
  {
    label: "Badge color",
    code: `<ChatButton\n  floating={false}\n  unreadCount={3}\n  badgeColor="#f59e0b"\n/>`,
    props: { unreadCount: 3, badgeColor: "#f59e0b" },
  },
  {
    label: "Custom label",
    code: `<ChatButton\n  floating={false}\n  label="Support"\n/>`,
    props: {
      label: "Support",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
  },
  {
    label: "Custom icon",
    code: `<ChatButton\n  floating={false}\n  icon={<RocketIcon />}\n  buttonColor="#7c3aed"\n/>`,
    props: {
      buttonColor: "#7c3aed",
      iconColor: "#ffffff",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
        </svg>
      ),
    },
  },
];

export function ChatButtonShowcase({ supabaseUrl, supabaseAnonKey, currentUser, onOpenChat }: ChatButtonShowcaseProps) {
  return (
    <section className="cb-showcase" id="chatbutton">
      <div className="container">
        <h2 className="section-title">Fully Customizable ChatButton</h2>
        <p className="section-sub">
          Color, icon, size, badge — everything via props. Drop it anywhere in your layout.
        </p>

        <div className="cb-showcase__grid">
          {VARIANTS.map((v, i) => (
            <div className="cb-showcase__card" key={i}>
              <div className="cb-showcase__preview">
                <ChatButton
                  supabaseUrl={supabaseUrl}
                  supabaseAnonKey={supabaseAnonKey}
                  userData={currentUser ?? undefined}
                  floating={false}
                  onClick={onOpenChat}
                  {...v.props}
                />
              </div>
              <pre className="cb-showcase__code"><code>{v.code}</code></pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
