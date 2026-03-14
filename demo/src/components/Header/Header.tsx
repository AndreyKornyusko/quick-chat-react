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
  onLogin: (user: UserData) => Promise<void> | void;
  onLogout: () => void;
  users: UserData[];
  activeTab: "home" | "chat" | "docs";
  onTabChange: (tab: "home" | "chat" | "docs") => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Header({ supabaseUrl, supabaseAnonKey, currentUser, onOpenChat, onLogin, onLogout, users, activeTab, onTabChange, theme, onToggleTheme }: HeaderProps) {
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
          <button
            className="header__theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
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
        </div>
      </div>
    </header>
  );
}
