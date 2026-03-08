import React, { createContext, useContext, useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import type { QuickChatConfig } from "./types";

interface QuickChatContextValue {
  supabase: SupabaseClient<Database>;
  config: QuickChatConfig;
}

const QuickChatContext = createContext<QuickChatContextValue | null>(null);

export const useQuickChat = () => {
  const ctx = useContext(QuickChatContext);
  if (!ctx) throw new Error("useQuickChat must be used within QuickChatProvider");
  return ctx;
};

export const useSupabase = () => useQuickChat().supabase;
export const useConfig = () => useQuickChat().config;

const queryClient = new QueryClient();

interface QuickChatProviderProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  config: QuickChatConfig;
  children: React.ReactNode;
}

export const QuickChatProvider = ({ supabaseUrl, supabaseAnonKey, config, children }: QuickChatProviderProps) => {
  const supabase = useMemo(
    () =>
      createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: { storage: typeof window !== "undefined" ? localStorage : undefined, persistSession: true, autoRefreshToken: true },
      }),
    [supabaseUrl, supabaseAnonKey]
  );

  const value = useMemo(() => ({ supabase, config }), [supabase, config]);

  return (
    <QueryClientProvider client={queryClient}>
      <QuickChatContext.Provider value={value}>
        {children}
      </QuickChatContext.Provider>
    </QueryClientProvider>
  );
};
