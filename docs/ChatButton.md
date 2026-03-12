# ChatButton

A floating or inline button that opens your chat. Shows an unread-message badge automatically when connected to Supabase, or accepts a manual count.

## Basic usage

```tsx
import { ChatButton } from "quick-chat-react";

<ChatButton
  supabaseUrl={process.env.VITE_SUPABASE_URL}
  supabaseAnonKey={process.env.VITE_SUPABASE_ANON_KEY}
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
| `unreadCount` | `number` | `0` | Manually override the badge count (bypasses live Supabase count). |
| `icon` | `ReactNode` | `<MessageCircle>` | Replace the default icon with any React element. |
| `badgeColor` | `string` | destructive color | Badge background — any CSS color value. |
| `buttonColor` | `string` | primary color | Button background — any CSS color value. |
| `iconColor` | `string` | primary-foreground color | Icon / foreground color — any CSS color value. |
| `className` | `string` | — | Extra Tailwind classes (or any CSS class) appended to the `<button>`. |
| `style` | `CSSProperties` | — | Inline styles applied to the `<button>`. Takes highest priority. |
| `label` | `string` | `"Open chat"` | `aria-label` value for accessibility. |

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
  supabase AnonKey={key}
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
