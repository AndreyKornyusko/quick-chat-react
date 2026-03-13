# Using quick-chat-react as a Startup Base

When you use `authMode="built-in"`, you get more than just a chat widget. You get a **complete user infrastructure** in minutes:

- **Supabase Auth** — email/password and OAuth sign-up/login, session management, JWT refresh
- **User profiles** — `profiles` table with display name, avatar, bio, online status
- **Real-time messaging** — conversations, group chats, file uploads, voice, reactions, read receipts
- **UserAvatar** — a ready-made navbar component with sign out, theme switching, and profile view

This is a solid base to launch from. The key insight: **the `profiles` table is yours.** The library only touches the columns it needs (`display_name`, `avatar_url`, `bio`, `is_online`, `last_seen`) — everything else you add is invisible to the library and completely under your control.

---

## What you get out of the box

```
Auth system         Supabase Auth (email, Google, GitHub)
User profiles       profiles table — auto-created on sign-up
Session management  JWT access + refresh tokens, auto-refresh
Real-time chat      messages, conversations, groups
File storage        Supabase Storage — avatars, chat media
Navbar component    UserAvatar — avatar, name, theme, sign out
```

All of this is production-ready on day one. You extend it — you don't rebuild it.

---

## Extending the profiles table

Add whatever columns your product needs. Run a migration in your Supabase project:

```sql
-- Example: SaaS subscription tiers + team roles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan         TEXT    DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS role         TEXT    DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS team_id      UUID    REFERENCES public.teams(id),
  ADD COLUMN IF NOT EXISTS onboarded    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone        TEXT,
  ADD COLUMN IF NOT EXISTS timezone     TEXT    DEFAULT 'UTC';
```

**Nothing breaks.** The library selects only named columns — it never uses `SELECT *`. Your new columns are ignored by the chat but fully available to your own app.

RLS is already in place from the library migration:
- `"Users can view all profiles"` — any authenticated user can read any profile
- `"Users can update own profile"` — users can only update their own row

Your custom columns are protected by the same policies automatically.

---

## Populating custom fields on sign-up

The `handle_new_user` trigger creates a `profiles` row every time a user signs up. Extend it to set your own defaults:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, plan, role, onboarded)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'free',     -- default plan
    'member',   -- default role
    false       -- not yet onboarded
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url   = COALESCE(EXCLUDED.avatar_url,   profiles.avatar_url);
  RETURN NEW;
END;
$$;
```

---

## Reading your custom fields alongside chat

Your app and the library both use the same Supabase project. Create your own client once and query whatever you need:

```tsx
// lib/supabase.ts — your app's own client (shared across your code)
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

```tsx
// hooks/useMyProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useMyProfile(userId: string | null) {
  const [profile, setProfile] = useState<{
    plan: string;
    role: string;
    onboarded: boolean;
    team_id: string | null;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("plan, role, onboarded, team_id")
      .eq("id", userId)
      .single()
      .then(({ data }) => setProfile(data));
  }, [userId]);

  return profile;
}
```

```tsx
// App.tsx — library and your own profile data side by side
import { QuickChat, UserAvatar } from "quick-chat-react";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useCurrentUserId } from "@/hooks/useCurrentUserId"; // your own hook

export default function App() {
  const userId = useCurrentUserId();
  const profile = useMyProfile(userId);

  return (
    <>
      <nav className="flex items-center justify-between px-6 h-14 border-b">
        <span className="font-semibold">My App</span>
        {profile?.plan === "pro" && (
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Pro</span>
        )}
        {/* Library component — no extra config needed */}
        <UserAvatar
          supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
          supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
          authMode="built-in"
          showName
        />
      </nav>

      {/* Library handles all chat — your custom columns are untouched */}
      <QuickChat
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
        supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
        authMode="built-in"
      />
    </>
  );
}
```

---

## Common startup patterns

### Onboarding flow

Check `onboarded` after auth and redirect new users to your setup wizard before showing the app:

```tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export function useOnboardingGuard(userId: string | null) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data && !data.onboarded) navigate("/welcome");
      });
  }, [userId, navigate]);
}
```

### Plan-based feature gating

```tsx
// Gate features on plan without touching the chat library
const profile = useMyProfile(userId);

<QuickChat
  supabaseUrl={url}
  supabaseAnonKey={key}
  authMode="built-in"
  allowVoiceMessages={profile?.plan === "pro"}
  allowFileUpload={profile?.plan !== "free"}
  showGroups={profile?.plan === "pro" || profile?.plan === "team"}
/>
```

### Team/workspace isolation

Add a `team_id` column and use Supabase RLS to restrict data by team. The chat tables (`conversations`, `messages`, etc.) can join against `profiles.team_id` via a policy — the chat library will automatically show only team-scoped conversations:

```sql
-- Example: restrict contacts search to same team
CREATE POLICY "Team members can view team profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid())
  );
```

### Updating custom fields from your app

```tsx
// Update your own fields — safe, doesn't touch chat-managed columns
await supabase
  .from("profiles")
  .update({ plan: "pro", onboarded: true })
  .eq("id", userId);
```

---

## What the library never touches

These are safe to add without any risk of conflict:

- Any column you add (`plan`, `role`, `team_id`, `phone`, `timezone`, `stripe_customer_id`, ...)
- Other tables you create (`teams`, `subscriptions`, `invoices`, `projects`, ...)
- Your own RLS policies on the `profiles` table (they stack with the library's policies)
- Your own Supabase Edge Functions and triggers

The library's surface area is fixed and documented. It will never issue `ALTER TABLE`, `DROP COLUMN`, or any destructive DDL against your schema.

---

## Summary

| What you need | What to do |
|---------------|-----------|
| Add a user field (plan, role, etc.) | `ALTER TABLE public.profiles ADD COLUMN ...` |
| Set defaults on sign-up | Extend the `handle_new_user` trigger |
| Read custom fields in your app | Query with your own Supabase client |
| Gate library features by plan | Pass feature flag props to `<QuickChat>` |
| Show user info in navbar | Use `<UserAvatar authMode="built-in" showName />` |
| Customize the profile dialog | Pass `onProfileClick` to `UserAvatar` |
