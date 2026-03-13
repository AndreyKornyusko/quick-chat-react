import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/QuickChatProvider";
import type { UserData } from "@/lib/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authMode: "built-in" | "external";
  signOut: () => Promise<void>;
}

interface ExternalAuthProviderProps {
  children: React.ReactNode;
  userData?: UserData;
  supabase: ReturnType<typeof useSupabase>;
}

const ExternalAuthProvider: React.FC<ExternalAuthProviderProps> = ({ children, userData, supabase }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData) { setLoading(false); return; }
    if (!userData.accessToken) {
      console.warn(
        "[QuickChat] authMode='external' — userData.accessToken is missing. " +
        "auth.uid() will be NULL and DB/storage operations will fail. " +
        "Generate a Supabase JWT via the Admin API for full functionality."
      );
      setLoading(false);
      return;
    }
    if (!userData.refreshToken) {
      console.warn(
        "[QuickChat] authMode='external' — userData.refreshToken is missing. " +
        "Proceeding without a full Supabase session; token refresh will not work. " +
        "Pass refreshToken alongside accessToken for full functionality."
      );
      setLoading(false);
      return;
    }
    supabase.auth
      .setSession({ access_token: userData.accessToken, refresh_token: userData.refreshToken })
      .then(({ data, error }) => {
        if (error) { setSessionError(error.message); console.error("[QuickChat] Failed to set Supabase session:", error.message); }
        else { setSession(data.session); }
      })
      .finally(() => setLoading(false));
  }, [userData?.accessToken, supabase]);

  if (sessionError) {
    return (
      <div style={{ padding: 16, color: "red", fontFamily: "sans-serif" }}>
        <strong>QuickChat config error:</strong> {sessionError}
      </div>
    );
  }

  const fakeUser = userData
    ? ({ id: userData.id, email: userData.email ?? "", user_metadata: { display_name: userData.name, avatar_url: userData.avatar } } as unknown as User)
    : null;

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{ session, user: fakeUser, loading, authMode: "external", signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  authMode: "built-in",
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

  // External auth mode: delegate to ExternalAuthProvider which calls setSession
  if (authMode === "external") {
    return <ExternalAuthProvider userData={userData} supabase={supabase}>{children}</ExternalAuthProvider>;
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, authMode: "built-in", signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
