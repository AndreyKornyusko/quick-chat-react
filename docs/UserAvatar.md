# UserAvatar

A user avatar button with a dropdown context menu. Designed as a companion to `<QuickChat authMode="built-in">` — drop it into your navbar or header and it will automatically pick up the logged-in user's profile, let them switch themes, view their profile, and sign out.

**Primary use case: built-in auth.** When your app uses the library's own login/signup UI (`authMode="built-in"`), `UserAvatar` shares the same Supabase session so there is nothing extra to configure — it just works.

## Quick start

### Built-in auth (recommended)

Mount `UserAvatar` anywhere outside `<QuickChat>` — a navbar is the most common placement. It detects the current session automatically.

```tsx
import { QuickChat, UserAvatar } from "quick-chat-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function App() {
  return (
    <>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b">
        <span className="font-semibold">My App</span>
        <UserAvatar
          supabaseUrl={SUPABASE_URL}
          supabaseAnonKey={SUPABASE_KEY}
          authMode="built-in"
          showName
        />
      </nav>

      {/* Chat — same Supabase project, session is shared automatically */}
      <QuickChat
        supabaseUrl={SUPABASE_URL}
        supabaseAnonKey={SUPABASE_KEY}
        authMode="built-in"
      />
    </>
  );
}
```

The dropdown gives users:
- **My Profile** — read-only view of their display name, email, and bio
- **Theme** — switch between Light, Dark, and System preference
- **Sign out** — ends the Supabase session

If no user is logged in (session not yet established), the avatar shows a `?` placeholder and the dropdown offers **Sign in** instead of Sign out — useful if `<QuickChat>` is hidden until the user opens it.

### External auth mode

If your app manages auth itself and passes `userData` to the library, pass the same object to `UserAvatar`:

```tsx
import { QuickChat, UserAvatar } from "quick-chat-react";

// Get the session from your own Supabase client after sign-in
const { data: { session } } = await supabase.auth.getSession();

const userData = {
  id: session.user.id,
  name: session.user.user_metadata.display_name ?? session.user.email,
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
};

<UserAvatar
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  authMode="external"
  userData={userData}
  showName
/>
```

In external mode the Sign in / Sign out items are hidden — your app owns the auth flow. Use `onLogout` and `onLogin` callbacks if you need to react to those actions.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `supabaseUrl` | `string` | — | **Required.** Supabase project URL. |
| `supabaseAnonKey` | `string` | — | **Required.** Supabase anon key. |
| `authMode` | `"built-in" \| "external"` | `"built-in"` | How auth is handled. Use `"built-in"` when the library manages login/signup. |
| `userData` | `UserData` | — | Pre-authenticated user (required when `authMode="external"`). |
| `showName` | `boolean` | `false` | Show the user's display name next to the avatar. |
| `nameMaxLength` | `number` | `20` | Maximum characters shown for the name before it is truncated with `…`. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Avatar size — `sm` 32 px, `md` 40 px, `lg` 48 px. |
| `floating` | `boolean` | `false` | `true` = fixed-position overlay. `false` = inline element (default). |
| `position` | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left"` | `"top-right"` | Corner to anchor the avatar (floating mode only). |
| `onThemeChange` | `(theme: "light" \| "dark" \| "system") => void` | — | Called whenever the user picks a theme from the dropdown. |
| `onProfileClick` | `() => void` | — | Replace the built-in read-only profile dialog with your own handler. |
| `onLogout` | `() => void` | — | Called after sign-out completes. Use to redirect or clear local state. |
| `onLogin` | `() => void` | — | Called when the user clicks "Sign in" (built-in mode, no active session). |
| `className` | `string` | — | Extra CSS classes appended to the trigger element. |
| `style` | `CSSProperties` | — | Inline styles applied to the trigger element. |

## How it works

`UserAvatar` is a **standalone component** — like `ChatButton`, it creates its own internal Supabase client. It does not require being wrapped in `<QuickChatProvider>`.

**Built-in auth flow:**
1. On mount it calls `supabase.auth.getSession()` to immediately restore any existing session from localStorage.
2. It subscribes to `onAuthStateChange` so the avatar reacts to sign-in and sign-out events — even if they originate from the `<QuickChat>` component on the same page.
3. It fetches the user's display name, avatar URL, and bio from the `profiles` table once a session is available.

**Theme sync:**
Theme preference is stored in localStorage under the key `chat-theme`. Both `UserAvatar` and `<QuickChat>` read from and write to the same key, so a theme change in the dropdown is immediately reflected inside the chat (and vice versa) without any extra wiring.

**Profile dialog:**
By default, clicking "My Profile" opens a simple read-only dialog showing the user's avatar, display name, email, and bio. To replace it with a custom UI (e.g. a full edit form), pass `onProfileClick`.

## Examples

### Navbar with name and sign-out redirect

```tsx
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "quick-chat-react";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 h-14 border-b">
      <span className="font-semibold">My App</span>
      <UserAvatar
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
        supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
        authMode="built-in"
        showName
        nameMaxLength={18}
        onLogout={() => navigate("/login")}
        onLogin={() => navigate("/login")}
      />
    </nav>
  );
}
```

### Sync theme with your own theme context

```tsx
<UserAvatar
  supabaseUrl={url}
  supabaseAnonKey={key}
  authMode="built-in"
  onThemeChange={(theme) => {
    // Forward to your own theme provider if you have one
    yourThemeContext.setTheme(theme);
  }}
/>
```

### Custom profile page instead of built-in dialog

```tsx
import { useNavigate } from "react-router-dom";

<UserAvatar
  supabaseUrl={url}
  supabaseAnonKey={key}
  authMode="built-in"
  onProfileClick={() => navigate("/profile")}
/>
```

### Fixed floating placement (e.g. always visible top-right)

```tsx
<UserAvatar
  supabaseUrl={url}
  supabaseAnonKey={key}
  authMode="built-in"
  floating
  position="top-right"
/>
```

### Small avatar without name (icon-only, compact nav)

```tsx
<UserAvatar
  supabaseUrl={url}
  supabaseAnonKey={key}
  authMode="built-in"
  size="sm"
/>
```

### Custom styling

```tsx
// Add a ring on focus/hover for accessibility emphasis
<UserAvatar
  supabaseUrl={url}
  supabaseAnonKey={key}
  authMode="built-in"
  showName
  className="ring-2 ring-offset-2 ring-indigo-500"
/>
```

## Pairing with ChatButton

`UserAvatar` and `ChatButton` are independent and can be used together in the same layout:

```tsx
<nav className="flex items-center justify-between px-6 h-14 border-b">
  <span className="font-semibold">My App</span>
  <div className="flex items-center gap-3">
    <ChatButton
      supabaseUrl={url}
      supabaseAnonKey={key}
      floating={false}
      size="sm"
      onClick={() => setChatOpen(true)}
    />
    <UserAvatar
      supabaseUrl={url}
      supabaseAnonKey={key}
      authMode="built-in"
      showName
    />
  </div>
</nav>
```

Both share the same Supabase project URL and key. Each manages its own internal client — no extra providers or configuration needed.
