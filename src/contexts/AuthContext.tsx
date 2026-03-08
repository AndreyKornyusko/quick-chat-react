import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/QuickChatProvider";
import type { UserData } from "@/lib/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  authMode?: "built-in" | "external";
  userData?: UserData;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, authMode = "built-in", userData }) => {
  const supabase = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(authMode === "built-in");

  useEffect(() => {
    if (authMode === "external") return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, authMode]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // External auth mode: create a fake user object from userData
  if (authMode === "external" && userData) {
    const fakeUser = {
      id: userData.id,
      email: userData.email ?? "",
      user_metadata: {
        display_name: userData.name,
        avatar_url: userData.avatar,
      },
    } as unknown as User;

    return (
      <AuthContext.Provider value={{ session: null, user: fakeUser, loading: false, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
