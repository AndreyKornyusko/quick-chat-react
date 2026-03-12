import { useEffect, useRef } from "react";
import { ChatButton } from "quick-chat-react";
import type { UserData } from "quick-chat-react";
import { UserSwitcher } from "../UserSwitcher/UserSwitcher";
import "./Header.css";

interface HeaderProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  currentUser: UserData | null;
  onOpenChat: () => void;
  onLogin: (user: UserData) => void;
  onLogout: () => void;
  users: UserData[];
}

export function Header({ supabaseUrl, supabaseAnonKey, currentUser, onOpenChat, onLogin, onLogout, users }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);

  // Add shadow when page is scrolled
  useEffect(() => {
    const handler = () => {
      headerRef.current?.classList.toggle("header--scrolled", window.scrollY > 4);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className="header" ref={headerRef}>
      <div className="container header__inner">
        <a href="#" className="header__logo">
           My Amazing Startup
        </a>

        <nav className="header__nav">
          <a href="#features">Features</a>
          <a href="#team">Team</a>
          <a
            href="https://github.com/andreikornusko/quick-chat-react"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>

        <div className="header__actions">
          <UserSwitcher
            currentUser={currentUser}
            users={users}
            onLogin={onLogin}
            onLogout={onLogout}
          />
          <ChatButton
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
            userData={currentUser ?? undefined}
            onClick={onOpenChat}
            size="sm"
            floating={false}
          />
        </div>
      </div>
    </header>
  );
}
