import { useMemo } from "react";
import { QuickChatProvider } from "./QuickChatProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import type { QuickChatProps, QuickChatConfig } from "./types";
import ChatApp from "@/pages/ChatApp";
import Auth from "@/pages/Auth";

const QuickChatInner = ({
  authMode,
  userData,
  height,
  width,
  mobileLayout,
  onUnreadCountChange,
  onConversationSelect,
}: Pick<QuickChatProps, "authMode" | "userData" | "height" | "width" | "mobileLayout" | "onUnreadCountChange" | "onConversationSelect">) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-background" style={{ height, width }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (authMode === "built-in" && !user) return <Auth />;

  return (
    <div style={{ height, width }}>
      <ChatApp
        mobileLayout={mobileLayout}
        onUnreadCountChange={onUnreadCountChange}
        onConversationSelect={onConversationSelect}
      />
    </div>
  );
};

export const QuickChat = ({
  supabaseUrl,
  supabaseAnonKey,
  userData,
  theme = "system",
  authMode = "built-in",
  showGroups = true,
  allowVoiceMessages = true,
  allowFileUpload = true,
  allowReactions = true,
  showOnlineStatus = true,
  showReadReceipts = true,
  height = "100vh",
  width = "100%",
  mobileLayout,
  onUnreadCountChange,
  onConversationSelect,
  onUploadFile,
}: QuickChatProps) => {
  const config: QuickChatConfig = useMemo(
    () => ({ showGroups, allowVoiceMessages, allowFileUpload, allowReactions, showOnlineStatus, showReadReceipts, onUploadFile }),
    [showGroups, allowVoiceMessages, allowFileUpload, allowReactions, showOnlineStatus, showReadReceipts, onUploadFile]
  );

  return (
    <QuickChatProvider supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} config={config}>
      <ThemeProvider initialTheme={theme}>
        <AuthProvider authMode={authMode} userData={userData}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <QuickChatInner
              authMode={authMode}
              userData={userData}
              height={height}
              width={width}
              mobileLayout={mobileLayout}
              onUnreadCountChange={onUnreadCountChange}
              onConversationSelect={onConversationSelect}
            />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QuickChatProvider>
  );
};
