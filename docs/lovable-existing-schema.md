# Lovable Projects — Adding Chat When You Already Have a profiles Table

**Best for:**
- Lovable + Supabase projects where Lovable already generated a `profiles` table
- Any project with an existing `profiles` table that would conflict with the standard migrations

---

## The Problem

Lovable-generated projects include a `profiles` table:

```sql
-- Typical Lovable-generated schema
CREATE TABLE profiles (
  id         UUID REFERENCES auth.users PRIMARY KEY,
  username   TEXT UNIQUE,
  full_name  TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ
);
```

Running the standard quick-chat-react migrations will fail with:

```
ERROR: relation "profiles" already exists
```

---

## The Solution: Additive Migration

Instead of the standard migration files, run the single additive migration:

```
supabase/migrations/additive-for-existing-profiles.sql
```

This migration:
- **Does NOT** drop or recreate your `profiles` table
- **Adds** the chat-specific columns (`display_name`, `bio`, `is_online`, `last_seen`) to your existing table using `ADD COLUMN IF NOT EXISTS`
- **Backfills** `display_name` from `full_name` for all existing rows
- **Installs a sync trigger** that keeps `full_name` and `display_name` in sync — write to either column and both stay consistent
- **Creates all other chat tables** (`contacts`, `conversations`, `messages`, etc.) which don't conflict with Lovable schemas
- **Creates storage buckets** idempotently — safe if `avatars` already exists

---

## Step-by-Step

### Step 1 — Run the additive migration

In Supabase → **SQL Editor**, paste the entire contents of [`additive-for-existing-profiles.sql`](../supabase/migrations/additive-for-existing-profiles.sql) and run it.

**Do not run the other migration files** — the additive migration covers everything.

### Step 2 — Verify the migration

In Supabase → **Table Editor**, open your `profiles` table. You should see four new columns: `display_name`, `bio`, `is_online`, `last_seen`. If your table had rows with `full_name` populated, `display_name` should already be backfilled.

### Step 3 — Use external auth

Your Lovable project already has Supabase Auth set up. Follow the [External Auth guide](./external-auth.md) to pass your existing session to QuickChat.

Short version:

```tsx
import { QuickChat } from "quick-chat-react";
import { useExternalChatAuth } from "@/hooks/useExternalChatAuth"; // see external-auth.md

const chatUser = useExternalChatAuth();

<QuickChat
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  authMode="external"
  userData={chatUser}
/>
```

---

## Profile Sync: automatic via the sync trigger

After running the additive migration, a database trigger keeps `full_name` and `display_name` in sync:

- When your Lovable app **writes `full_name`** → `display_name` is updated automatically
- When the chat **writes `display_name`** → `full_name` is updated automatically

No code changes needed in your existing Lovable app — it continues using `full_name` as before, and the chat always sees the correct `display_name`.

### At signup: make sure `full_name` is set

If your Lovable app uses Supabase's signup and sets `full_name` in user metadata, the `handle_new_user` trigger will populate `display_name` automatically:

```ts
// Lovable-style signup — full_name in metadata works out of the box
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: user.name, avatar_url: user.avatarUrl },
  },
});
```

The trigger fallback chain: `display_name → full_name → email prefix`. At least one of the first two should be set so users don't appear in chat with just their email username.

---

## What Changes in Your Schema

| Change | Details |
|---|---|
| `profiles.display_name` added | TEXT, NOT NULL, DEFAULT `''`. Backfilled from `full_name`. |
| `profiles.bio` added | TEXT, DEFAULT `''`. |
| `profiles.is_online` added | BOOLEAN, DEFAULT `false`. |
| `profiles.last_seen` added | TIMESTAMPTZ, DEFAULT `now()`. |
| `profiles.created_at` added | TIMESTAMPTZ (if not already present). |
| `profiles.updated_at` added | TIMESTAMPTZ (if not already present). |
| Sync trigger installed | `trg_sync_profile_names` on `profiles` table. |
| Auth trigger replaced | `handle_new_user` updated to use `ON CONFLICT DO UPDATE` — safe for existing rows. |
| 7 new tables created | `contacts`, `conversations`, `conversation_members`, `messages`, `message_reads`, `message_reactions`, `user_roles`. |
| Storage buckets | `avatars` and `chat-media` created (no-op if `avatars` already exists). |

Your existing columns (`username`, `full_name`, custom columns) are **untouched**. Your existing RLS policies on `profiles` are preserved for non-chat operations, and the chat-specific policies are added alongside them.

---

## Next Steps

- [External auth guide](./external-auth.md) — full details on session extraction and token refresh
- [Props reference](../README.md#props-reference) — theme, height, feature flags
