import { CSSProperties, ReactNode } from "react";

export interface UserData {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  email?: string;
  /**
   * Supabase JWT access token for this user.
   * Required when authMode is 'external' — without it auth.uid() is NULL and all DB/storage operations fail.
   * 
   * Same Supabase project: pass session.access_token directly from supabase.auth.getSession().
   * Separate Supabase project: generate via supabase.auth.admin.createSession(userId) on your backend.
   */
  accessToken?: string;
  /**
   * Supabase refresh token for this user.
   * Required alongside accessToken — omitting it disables automatic token refresh,
   * causing the session to silently expire after 1 hour.
   *
   * Same Supabase project: pass session.refresh_token from supabase.auth.getSession().
   * Separate Supabase project: use the refresh_token returned by supabase.auth.admin.createSession().
   */
  refreshToken?: string;
}

export interface QuickChatConfig {
  showGroups: boolean;
  allowVoiceMessages: boolean;
  allowFileUpload: boolean;
  allowReactions: boolean;
  showOnlineStatus: boolean;
  showReadReceipts: boolean;
}

export interface QuickChatProps {
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anon/publishable key */
  supabaseAnonKey: string;
  /** User data (required when authMode is 'external') */
  userData?: UserData;
  /** UI color theme */
  theme?: "light" | "dark" | "system";
  /** Use built-in Supabase auth or pass your own user data */
  authMode?: "built-in" | "external";
  /** Show group conversations in sidebar */
  showGroups?: boolean;
  /** Enable voice message recording */
  allowVoiceMessages?: boolean;
  /** Enable file and photo uploads */
  allowFileUpload?: boolean;
  /** Enable emoji reactions on messages */
  allowReactions?: boolean;
  /** Show green online indicator dots */
  showOnlineStatus?: boolean;
  /** Show read receipt checkmarks */
  showReadReceipts?: boolean;
  /** Container height CSS value */
  height?: string;
  /** Container width CSS value */
  width?: string;
  /** Callback fired when unread message count changes */
  onUnreadCountChange?: (count: number) => void;
  /** Callback fired when a conversation is selected */
  onConversationSelect?: (id: string) => void;
}

export interface UserAvatarProps {
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anon/publishable key */
  supabaseAnonKey: string;
  /** User data (required when authMode is 'external') */
  userData?: UserData;
  /** Use built-in Supabase auth or pass your own user data */
  authMode?: "built-in" | "external";
  /** Show display name next to avatar (default: false) */
  showName?: boolean;
  /** Avatar size variant (default: "md") */
  size?: "sm" | "md" | "lg";
  /** Render as a fixed floating element (default: false — inline) */
  floating?: boolean;
  /** Fixed position on screen (only used when floating=true, default: "top-right") */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Max characters for name display before truncation (default: 20) */
  nameMaxLength?: number;
  /** Callback fired when theme changes */
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  /** Override default profile dialog with custom handler */
  onProfileClick?: () => void;
  /** Callback fired after sign out completes */
  onLogout?: () => void;
  /** Called when user clicks "Sign in" (built-in mode, not logged in) */
  onLogin?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles applied to the trigger element */
  style?: CSSProperties;
}

export interface ChatButtonProps {
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anon/publishable key */
  supabaseAnonKey: string;
  /** User data for fetching unread count */
  userData?: UserData;
  /** Custom click handler */
  onClick?: () => void;
  /** URL to navigate to on click */
  href?: string;
  /** Fixed position on screen (only used when floating=true) */
  position?: "bottom-right" | "bottom-left";
  /** Render as a fixed floating button (default: true). Set false to use inline inside a layout. */
  floating?: boolean;
  /** Manually override unread count badge */
  unreadCount?: number;
  /** Button size variant */
  size?: "sm" | "md" | "lg";
  /** Badge background color (CSS color value) */
  badgeColor?: string;
  /** Custom icon element */
  icon?: ReactNode;
  /** Additional CSS class names appended to the button element */
  className?: string;
  /** Inline styles applied to the button element */
  style?: CSSProperties;
  /** Button background color — overrides the default primary color (CSS color value) */
  buttonColor?: string;
  /** Icon / foreground color — overrides the default primary-foreground color (CSS color value) */
  iconColor?: string;
  /** Accessible label for the button (default: "Open chat") */
  label?: string;
}
