"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

const links = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/dashboard", icon: MessageSquare, label: "Chat" },
];

interface MobileNavProps {
  onChatClick?: () => void;
  unreadCount?: number;
}

export function MobileNav({ onChatClick, unreadCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const isChatLink = href === "/dashboard";

          return (
            <button
              key={href}
              onClick={isChatLink && onChatClick ? onChatClick : undefined}
              aria-label={label}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative min-h-[44px] transition-colors",
                isActive
                  ? "text-indigo-600"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {isChatLink && !onChatClick ? (
                <Link href={href} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        count={unreadCount}
                        className="absolute -top-2 -right-2 h-4 min-w-4 text-[10px]"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              ) : (
                <>
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {isChatLink && unreadCount > 0 && (
                      <Badge
                        count={unreadCount}
                        className="absolute -top-2 -right-2 h-4 min-w-4 text-[10px]"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
