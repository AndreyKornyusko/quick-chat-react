# External Auth — Use Your Existing Supabase Session

**Auth mode covered:** External (your app handles auth, you pass the session to the chat)

**Best for:**
- Apps already using Supabase Auth (email/password, Google, GitHub, etc.)
- When you want chat users to be the same users as your app users — no second login
- Lovable projects where you already have an auth flow set up

---

## How it works

Your app authenticates the user as normal using your Supabase client. You then extract the session tokens and pass them to `<QuickChat authMode="external">`. The library calls `supabase.auth.setSession()` internally — the user is logged into chat automatically, with no second login screen.

**Key requirement:** Your app's Supabase client and QuickChat must point to the **same Supabase project URL.** If they point to different projects, use the [separate project guide](./advanced-separate-project.md) instead.

---

## Step 1 — Run the migrations

Same as the quick-start: run the files from [`/supabase/migrations/`](../supabase/migrations/) in filename order against your Supabase project.

> **Already have a `profiles` table?** Use the [Lovable guide](./lovable-existing-schema.md) instead of the standard migration files.

## Step 2 — Build a `userData` object from your session

After your user logs in (using any Supabase auth method), extract the session:

```ts
const { data: { session } } = await supabase.auth.getSession();

const chatUser = {
  id: session.user.id,                               // Supabase UUID — do not substitute your own ID
  name: session.user.user_metadata.display_name
     ?? session.user.user_metadata.full_name          // Google OAuth stores name here
     ?? session.user.email!,
  avatar: session.user.user_metadata.avatar_url,
  email: session.user.email!,
  accessToken: session.access_token,                 // required
  refreshToken: session.refresh_token,               // required — omitting this breaks auto-refresh
};
```

> **`userData.id` must be the Supabase UUID** from `session.user.id` — not an email, not a custom ID from another system. Passing the wrong value creates a fake user object that cannot read or write any data.

## Step 3 — Pass to QuickChat

```tsx
import { QuickChat } from "quick-chat-react";

<QuickChat
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  authMode="external"
  userData={chatUser}
/>
```

---

## Step 4 — Keep tokens fresh

Supabase access tokens expire in 1 hour. The Supabase SDK refreshes them automatically, but you need to forward the new tokens to `<QuickChat>` so it stays in sync. Subscribe to session changes in your auth context or provider:

```tsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { UserData } from "quick-chat-react";

export function useExternalChatAuth() {
  const [chatUser, setChatUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Build chatUser from the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) buildChatUser(session);
    });

    // Update whenever Supabase refreshes the token or the user logs out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) buildChatUser(session);
        else setChatUser(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  function buildChatUser(session: NonNullable<typeof chatUser>) {
    setChatUser({
      id: session.user.id,
      name: session.user.user_metadata.display_name
         ?? session.user.user_metadata.full_name
         ?? session.user.email!,
      avatar: session.user.user_metadata.avatar_url,
      email: session.user.email!,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    });
  }

  return chatUser;
}
```

Use it in your component:

```tsx
const chatUser = useExternalChatAuth();

if (!chatUser) return null; // user not logged in

return (
  <QuickChat
    supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
    supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
    authMode="external"
    userData={chatUser}
  />
);
```

---

## Profile Sync

The chat reads display name and avatar from the `profiles` table (populated by the `handle_new_user` trigger at signup).

### At signup — recommended

Pass `display_name` and `avatar_url` in user metadata when the user is created. The trigger picks them up automatically — no extra code needed:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      display_name: user.name,
      avatar_url: user.avatarUrl,
    },
  },
});
```

### After a profile update

If your app lets users change their name or avatar, sync the change to the `profiles` table. The user's own session has permission to update their own row (RLS allows it):

```ts
await supabase
  .from("profiles")
  .update({
    display_name: newName,
    avatar_url: newAvatarUrl,
  })
  .eq("id", session.user.id);
```

---

## Google / GitHub OAuth

No extra steps needed. Supabase's OAuth flows put user metadata into `user_metadata` automatically:

| Provider | Name field | Avatar field |
|---|---|---|
| Google | `full_name` | `avatar_url` |
| GitHub | `user_name` | `avatar_url` |

The `handle_new_user` trigger reads `full_name` as a fallback for `display_name`, so Google OAuth users get their real name in chat without any extra configuration.

```tsx
// After supabase.auth.signInWithOAuth({ provider: "google" }) completes:
const { data: { session } } = await supabase.auth.getSession();
// session.user.user_metadata.full_name is set automatically by Supabase
```

---

## ChatButton with External Auth

Pass `userData` to `ChatButton` so it can display the unread message badge for the correct user:

```tsx
import { ChatButton } from "quick-chat-react";

<ChatButton
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  userData={chatUser}
  onClick={() => setIsChatOpen(true)}
/>
```

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Passing Firebase UID / custom ID as `userData.id` | Chat loads but shows no contacts, messages fail silently | Always use `session.user.id` (Supabase UUID) |
| Omitting `refreshToken` | Chat stops working after 1 hour | Always include `session.refresh_token` |
| Not subscribing to `onAuthStateChange` | Token expires mid-session, chat fails silently | Use the `useExternalChatAuth` hook above |
| Different Supabase project URLs | Auth works in app but fails in chat | Ensure both use the same `VITE_SUPABASE_URL` |

---

## Next Steps

- [Lovable existing schema](./lovable-existing-schema.md) — if you already have a `profiles` table
- [Separate Supabase project](./advanced-separate-project.md) — for complete data isolation
