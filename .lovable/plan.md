

# Add Live Demo Page & Props Documentation to quick-chat-react

## What We'll Build

A new `/demo` route that serves as both a live interactive demo and comprehensive documentation page for the `quick-chat-react` library. This page will be accessible without authentication and will showcase:

1. **Live demo** of the `<QuickChat>` and `<ChatButton>` components with interactive prop toggles
2. **Props reference tables** with types, defaults, and descriptions
3. **Supabase setup guide** with required tables and migration SQL
4. **Environment variables** documentation
5. **Code snippets** showing how to install and use the library

## New Files

### 1. `src/pages/Demo.tsx` — Main demo/docs page

A single-page documentation site with sections:

- **Hero** — Library name, tagline, install command
- **Quick Start** — Step-by-step: install, env vars, import, render
- **Live Preview** — Interactive demo area with toggleable props (theme, showGroups, allowVoiceMessages, etc.) that update a mock preview in real-time
- **Props Tables** — Two tables: `<QuickChat>` props and `<ChatButton>` props, each with columns: Prop, Type, Default, Required, Description
- **Supabase Setup** — Collapsible section with full migration SQL for all required tables (profiles, conversations, conversation_members, messages, message_reactions, message_reads, contacts, user_roles) and required enums
- **Environment Variables** — Table showing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` with descriptions

### 2. `src/components/demo/PropsTable.tsx` — Reusable props table component

Renders a styled table from an array of `{ name, type, default, required, description }`.

### 3. `src/components/demo/CodeBlock.tsx` — Styled code block with copy button

Renders syntax-highlighted code snippets with a copy-to-clipboard button.

### 4. `src/components/demo/DemoPlayground.tsx` — Interactive prop playground

Toggle switches/selects for props like `theme`, `showGroups`, `allowVoiceMessages`, `allowFileUpload`, `authMode`, `height`, `width`. Shows a live-updating code snippet reflecting current prop selections alongside a visual preview mockup of the chat UI.

## Route Addition

In `src/App.tsx`, add:
```tsx
<Route path="/demo" element={<Demo />} />
```

## Props Documented

### `<QuickChat>` Props Table

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| supabaseUrl | string | — | Yes | Your Supabase project URL |
| supabaseAnonKey | string | — | Yes | Your Supabase anon/publishable key |
| userData | UserData | — | Yes (external auth) | User info when using external auth |
| theme | 'light' \| 'dark' \| 'system' | 'system' | No | UI theme |
| authMode | 'built-in' \| 'external' | 'built-in' | No | Authentication strategy |
| showGroups | boolean | true | No | Show group conversations |
| allowVoiceMessages | boolean | true | No | Enable voice recording |
| allowFileUpload | boolean | true | No | Enable file/photo uploads |
| allowReactions | boolean | true | No | Enable message reactions |
| showOnlineStatus | boolean | true | No | Show online indicators |
| showReadReceipts | boolean | true | No | Show read receipts |
| height | string | '100vh' | No | Container height |
| width | string | '100%' | No | Container width |
| onUnreadCountChange | (count: number) => void | — | No | Callback on unread count change |
| onConversationSelect | (id: string) => void | — | No | Callback on conversation select |

### `<ChatButton>` Props Table

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| supabaseUrl | string | — | Yes | Supabase project URL |
| supabaseAnonKey | string | — | Yes | Supabase anon key |
| userData | UserData | — | No | User data for unread count |
| onClick | () => void | — | No | Click handler |
| href | string | — | No | Navigate URL on click |
| position | 'bottom-right' \| 'bottom-left' | 'bottom-right' | No | Button position |
| unreadCount | number | auto | No | Manual unread count override |
| size | 'sm' \| 'md' \| 'lg' | 'md' | No | Button size |
| badgeColor | string | primary | No | Badge background color |
| icon | ReactNode | MessageCircle | No | Custom icon |

### `UserData` Interface

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique user identifier |
| name | string | Yes | Display name |
| avatar | string | No | Avatar image URL |
| description | string | No | User bio/status |
| email | string | No | User email |

## Supabase Setup Section Content

Will include the full migration SQL with:
- Enum types: `app_role`, `conversation_type`, `member_role`, `message_type`
- Tables: `profiles`, `conversations`, `conversation_members`, `messages`, `message_reactions`, `message_reads`, `contacts`, `user_roles`
- RLS policies overview
- Security definer functions (`has_role`, `is_conversation_member`, etc.)

## Implementation Order

1. Create `CodeBlock` and `PropsTable` components
2. Create `DemoPlayground` with interactive toggles
3. Create `Demo.tsx` page assembling all sections
4. Add `/demo` route to `App.tsx`

