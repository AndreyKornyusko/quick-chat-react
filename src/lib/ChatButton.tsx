import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ChatButtonProps } from "./types";

const sizeMap = {
  sm: { button: "h-10 w-10", icon: "h-5 w-5", badge: "h-4 w-4 text-[9px] -top-0.5 -right-0.5" },
  md: { button: "h-14 w-14", icon: "h-6 w-6", badge: "h-5 w-5 text-[10px] -top-1 -right-1" },
  lg: { button: "h-16 w-16", icon: "h-7 w-7", badge: "h-6 w-6 text-[11px] -top-1 -right-1" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchUnreadCount(supabase: SupabaseClient<any>, userId: string): Promise<number> {
  const { data: convMembers } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);

  const convIds = (convMembers ?? []).map((cm: { conversation_id: string }) => cm.conversation_id);
  if (convIds.length === 0) return 0;

  let total = 0;
  for (const convId of convIds) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", convId)
      .neq("sender_id", userId);

    const msgIds = (msgs ?? []).map((m: { id: string }) => m.id);
    if (msgIds.length === 0) continue;

    const { data: reads } = await supabase
      .from("message_reads")
      .select("message_id")
      .eq("user_id", userId)
      .in("message_id", msgIds);

    total += msgIds.length - ((reads ?? []).length);
  }

  return total;
}

export const ChatButton = ({
  supabaseUrl,
  supabaseAnonKey,
  userData,
  onClick,
  href,
  position = "bottom-right",
  unreadCount: unreadCountProp,
  size = "md",
  badgeColor,
  icon,
  floating = true,
  className,
  style,
  buttonColor,
  iconColor,
  label = "Open chat",
}: ChatButtonProps) => {
  const [fetchedUnreadCount, setFetchedUnreadCount] = useState(0);

  const unreadCount = unreadCountProp !== undefined ? unreadCountProp : fetchedUnreadCount;

  useEffect(() => {
    if (unreadCountProp !== undefined || !userData?.id || !supabaseUrl || !supabaseAnonKey) return;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const init = async () => {
      if (userData.accessToken && userData.refreshToken) {
        await supabase.auth.setSession({
          access_token: userData.accessToken,
          refresh_token: userData.refreshToken,
        });
      }
      const count = await fetchUnreadCount(supabase, userData.id);
      setFetchedUnreadCount(count);
    };

    init();

    const channel = supabase
      .channel("chat-button-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, async () => {
        const count = await fetchUnreadCount(supabase, userData.id);
        setFetchedUnreadCount(count);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reads" }, async () => {
        const count = await fetchUnreadCount(supabase, userData.id);
        setFetchedUnreadCount(count);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userData?.id, userData?.accessToken, supabaseUrl, supabaseAnonKey, unreadCountProp]);

  const s = sizeMap[size];
  const posClass = position === "bottom-left" ? "bottom-4 left-4" : "bottom-4 right-4";
  const floatingClass = floating ? `fixed ${posClass} z-50` : "relative";

  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (href && typeof window !== "undefined") { window.location.href = href; }
  };

  const buttonStyle = {
    ...(buttonColor ? { backgroundColor: buttonColor } : {}),
    ...(iconColor ? { color: iconColor } : {}),
    ...style,
  };

  return (
    <button
      onClick={handleClick}
      className={`${floatingClass} ${s.button} rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer${className ? ` ${className}` : ""}`}
      style={buttonStyle}
      aria-label={label}
    >
      {icon || <MessageCircle className={s.icon} />}
      {unreadCount > 0 && (
        <span
          className={`absolute ${s.badge} rounded-full font-bold flex items-center justify-center`}
          style={{ backgroundColor: badgeColor || "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};
