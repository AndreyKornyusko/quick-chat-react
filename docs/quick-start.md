# Quick Start — 10 Minutes to Working Chat

**Auth mode covered:** Built-in (the library renders its own login/signup UI)

**Best for:**
- Fresh Supabase projects with no auth yet
- Lovable projects starting from scratch
- Prototypes and internal tools where you want chat to own its own auth

---

## Prerequisites

- A [Supabase](https://supabase.com) project (free tier works fine)
- A React app with Vite or Next.js

---

## Step 1 — Install

```bash
npm install quick-chat-react
```

## Step 2 — Import the stylesheet

Add this once in your app entry point (`main.tsx`, `_app.tsx`, etc.):

```ts
import "quick-chat-react/style.css";
```

## Step 3 — Run the migrations

Go to your Supabase project → **SQL Editor** → paste and run the files from [`/supabase/migrations/`](../supabase/migrations/) **in filename order**.

> **Already have a `profiles` table?** (Common in Lovable-generated projects.) Skip the standard files and use the [Lovable guide](./lovable-existing-schema.md) instead.

The migrations create all required tables, RLS policies, storage buckets, realtime subscriptions, and the trigger that automatically creates a `profiles` row when a new user signs up.

## Step 4 — Add env vars

Add to your `.env` file (these are already present in every Lovable + Supabase project):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find them in Supabase → **Project Settings → API**.

## Step 5 — Drop in the component

```tsx
import { QuickChat } from "quick-chat-react";

export default function App() {
  return (
    <QuickChat
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
    />
  );
}
```

That's it. Users can sign up and start chatting.

---

## Optional: Floating Chat Button

If you want a floating icon button that opens chat in a modal, use `ChatButton`:

```tsx
import { ChatButton } from "quick-chat-react";

// Renders a fixed button in the bottom-right corner
<ChatButton
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  onClick={() => setIsChatOpen(true)}
/>
```

---

## Profile Display Names

By default, the chat uses the display name from `auth.users.user_metadata.display_name`. If you use Supabase's built-in signup, pass the name in options:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { display_name: "Alice" },
  },
});
```

If `display_name` is missing, the library falls back to `full_name`, then to the email prefix (`alice` from `alice@example.com`).

---

## Disable Email Confirmation (Recommended)

So users can log in immediately after signing up:

> Supabase Dashboard → **Authentication → Email** → turn off **"Confirm email"**

---

## Next Steps

- [External auth](./external-auth.md) — use your existing Supabase session instead of the built-in login UI
- [Full props reference](../README.md#props-reference) — theme, height, callbacks, and feature flags
