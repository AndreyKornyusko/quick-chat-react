import { ReactNode } from "react";

export interface UserData {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  email?: string;
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
  /** Badge background color */
  badgeColor?: string;
  /** Custom icon element */
  icon?: ReactNode;
}
