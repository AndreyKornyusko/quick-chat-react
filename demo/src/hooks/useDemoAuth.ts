import { useState, useEffect } from "react";
import type { UserData } from "quick-chat-react";
import { supabase } from "../lib/supabase";
import { MOCK_USERS } from "../data/mockUsers";

// Shared password for all demo users. Never used in production.
const DEMO_PASSWORD = "demo-quickchat-2024";

export function useDemoAuth() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore an existing Supabase session (persisted by the SDK).
  // Also subscribes to onAuthStateChange so refreshed tokens are forwarded to
  // the chat library automatically — without this, the session silently expires.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const mockUser = MOCK_USERS.find((u) => u.email === session.user.email);
        if (mockUser) {
          setCurrentUser({
            ...mockUser,
            id: session.user.id,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          });
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) return;
        setCurrentUser((prev) => {
          if (!prev) return prev;
          // Refresh tokens while keeping the rest of the user data intact
          return {
            ...prev,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          };
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (user: UserData) => {
    // Users are pre-created by the seed script (npm run seed).
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: DEMO_PASSWORD,
    });

    if (error || !data.session) {
      console.error(
        "[Demo] Login failed:", error?.message ?? "No session.",
        "Run `npm run seed` in the demo folder to provision demo users."
      );
      return;
    }

    setCurrentUser({
      ...user,
      id: data.session.user.id,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return { currentUser, login, logout, loading };
}
