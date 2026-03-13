# Advanced — Separate Supabase Project for Chat

> **Simpler alternative:** If you can point both your app and the chat at the same Supabase project, do that instead — it is significantly easier. See the [External Auth guide](./external-auth.md).

**Best for:**
- Complete data isolation (chat messages never touch your main DB)
- Separate billing or project-level access control
- Main project schema conflicts that cannot be resolved with the [additive migration](./lovable-existing-schema.md)

---

## Architecture

```
User logs into your app  (Project A — your main Supabase)
        │
        ▼
Your backend  /api/chat-token
        │  1. Verify the user's session
        │  2. Provision shadow user in Project B (one-time)
        │  3. Create a Project B session
        │
        ▼
Frontend receives { accessToken, refreshToken, supabaseUserId }
        │
        ▼
<QuickChat authMode="external" userData={...} />  (Project B)
```

**You need:** a backend service — a Next.js API route, a Supabase Edge Function, or any Node.js endpoint.

---

## Step 1 — Set Up the Chat Supabase Project (Project B)

1. Create a new Supabase project — this is your dedicated chat project.
2. Run the standard migrations from [`/supabase/migrations/`](../supabase/migrations/) in filename order.
3. Copy the **Project URL**, **anon key**, and **service role key** from Project B's Settings → API.

Add to your backend environment:
```
CHAT_SUPABASE_URL=https://your-chat-project.supabase.co
CHAT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # backend only — never expose to frontend
```

Add to your frontend environment:
```
NEXT_PUBLIC_CHAT_SUPABASE_URL=https://your-chat-project.supabase.co
NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY=your-anon-key       # safe to expose
```

---

## Step 2 — Backend: Admin Client

Create an admin Supabase client for Project B. Keep it server-side only:

