import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { Sun, Moon, Monitor, User, LogOut, LogIn } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { UserAvatarProps } from "./types";

const sizeMap = {
  sm: { avatar: "h-8 w-8", fallback: "text-xs" },
  md: { avatar: "h-10 w-10", fallback: "text-sm" },
  lg: { avatar: "h-12 w-12", fallback: "text-base" },
};

const positionMap = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "…";
}

// --- Internal profile dialog (read-only, no context deps) ---

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: { display_name: string; avatar_url: string | null; bio: string | null } | null;
  email: string;
}

function ProfileReadOnlyDialog({ open, onOpenChange, profile, email }: ProfileDialogProps) {
  const displayName = profile?.display_name ?? "";
  const initials = getInitials(displayName || email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription className="sr-only">User profile details</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl font-semibold">{initials}</AvatarFallback>
          </Avatar>
          {displayName && (
            <p className="text-lg font-semibold text-center">{displayName}</p>
          )}
          {email && (
            <p className="text-sm text-muted-foreground text-center">{email}</p>
          )}
          {profile?.bio && (
            <p className="text-sm text-center text-foreground/80 max-w-xs">{profile.bio}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main component ---

export const UserAvatar = ({
  supabaseUrl,
  supabaseAnonKey,
  userData,
  authMode = "built-in",
  showName = false,
  size = "md",
  floating = false,
  position = "top-right",
  nameMaxLength = 20,
  onThemeChange,
  onProfileClick,
  onLogout,
  onLogin,
  className,
  style,
}: UserAvatarProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(authMode === "built-in");
  const [profile, setProfile] = useState<{
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
  } | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark" | "system">(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("chat-theme") as "light" | "dark" | "system") || "system";
  });
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }, [supabaseUrl, supabaseAnonKey]);

  // Built-in auth: subscribe to session changes
  useEffect(() => {
    if (authMode !== "built-in" || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, authMode]);

  // External auth: set session from provided tokens
  useEffect(() => {
    if (authMode !== "external" || !supabase) return;
    if (!userData?.accessToken || !userData?.refreshToken) return;
    supabase.auth.setSession({
      access_token: userData.accessToken,
      refresh_token: userData.refreshToken,
    });
  }, [supabase, authMode, userData?.accessToken, userData?.refreshToken]);

  // Fetch profile from Supabase profiles table
  useEffect(() => {
    const userId = authMode === "external" ? userData?.id : session?.user?.id;
    if (!supabase || !userId) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    supabase
      .from("profiles")
      .select("display_name, avatar_url, bio")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data ?? null);
      });

    return () => { cancelled = true; };
  }, [supabase, session?.user?.id, userData?.id, authMode]);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyTheme = (t: "light" | "dark" | "system") => {
      const resolved =
        t === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : t;
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const avatarUrl = profile?.avatar_url ?? userData?.avatar ?? null;
  const displayName = profile?.display_name ?? userData?.name ?? "";
  const email = session?.user?.email ?? userData?.email ?? "";
  const isLoggedIn = authMode === "built-in" ? session !== null : !!userData?.id;
  const initials = getInitials(displayName || email);

  const handleThemeChange = (value: string) => {
    const t = value as "light" | "dark" | "system";
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem("chat-theme", t);
    onThemeChange?.(t);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    onLogout?.();
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      setProfileDialogOpen(true);
    }
  };

  if (authMode === "built-in" && authLoading) return null;

  const s = sizeMap[size];
  const floatingClass = floating
    ? `fixed ${positionMap[position]} z-50`
    : "relative";

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`${floatingClass} flex items-center gap-2 rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer${className ? ` ${className}` : ""}`}
            style={style as CSSProperties}
            aria-label={displayName || "User menu"}
          >
            <Avatar className={s.avatar}>
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className={`font-medium ${s.fallback}`}>{initials}</AvatarFallback>
            </Avatar>
            {showName && displayName && (
              <span className="max-w-[120px] truncate text-sm font-medium">
                {truncateName(displayName, nameMaxLength)}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {/* Identity header */}
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className={sizeMap["sm"].avatar}>
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className={`font-medium ${sizeMap["sm"].fallback}`}>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              {displayName && (
                <span className="text-sm font-medium truncate">{displayName}</span>
              )}
              {email && (
                <span className="text-xs text-muted-foreground truncate">{email}</span>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            My Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ThemeIcon className="mr-2 h-4 w-4" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
                <DropdownMenuRadioItem value="light">
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {authMode === "built-in" && (
            <>
              <DropdownMenuSeparator />
              {isLoggedIn ? (
                <DropdownMenuItem
                  onSelect={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => onLogin?.()}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileReadOnlyDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        profile={profile}
        email={email}
      />
    </>
  );
};
