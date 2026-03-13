# ChatButton

A floating or inline button that opens your chat. Shows an unread-message badge that is **fetched automatically from Supabase** when `userData` is provided, or accepts a manual static count via `unreadCount`.

The badge updates in real-time via Supabase Realtime subscriptions — no polling required.

## Basic usage

### Built-in auth mode

When users log in through the library's own UI, the button has no way to know who the current user is from outside the chat. Use `onUnreadCountChange` on `<QuickChat>` and pass the count manually:

```tsx
import { useState } from "react";
import { QuickChat, ChatButton } from "quick-chat-react";

export default function App() {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatButton
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
        supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
        unreadCount={unread}
        onClick={() => setOpen(true)}
      />
      {open && (
        <QuickChat
          supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
          supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
          onUnreadCountChange={setUnread}
        />
      )}
    </>
  );
}
```

### External auth mode (automatic live unread count)

Pass `userData` with the user's Supabase session tokens. The button will query Supabase directly and subscribe to real-time updates so the badge stays in sync without any extra wiring.

> **Why tokens are required:** Supabase tables are protected by Row Level Security (RLS). Without a valid JWT (`accessToken`), the database rejects all queries and the unread count cannot be fetched.

```tsx
import { ChatButton } from "quick-chat-react";

// Get the session from your own Supabase client after sign-in
const { data: { session } } = await supabase.auth.getSession();

<ChatButton
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  userData={{
    id: session.user.id,
    name: session.user.user_metadata.display_name ?? session.user.email,
    accessToken: session.access_token,    // required — authenticates the Supabase query
    refreshToken: session.refresh_token,  // required — prevents the session silently expiring after 1 h
  }}
  onClick={() => setOpen(true)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `supabaseUrl` | `string` | — | **Required.** Supabase project URL. |
| `supabaseAnonKey` | `string` | — | **Required.** Supabase anon key. |
| `userData` | `UserData` | — | Pass the current user to fetch their live unread count. |
| `onClick` | `() => void` | — | Click handler. Takes priority over `href`. |
| `href` | `string` | — | URL to navigate to when clicked. |
| `floating` | `boolean` | `true` | `true` = fixed-position overlay. `false` = inline element. |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Corner to anchor the button (floating mode only). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Preset size — `sm` 40 px, `md` 56 px, `lg` 64 px. |
| `unreadCount` | `number` | — | Manually override the badge count (bypasses live Supabase count). If omitted, count is fetched automatically when `userData` is present. |
| `icon` | `ReactNode` | `<MessageCircle>` | Replace the default icon with any React element. |
| `badgeColor` | `string` | destructive color | Badge background — any CSS color value. |
| `buttonColor` | `string` | primary color | Button background — any CSS color value. |
| `iconColor` | `string` | primary-foreground color | Icon / foreground color — any CSS color value. |
| `className` | `string` | — | Extra Tailwind classes (or any CSS class) appended to the `<button>`. |
| `style` | `CSSProperties` | — | Inline styles applied to the `<button>`. Takes highest priority. |
| `label` | `string` | `"Open chat"` | `aria-label` value for accessibility. |

## How the unread count works

When `userData` is provided (and no `unreadCount` override is given), `ChatButton`:

1. Creates an internal Supabase client using `supabaseUrl` and `supabaseAnonKey`.
2. Sets the auth session from `userData.accessToken` + `userData.refreshToken` so RLS policies allow the query.
3. Fetches unread messages on mount: counts all messages in the user's conversations that were not sent by them and have no corresponding row in `message_reads`.
4. Subscribes to Supabase Realtime on the `messages` and `message_reads` tables and re-fetches the count whenever either table changes.

If you pass `unreadCount` explicitly, steps 1–4 are skipped entirely and the badge renders the value you provide.

## Customization examples

### Change colors

```tsx
// Brand colors via props — no CSS needed
<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  buttonColor="#6366f1"   // indigo background
  iconColor="#ffffff"     // white icon
  badgeColor="#ef4444"    // red badge
  onClick={() => setOpen(true)}
/>
```

### Custom size with inline style

```tsx
// Override size beyond the sm/md/lg presets
<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  style={{ width: 72, height: 72, borderRadius: 16 }}
  onClick={() => setOpen(true)}
/>
```

### Extend with Tailwind classes

```tsx
// Add a ring, different shadow, or animation class
<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  className="ring-2 ring-offset-2 ring-indigo-500 shadow-xl"
  onClick={() => setOpen(true)}
/>
```

### Swap the icon

```tsx
import { BotMessageSquare } from "lucide-react";

<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  icon={<BotMessageSquare className="h-6 w-6" />}
  onClick={() => setOpen(true)}
/>
```

### Inline (non-floating) placement

```tsx
// Embed inside a nav bar or sidebar — no fixed positioning
<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  floating={false}
  size="sm"
  onClick={() => setOpen(true)}
/>
```

### Custom accessible label

```tsx
<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  label="Open support chat"
  onClick={() => setOpen(true)}
/>
```

## Style priority

When multiple styling mechanisms are used together, they resolve in this order (highest wins):

1. `style` prop (inline styles)
2. `buttonColor` / `iconColor` props (also inline styles, applied before `style`)
3. `className` prop (CSS class specificity rules apply)
4. Default Tailwind classes (`bg-primary`, `text-primary-foreground`, etc.)