```ts
// lib/chatAdmin.ts  (server only — never import this in frontend code)
import { createClient } from "@supabase/supabase-js";

export const chatAdmin = createClient(
  process.env.CHAT_SUPABASE_URL!,
  process.env.CHAT_SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

---

## Step 3 — Backend: User Provisioning

Every user needs a "shadow" account in Project B. Create it once when the user first opens chat, then reuse the same account on every subsequent request.

Store the mapping between your app's user ID and the Project B UUID in your main database:

```sql
-- In your main app database (Project A)
CREATE TABLE chat_user_mappings (
  app_user_id      TEXT PRIMARY KEY,   -- your user's ID (any format)
  supabase_chat_id UUID NOT NULL UNIQUE,
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

```ts
// lib/chatProvisioning.ts  (server only)
import { chatAdmin } from "./chatAdmin";
import { db } from "./db"; // your main DB client

export async function getOrCreateChatUser(appUser: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}): Promise<string> {
  // 1. Check mapping table
  const existing = await db.chatUserMappings.findOne({ appUserId: appUser.id });
  if (existing) return existing.supabaseChatId;

  // 2. Create shadow user in Project B
  const { data, error } = await chatAdmin.auth.admin.createUser({
    email: appUser.email,
    email_confirm: true,   // skip confirmation email
    user_metadata: {
      display_name: appUser.name,     // REQUIRED — populates profiles.display_name via trigger
      avatar_url: appUser.avatarUrl,
    },
  });
  if (error) throw error;

  const supabaseChatId = data.user.id;

  // 3. Store mapping
  await db.chatUserMappings.create({ appUserId: appUser.id, supabaseChatId });

  return supabaseChatId;
}
```

---

## Step 4 — Backend: `/api/chat-token` Endpoint

```ts
// app/api/chat-token/route.ts  (Next.js App Router example)
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { chatAdmin } from "@/lib/chatAdmin";
import { getOrCreateChatUser } from "@/lib/chatProvisioning";

// Your MAIN Supabase project — for verifying the caller's session
const mainSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  // 1. Verify the caller is logged into your app
  const authHeader = req.headers.get("Authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error: authError } = await mainSupabase.auth.getUser(accessToken);
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Get or create the shadow user in the chat project
  const chatUserId = await getOrCreateChatUser({
    id: user.id,
    email: user.email!,
    name: user.user_metadata.display_name ?? user.user_metadata.full_name ?? user.email!,
    avatarUrl: user.user_metadata.avatar_url,
  });

  // 3. Create a session in the chat project
  //    createSession() returns a real access_token + refresh_token pair
  const { data: sessionData, error: sessionError } = await chatAdmin.auth.admin.createSession(chatUserId);
  if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 });

  return NextResponse.json({
    supabaseUserId: chatUserId,
    accessToken: sessionData.session.access_token,
    refreshToken: sessionData.session.refresh_token,
    expiresAt: sessionData.session.expires_at,
  });
}
```

---

## Step 5 — Frontend: Fetch Chat Token and Pass to QuickChat

```tsx
// hooks/useSeparateProjectChat.ts
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // your main project client
import type { UserData } from "quick-chat-react";

export function useSeparateProjectChat() {
  const [chatUser, setChatUser] = useState<UserData | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchChatToken(session.access_token, session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) fetchChatToken(session.access_token, session.user);
        else setChatUser(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchChatToken(mainAccessToken: string, user: { email: string | undefined; user_metadata: Record<string, string> }) {
    const res = await fetch("/api/chat-token", {
      method: "POST",
      headers: { Authorization: `Bearer ${mainAccessToken}` },
    });
    if (!res.ok) return;

    const { supabaseUserId, accessToken, refreshToken } = await res.json();

    setChatUser({
      id: supabaseUserId,                                   // Project B's UUID — not Project A's
      name: user.user_metadata.display_name
         ?? user.user_metadata.full_name
         ?? user.email!,
      avatar: user.user_metadata.avatar_url,
      email: user.email,
      accessToken,
      refreshToken,
    });
  }

  return chatUser;
}
```

```tsx
// In your component
import { QuickChat } from "quick-chat-react";
import { useSeparateProjectChat } from "@/hooks/useSeparateProjectChat";

export function ChatPage() {
  const chatUser = useSeparateProjectChat();

  if (!chatUser) return null;

  return (
    <QuickChat
      supabaseUrl={process.env.NEXT_PUBLIC_CHAT_SUPABASE_URL!}   // Project B URL
      supabaseAnonKey={process.env.NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY!}
      authMode="external"
      userData={chatUser}
    />
  );
}
```

---

## Profile Sync

Because the chat runs on a separate project, profile updates in your main app do not automatically sync to the chat's `profiles` table. Update it from your backend whenever the user changes their name or avatar:

```ts
// Call from your profile update endpoint, alongside updating your main DB
await chatAdmin.from("profiles").update({
  display_name: newName,
  avatar_url: newAvatarUrl,
}).eq("id", chatUserId); // Project B UUID from your mapping table
```

---

## Token Refresh

Chat tokens expire after 1 hour (Supabase default). To refresh proactively:

```ts
// After fetchChatToken, schedule a refresh 5 minutes before expiry
const expiresAt = sessionData.expiresAt * 1000; // convert to ms
const refreshIn = expiresAt - Date.now() - 5 * 60 * 1000;

const timer = setTimeout(() => fetchChatToken(currentMainToken, currentUser), refreshIn);
// Clear timer on cleanup
```

---

## Security Notes

- **Never expose `CHAT_SUPABASE_SERVICE_ROLE_KEY` on the frontend.** It bypasses all RLS.
- **`NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY` is safe to expose.** All access is controlled by RLS.
- Shadow users in Project B have no password — they can only receive sessions through your `/api/chat-token` endpoint. Disable Supabase Auth email login in Project B's dashboard to close any login-form attack surface.

---

## Next Steps

- [Props reference](../README.md#props-reference) — theme, height, feature flags
- [External auth guide](./external-auth.md) — the simpler same-project alternative
