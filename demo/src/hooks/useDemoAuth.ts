import { useState } from "react";
import type { UserData } from "quick-chat-react";

export function useDemoAuth() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    try {
      const raw = localStorage.getItem("demo_user");
      return raw ? (JSON.parse(raw) as UserData) : null;
    } catch {
      return null;
    }
  });

  const login = (user: UserData) => {
    setCurrentUser(user);
    localStorage.setItem("demo_user", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("demo_user");
  };

  return { currentUser, login, logout };
}
