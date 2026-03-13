import { useEffect, useRef } from "react";
import { ChatButton, UserAvatar } from "quick-chat-react";
import type { UserData } from "quick-chat-react";
import { UserSwitcher } from "../UserSwitcher/UserSwitcher";
import "./Header.css";

interface HeaderProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  currentUser: UserData | null;
  onOpenChat: () => void;
  onLogin: (user: UserData) => Promise<void> | void;
  onLogout: () => void;
  users: UserData[];
  activeTab: "home" | "chat" | "docs";
  onTabChange: (tab: "home" | "chat" | "docs") => void;
}

export function Header({ supabaseUrl, supabaseAnonKey, currentUser, onOpenChat, onLogin, onLogout, users, activeTab, onTabChange }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);

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
        <button className="header__logo" onClick={() => onTabChange("home")}>
           Demo Startup
        </button>

        <nav className="header__nav">
          <button
            className={`header__tab${activeTab === "home" ? " header__tab--active" : ""}`}
            onClick={() => onTabChange("home")}
          >
            Home
          </button>
          <button
            className={`header__tab${activeTab === "chat" ? " header__tab--active" : ""}`}
            onClick={() => onTabChange("chat")}
          >
            Chat
          </button>
          <button
            className={`header__tab${activeTab === "docs" ? " header__tab--active" : ""}`}
            onClick={() => onTabChange("docs")}
          >
            Docs
          </button>
          {activeTab === "home" && (
            <>
              <a href="#features">Features</a>
              <a href="#team">Team</a>
            </>
          )}
          <a
            href="https://github.com/andreikornusko/quick-chat-react"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>

        <div className="header__actions">
          {activeTab === "home" ? (
            <>
              <UserSwitcher
                currentUser={currentUser}
                users={users}
                onLogin={onLogin}
                onLogout={onLogout}
              />
              {currentUser && (
                <ChatButton
                  supabaseUrl={supabaseUrl}
                  supabaseAnonKey={supabaseAnonKey}
                  userData={currentUser}
                  onClick={onOpenChat}
                  size="sm"
                  floating={false}
                />
              )}
            </>
          ) : (
            <UserAvatar
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              authMode="built-in"
              size="sm"
              onLogin={onOpenChat}
            />
          )}
        </div>
      </div>
    </header>
  );
}
