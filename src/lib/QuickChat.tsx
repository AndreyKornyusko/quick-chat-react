import { useMemo, CSSProperties } from "react";
import { QuickChatProvider } from "./QuickChatProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import type { QuickChatProps, QuickChatConfig } from "./types";
import ChatApp from "@/pages/ChatApp";
import Auth from "@/pages/Auth";

// Maps ThemeColorTokens keys to CSS variable names
const TOKEN_TO_CSS_VAR: Record<string, string> = {
  primary:                   "--primary",
  primaryForeground:         "--primary-foreground",
  background:                "--background",
  foreground:                "--foreground",
  muted:                     "--muted",
  mutedForeground:           "--muted-foreground",
  border:                    "--border",
  chatBubbleOut:             "--chat-bubble-out",
  chatBubbleOutForeground:   "--chat-bubble-out-foreground",
  chatBubbleIn:              "--chat-bubble-in",
  chatBubbleInForeground:    "--chat-bubble-in-foreground",
  chatGradientFrom:          "--chat-gradient-from",
  chatGradientVia:           "--chat-gradient-via",
  chatGradientTo:            "--chat-gradient-to",
};

function buildCssVars(tokens: Record<string, string | undefined> | undefined): CSSProperties {
  if (!tokens) return {};
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    const cssVar = TOKEN_TO_CSS_VAR[key];
    if (cssVar && value) vars[cssVar] = value;
  }
  return vars as CSSProperties;
}

const QuickChatInner = ({
  authMode,
  userData,
  height,
  width,
  mobileLayout,
  themeColors,
  onUnreadCountChange,
  onConversationSelect,
}: Pick<QuickChatProps, "authMode" | "userData" | "height" | "width" | "mobileLayout" | "themeColors" | "onUnreadCountChange" | "onConversationSelect">) => {
  const { user, loading } = useAuth();
  const { resolved } = useTheme();

  const cssVars = useMemo(() => {
    const tokens = resolved === "dark" ? themeColors?.dark : themeColors?.light;
    return buildCssVars(tokens as Record<string, string | undefined>);
  }, [themeColors, resolved]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-background" style={{ height, width, ...cssVars }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (authMode === "built-in" && !user) return <Auth />;

  return (
    <div style={{ height, width, ...cssVars }}>
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
  themeColors,
  authMode = "built-in",
  showGroups = true,
  allowVoiceMessages = true,
  allowFileUpload = true,
  allowReactions = true,
  showOnlineStatus = true,
  showReadReceipts = true,
  showChatBackground = true,
  height = "100vh",
  width = "100%",
  mobileLayout,
  onUnreadCountChange,
  onConversationSelect,
  onUploadFile,
}: QuickChatProps) => {
  const config: QuickChatConfig = useMemo(
    () => ({ showGroups, allowVoiceMessages, allowFileUpload, allowReactions, showOnlineStatus, showReadReceipts, showChatBackground, onUploadFile }),
    [showGroups, allowVoiceMessages, allowFileUpload, allowReactions, showOnlineStatus, showReadReceipts, showChatBackground, onUploadFile]
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
              themeColors={themeColors}
              onUnreadCountChange={onUnreadCountChange}
              onConversationSelect={onConversationSelect}
            />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QuickChatProvider>
  );
};
