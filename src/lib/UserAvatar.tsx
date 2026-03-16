import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { Sun, Moon, Monitor, User, LogOut, LogIn, Camera, Pencil, X, Check, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

// --- Editable profile dialog ---

type ProfileData = { display_name: string; avatar_url: string | null; bio: string | null };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = ReturnType<typeof createClient<any>>;

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  email: string;
  supabase: AnySupabaseClient;
  onProfileSaved?: (profile: ProfileData) => void;
}

function ProfileEditDialog({ open, onOpenChange, userId, email, supabase, onProfileSaved }: ProfileEditDialogProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setError(null);
    supabase
      .from("profiles")
      .select("display_name, avatar_url, bio")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setProfile(data ?? null);
        setLoading(false);
      });
  }, [open, userId, supabase]);

  // Reset edit state when dialog closes
  useEffect(() => {
    if (!open) setEditing(false);
  }, [open]);

  const initials = getInitials(profile?.display_name || email);

  const startEdit = () => {
    if (!profile) return;
    setDisplayName(profile.display_name);
    setBio(profile.bio ?? "");
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || profile?.display_name, bio })
        .eq("id", userId);
      if (error) throw error;
      const updated: ProfileData = { ...profile!, display_name: displayName.trim() || profile!.display_name, bio };
      setProfile(updated);
      onProfileSaved?.(updated);
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const ALLOWED: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    if (!ALLOWED[file.type]) {
      setError("Only JPEG, PNG, GIF, and WebP are allowed.");
      e.target.value = "";
      return;
    }

    const ext = ALLOWED[file.type];
    const path = `${userId}/avatar.${ext}`;
    setUploading(true);
    try {
      await supabase.storage.from("avatars").remove([path]);
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);
      if (updateError) throw updateError;

      const updated: ProfileData = { ...profile!, avatar_url: avatarUrl };
      setProfile(updated);
      onProfileSaved?.(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Profile</DialogTitle>
        <DialogDescription className="sr-only">View and edit your profile</DialogDescription>

        {/* Header with avatar */}
        <div className="relative flex flex-col items-center pt-8 pb-4 bg-primary/10">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : editing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="ua-displayName">Display name</Label>
                <Input
                  id="ua-displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ua-bio">Bio</Label>
                <Textarea
                  id="ua-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell about yourself…"
                  rows={3}
                  maxLength={500}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{profile?.display_name}</h3>
                {email && <p className="text-sm text-muted-foreground">{email}</p>}
              </div>
              {profile?.bio && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm">{profile.bio}</p>
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button variant="outline" size="sm" className="w-full" onClick={startEdit}>
                <Pencil className="h-4 w-4 mr-2" /> Edit profile
              </Button>
            </>
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
  const [profile, setProfile] = useState<ProfileData | null>(null);
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
  const userId = authMode === "external" ? userData?.id : session?.user?.id;
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

      {supabase && userId && (
        <ProfileEditDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          userId={userId}
          email={email}
          supabase={supabase}
          onProfileSaved={(updated) => setProfile(updated)}
        />
      )}
    </>
  );
};
