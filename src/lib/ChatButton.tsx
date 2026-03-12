import { MessageCircle } from "lucide-react";
import type { ChatButtonProps } from "./types";

const sizeMap = {
  sm: { button: "h-10 w-10", icon: "h-5 w-5", badge: "h-4 w-4 text-[9px] -top-0.5 -right-0.5" },
  md: { button: "h-14 w-14", icon: "h-6 w-6", badge: "h-5 w-5 text-[10px] -top-1 -right-1" },
  lg: { button: "h-16 w-16", icon: "h-7 w-7", badge: "h-6 w-6 text-[11px] -top-1 -right-1" },
};

export const ChatButton = ({
  onClick,
  href,
  position = "bottom-right",
  unreadCount = 0,
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
