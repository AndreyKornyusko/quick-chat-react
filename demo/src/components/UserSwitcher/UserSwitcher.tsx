import { useState, useEffect, useRef } from "react";
import type { UserData } from "quick-chat-react";
import "./UserSwitcher.css";

interface UserSwitcherProps {
  currentUser: UserData | null;
  users: UserData[];
  onLogin: (user: UserData) => Promise<void> | void;
  onLogout: () => void;
}

export function UserSwitcher({ currentUser, users, onLogin, onLogout }: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loggingInEmail, setLoggingInEmail] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div className="user-switcher" ref={containerRef}>
      <button
        className="user-switcher__trigger"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {currentUser ? (
          <>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="user-switcher__trigger-avatar"
            />
            <span>{currentUser.name.split(" ")[0]}</span>
          </>
        ) : (
          <span>Demo Login</span>
        )}
        <span className="user-switcher__trigger-caret">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="user-switcher__dropdown" role="listbox">
          <p className="user-switcher__label">Switch demo user</p>
          {users.map((user) => (
            <button
              key={user.id}
              className="user-switcher__option"
              role="option"
              aria-selected={currentUser?.email === user.email}
              disabled={loggingInEmail !== null}
              onClick={async () => {
                setLoggingInEmail(user.email!);
                await onLogin(user);
                setLoggingInEmail(null);
                setIsOpen(false);
              }}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="user-switcher__option-avatar"
              />
              <span className="user-switcher__option-info">
                <strong className="user-switcher__option-name">{user.name}</strong>
                <small className="user-switcher__option-role">{user.description}</small>
              </span>
              {loggingInEmail === user.email ? (
                <span className="user-switcher__check">...</span>
              ) : currentUser?.email === user.email ? (
                <span className="user-switcher__check">✓</span>
              ) : null}
            </button>
          ))}
          {currentUser && (
            <>
              <hr className="user-switcher__divider" />
              <button
                className="user-switcher__logout"
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
