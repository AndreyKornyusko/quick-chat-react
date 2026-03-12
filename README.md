# quick-chat-react

A drop-in React chat component library backed by [Supabase](https://supabase.com). Add a full-featured real-time chat to your startup in minutes — with support for your own auth system or Supabase's built-in auth.

**Features:** real-time messaging · group conversations · voice messages · file & photo uploads · emoji reactions · read receipts · online status · contact management

---

## Installation

```bash
npm install quick-chat-react
```

Import the stylesheet once in your app entry point:

```tsx
import "quick-chat-react/style.css";
```

---

## Supabase setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL migration files from [`/supabase/migrations/`](./supabase/migrations) **in filename order** using the Supabase SQL Editor or CLI. These create all required tables, RLS policies, storage buckets, realtime subscriptions, and the trigger that auto-creates a `profiles` row when a new auth user signs up.
3. Copy your **Project URL** and **anon/public key** from Project Settings → API.
4. **(Recommended)** Disable email confirmation so users (and provisioned demo/test accounts) can log in immediately:
   > Supabase Dashboard → Authentication → Email → turn off **"Confirm email"**

---

## Auth modes

The library supports two auth flows. Choose the one that fits your stack.

---

### Built-in auth

Supabase handles everything — login, signup, password reset. The component renders its own auth screens when the user is not yet signed in.

**When to use:** you don't have your own auth system, or you want the chat to manage auth independently.

```tsx
import { QuickChat } from "quick-chat-react";
import "quick-chat-react/style.css";

export default function App() {
  return (
    <QuickChat
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
      authMode="built-in"   // default — can be omitted
    />
  );
}
```

The user signs in once. Their Supabase session is stored in `localStorage` and auto-refreshed.

---

### External auth

Your app handles authentication. You pass the current user's data and a Supabase JWT access token to the component — no Supabase login screen is shown.

**When to use:** you already have users authenticated via Firebase, Auth0, Cognito, a custom backend, or any other provider.

#### How it works

1. Your backend generates a Supabase JWT for the authenticated user.
2. Your frontend passes it to `<QuickChat>` via `userData.accessToken`.
3. The library calls `supabase.auth.setSession()` with that token, establishing a real Supabase session so all Row Level Security policies work correctly.

```tsx
import { QuickChat } from "quick-chat-react";
import "quick-chat-react/style.css";

export default function ChatPage() {
  const { user } = useYourAuthHook(); // from Firebase, Auth0, etc.
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // Fetch a Supabase JWT from your backend
    fetch("/api/chat-token", {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then(({ supabaseToken }) => setAccessToken(supabaseToken));
  }, [user]);

  if (!user || !accessToken) return null;

  return (
    <QuickChat
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
      authMode="external"
      userData={{
        id: user.uid,          // must match the user's row in profiles.id
        name: user.displayName,
        avatar: user.photoURL,
        email: user.email,
        accessToken,           // Supabase JWT — required for external mode
      }}
    />
  );
}
```

#### Backend: generating the Supabase access token

Your backend needs to generate a Supabase JWT for each user. The recommended approach uses the **Supabase Admin API**:

```ts
// Node.js / Edge Function example
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // never expose this on the frontend
);

// Option A — user already exists in Supabase Auth
async function getChatToken(supabaseUserId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: userEmail,
  });
  // extract the access_token from data.properties.access_token
  return data.properties.access_token;
}

// Option B — custom JWT signed with your project's JWT secret
// (Advanced: use the SUPABASE_JWT_SECRET from Project Settings → API)
import jwt from "jsonwebtoken";

function getChatToken(userId: string) {
  return jwt.sign(
    { sub: userId, role: "authenticated" },
    process.env.SUPABASE_JWT_SECRET,
    { expiresIn: "1h" }
  );
}
```

#### Provisioning users in Supabase

Every user of your app needs a corresponding Supabase auth account so that:
- `auth.uid()` resolves to their UUID in RLS policies (enables all reads/writes)
- A `profiles` row exists — required for contact search and chat

The database trigger creates the `profiles` row automatically when you create a Supabase auth user. Do this **server-side** when the user first signs up in your app:

```ts
// Node.js / backend — use the service role key, never expose it on the frontend
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data } = await supabaseAdmin.auth.admin.createUser({
  email: user.email,
  password: someSecurePassword,  // or omit and use generateLink instead
  email_confirm: true,           // skip confirmation email
  user_metadata: {
    display_name: user.name,     // used for contact search
    avatar_url: user.avatarUrl,
  },
});

// Store data.user.id in your own DB — this is the UUID you pass as userData.id
const supabaseUserId = data.user.id;
```

> **Important:** The `display_name` in `user_metadata` is what populates `profiles.display_name`. This is the field other users search by in the Contacts dialog. Make sure it is set at creation time.

#### Token expiry

Supabase JWTs are typically valid for 1 hour. If your users have long sessions, refresh the token before it expires and re-render `<QuickChat>` with the updated `accessToken`:

```tsx
// The component re-runs setSession whenever accessToken changes
<QuickChat
  ...
  userData={{ ...userData, accessToken: latestToken }}
/>
```

---

## `ChatButton` component

A floating or inline button that shows the unread message count badge. Useful as an entry point to open a chat modal.

```tsx
import { ChatButton } from "quick-chat-react";

<ChatButton
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  onClick={() => setIsChatOpen(true)}
  position="bottom-right"   // default
/>
```

For external auth, pass `userData` (without `accessToken`) to fetch the unread count:

```tsx
<ChatButton
  supabaseUrl={...}
  supabaseAnonKey={...}
  userData={{ id: user.uid, name: user.displayName }}
  onClick={() => setIsChatOpen(true)}
/>
```

---

## Contact search

The chat sidebar includes a **Contacts** button (person+ icon) with two tabs:

- **My Contacts** — existing contacts with "Start chat" and "Remove" actions
- **Search** — type 2+ characters to find users by display name, then add them or start a chat directly

For a user to appear in search results they must have a `profiles` row in your Supabase database. This row is created automatically by a trigger whenever a Supabase auth user is created.

| Auth mode | What you need to do |
|-----------|---------------------|
| `built-in` | Nothing — profiles are created when users sign up through the built-in UI |
| `external` | Provision each user via the Admin API (`createUser`) as shown above — the trigger fires and creates the profile automatically |

---

## Props reference

### `<QuickChat>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `supabaseUrl` | `string` | — | **Required.** Your Supabase project URL. |
| `supabaseAnonKey` | `string` | — | **Required.** Your Supabase anon/public key. |
| `authMode` | `"built-in" \| "external"` | `"built-in"` | Auth flow to use. |
| `userData` | `UserData` | — | Required when `authMode="external"`. |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | UI color theme. |
| `showGroups` | `boolean` | `true` | Show group conversations in the sidebar. |
| `allowVoiceMessages` | `boolean` | `true` | Enable voice message recording. |
| `allowFileUpload` | `boolean` | `true` | Enable file and photo uploads. |
| `allowReactions` | `boolean` | `true` | Enable emoji reactions on messages. |
| `showOnlineStatus` | `boolean` | `true` | Show green online indicator dots. |
| `showReadReceipts` | `boolean` | `true` | Show read receipt checkmarks. |
| `height` | `string` | `"600px"` | Container height (any CSS value). |
| `width` | `string` | `"100%"` | Container width (any CSS value). |
| `onUnreadCountChange` | `(count: number) => void` | — | Fires when unread count changes. |
| `onConversationSelect` | `(id: string) => void` | — | Fires when a conversation is selected. |

### `UserData`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | User's UUID. Must match `profiles.id` in Supabase. |
| `name` | `string` | Yes | Display name shown in chat. |
| `avatar` | `string` | No | Avatar image URL. |
| `email` | `string` | No | User's email address. |
| `description` | `string` | No | Short bio or role shown on profile. |
| `accessToken` | `string` | Yes (external mode) | Supabase JWT. Required for `authMode="external"`. |

### `<ChatButton>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `supabaseUrl` | `string` | — | **Required.** |
| `supabaseAnonKey` | `string` | — | **Required.** |
| `userData` | `UserData` | — | Needed to fetch unread count in external auth scenarios. |
| `onClick` | `() => void` | — | Click handler (e.g. open your chat modal). |
| `href` | `string` | — | Navigate to URL on click instead of `onClick`. |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Screen position (floating mode only). |
| `floating` | `boolean` | `true` | Fixed floating button. Set `false` for inline use. |
| `unreadCount` | `number` | — | Override unread count badge manually. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Button size. |
| `badgeColor` | `string` | — | Badge background color (CSS color value). |
| `buttonColor` | `string` | — | Button background color (CSS color value). |
| `iconColor` | `string` | — | Icon color (CSS color value). |
| `icon` | `ReactNode` | — | Custom icon element. |
| `label` | `string` | `"Open chat"` | Accessible aria-label for the button. |

---

## Security notes

- The **anon key** is safe to expose on the frontend. All access is controlled by Supabase Row Level Security (RLS) policies — users can only read and write their own data.
- The **service role key** must never be exposed on the frontend. Use it only in your backend to generate access tokens.
- In external mode, `accessToken` grants the user access to Supabase. Treat it like a session token — send it over HTTPS, don't log it, and expire it appropriately.
