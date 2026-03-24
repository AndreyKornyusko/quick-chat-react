import { useState, useEffect, useCallback } from "react";
import "./DocsPage.css";

// ── Sidebar structure ────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { id: "intro", label: "Introduction" },
  { id: "quick-start", label: "Quick Start" },
  {
    id: "auth-modes",
    label: "Auth Modes",
    children: [
      { id: "auth-builtin", label: "Built-in auth" },
      { id: "auth-external", label: "External auth" },
    ],
  },
  {
    id: "components",
    label: "Components",
    children: [
      { id: "ref-quickchat", label: "<QuickChat>" },
      { id: "ref-chatbutton", label: "<ChatButton>" },
      { id: "ref-useravatar", label: "<UserAvatar>" },
      { id: "ref-userdata", label: "UserData" },
    ],
  },
  {
    id: "responsive",
    label: "Responsive Design",
    children: [
      { id: "responsive-layout", label: "Layout breakpoint" },
      { id: "responsive-mobile-layout", label: "mobileLayout prop" },
      { id: "responsive-mobile-ux", label: "Mobile UX details" },
    ],
  },
  {
    id: "theming",
    label: "Custom Theming",
    children: [
      { id: "theming-colors", label: "Color tokens" },
      { id: "theming-background", label: "Chat background" },
    ],
  },
  {
    id: "guides",
    label: "Guides",
    children: [
      { id: "guide-external-auth", label: "External Auth" },
      { id: "guide-startup", label: "Startup Base" },
      { id: "guide-lovable", label: "Lovable Schema" },
      { id: "guide-separate", label: "Separate Project" },
    ],
  },
  {
    id: "security",
    label: "Security",
    children: [
      { id: "security-storage", label: "Public media bucket" },
      { id: "security-ratelimit", label: "Rate limiting" },
      { id: "security-profiles", label: "Profile visibility" },
    ],
  },
];

function flatIds(items: NavItem[]): string[] {
  return items.flatMap((item) => [item.id, ...flatIds(item.children ?? [])]);
}

const ALL_IDS = flatIds(NAV);

// ── Small helpers ────────────────────────────────────────────────────────────

function useActiveSection() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-15% 0px -75% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return active;
}

function AnchorBtn({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [id]);

  return (
    <button className="docs-anchor-btn" onClick={copy} title="Copy link to section">
      {copied ? "✓" : "#"}
    </button>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="docs-h2">
      {children}
      <AnchorBtn id={id} />
    </h2>
  );
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="docs-h3">
      {children}
      <AnchorBtn id={id} />
    </h3>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="docs-pre">
      <code>{children.trim()}</code>
    </pre>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <div className="docs-note">{children}</div>;
}

function Tip({ children }: { children: React.ReactNode }) {
  return <div className="docs-tip">{children}</div>;
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="docs-sidebar">
      <nav className="docs-nav">
        {NAV.map((item) => (
          <div key={item.id} className="docs-nav-group">
            <a
              href={`#${item.id}`}
              className={`docs-nav-link docs-nav-link--top ${active === item.id ? "docs-nav-link--active" : ""}`}
            >
              {item.label}
            </a>
            {item.children && (
              <div className="docs-nav-children">
                {item.children.map((child) => (
                  <a
                    key={child.id}
                    href={`#${child.id}`}
                    className={`docs-nav-link docs-nav-link--child ${active === child.id ? "docs-nav-link--active" : ""}`}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function DocsPage() {
  const active = useActiveSection();

  return (
    <div className="docs-page">
      <Sidebar active={active} />

      <main className="docs-content">

        {/* ── Introduction ──────────────────────────────────────────── */}
        <section className="docs-section">
          <H2 id="intro">Introduction</H2>
          <p>
            <strong>quick-chat-react</strong> is the fastest way to add real-time chat to your React MVP.
            Drop in one component, pass your{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>{" "}
            credentials, and ship a full-featured chat experience — in minutes, not weeks.
          </p>
          <Note>
            <strong>Requires Supabase.</strong> If your project uses Firebase, Auth0, or a custom backend,
            this library is not the right fit.
          </Note>
          <p style={{ marginTop: "1rem" }}>
            <strong>Features:</strong> real-time messaging · group conversations · voice messages · file &amp; photo
            uploads · emoji reactions · read receipts · online status · contact management
          </p>

          <h3 style={{ marginTop: "1.5rem" }}>Who it's for</h3>
          <ul className="docs-list">
            <li><strong>Quick MVP prototyping</strong> — ship a fully-featured chat in minutes, not weeks</li>
            <li><strong>Startups</strong> — use built-in auth as your user system and extend the schema for your product</li>
            <li><strong>Lovable + Supabase projects</strong> — add chat in 10 minutes, no backend changes needed</li>
            <li>Any <strong>React + Supabase</strong> app using email/password, Google, or GitHub auth</li>
          </ul>

          <h3 style={{ marginTop: "1.5rem" }}>Compatibility</h3>
          <table className="docs-table">
            <thead>
              <tr><th>Your setup</th><th>Supported</th></tr>
            </thead>
            <tbody>
              <tr><td>Fresh Supabase project</td><td>✅ Yes</td></tr>
              <tr><td>Supabase Auth (email/password)</td><td>✅ Yes</td></tr>
              <tr><td>Supabase OAuth (Google, GitHub)</td><td>✅ Yes</td></tr>
              <tr><td>Lovable + Supabase (no profiles table yet)</td><td>✅ Yes</td></tr>
              <tr><td>Lovable + Supabase (profiles table exists)</td><td>✅ Yes — use the additive migration</td></tr>
              <tr><td>Separate Supabase project for chat</td><td>⚠️ Advanced — see guide</td></tr>
              <tr><td>Firebase / Auth0 / custom auth backend</td><td>❌ Not supported</td></tr>
            </tbody>
          </table>
        </section>

        {/* ── Quick Start ───────────────────────────────────────────── */}
        <section className="docs-section">
          <H2 id="quick-start">Quick Start</H2>
          <p>Get a fully working chat in ~10 minutes on a fresh Supabase project.</p>

          <h3>Step 1 — Install</h3>
          <Code>{`npm install quick-chat-react`}</Code>

          <h3>Step 2 — Import the stylesheet</h3>
          <p>Add this once in your app entry point (<code>main.tsx</code>, <code>_app.tsx</code>, etc.):</p>
          <Code>{`import "quick-chat-react/style.css";`}</Code>

          <h3>Step 3 — Run the migrations</h3>
          <p>
            Go to your Supabase project → <strong>SQL Editor</strong> → paste and run the files from{" "}
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/tree/main/supabase/migrations" target="_blank" rel="noopener noreferrer"><code>/supabase/migrations/</code></a> <strong>in filename order</strong>.
          </p>
          <Note>
            <strong>Already have a <code>profiles</code> table?</strong> (Common in Lovable projects.)
            Skip the standard files and use the <a href="#guide-lovable">Lovable guide</a> instead.
          </Note>

          <h3>Step 4 — Add env vars</h3>
          <Code>{`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`}</Code>
          <p>Find them in Supabase → <strong>Project Settings → API</strong>.</p>

          <h3>Step 5 — Drop in the component</h3>
          <Code>{`import { QuickChat } from "quick-chat-react";

export default function App() {
  return (
    <QuickChat
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
    />
  );
}`}</Code>
          <p>That's it. Users can sign up and start chatting.</p>
          <p style={{ marginTop: "1rem" }}>
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/docs/quick-start.md" target="_blank" rel="noopener noreferrer">
              → Full Quick Start guide on GitHub
            </a>
          </p>

          <h3>Disable Email Confirmation (Recommended)</h3>
          <p>So users can log in immediately after signing up:</p>
          <Tip>Supabase Dashboard → <strong>Authentication → Email</strong> → turn off <strong>"Confirm email"</strong></Tip>

          <h3>Display names</h3>
          <p>Pass the name in <code>signUp</code> options so it appears in chat:</p>
          <Code>{`await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { display_name: "Alice" },
  },
});`}</Code>
          <p>Fallback chain: <code>display_name</code> → <code>full_name</code> → email prefix.</p>
        </section>

        {/* ── Auth Modes ────────────────────────────────────────────── */}
        <section className="docs-section">
          <H2 id="auth-modes">Auth Modes</H2>
          <p>The library supports two authentication modes.</p>

          <H3 id="auth-builtin">Built-in auth</H3>
          <p>
            The library renders its own signup/login screens when the user is not signed in.
            Best for fresh projects with no existing auth.
          </p>
          <Code>{`<QuickChat
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  // authMode="built-in" is the default — can be omitted
/>`}</Code>

          <H3 id="auth-external">External auth</H3>
          <p>
            Your app already has Supabase Auth. Pass the session tokens and the chat reuses the same
            logged-in user — no second login.
          </p>
          <Code>{`import { QuickChat } from "quick-chat-react";

// After your own supabase.auth.signIn...
const { data: { session } } = await supabase.auth.getSession();

<QuickChat
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  authMode="external"
  userData={{
    id: session.user.id,                  // Supabase UUID — required
    name: session.user.user_metadata.display_name ?? session.user.email,
    avatar: session.user.user_metadata.avatar_url,
    email: session.user.email,
    accessToken: session.access_token,    // required
    refreshToken: session.refresh_token,  // required for auto-refresh
  }}
/>`}</Code>
          <p>
            Full guide with token refresh, OAuth setup, and profile sync:{" "}
            <a href="#guide-external-auth">External Auth guide</a> or{" "}
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/docs/external-auth.md" target="_blank" rel="noopener noreferrer">view on GitHub</a>.
          </p>
        </section>

        {/* ── Props Reference ───────────────────────────────────────── */}
        <section className="docs-section">
          <H2 id="components">Props Reference</H2>

          <H3 id="ref-quickchat">&lt;QuickChat&gt;</H3>
          <table className="docs-table">
            <thead>
              <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>supabaseUrl</code></td><td><code>string</code></td><td>—</td><td><strong>Required.</strong> Your Supabase project URL.</td></tr>
              <tr><td><code>supabaseAnonKey</code></td><td><code>string</code></td><td>—</td><td><strong>Required.</strong> Your Supabase anon/public key.</td></tr>
              <tr><td><code>authMode</code></td><td><code>"built-in" | "external"</code></td><td><code>"built-in"</code></td><td>Auth flow to use.</td></tr>
              <tr><td><code>userData</code></td><td><code>UserData</code></td><td>—</td><td>Required when <code>authMode="external"</code>.</td></tr>
              <tr><td><code>theme</code></td><td><code>"light" | "dark" | "system"</code></td><td><code>"system"</code></td><td>UI color theme.</td></tr>
              <tr><td><code>showGroups</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show group conversations in the sidebar.</td></tr>
              <tr><td><code>allowVoiceMessages</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Enable voice message recording.</td></tr>
              <tr><td><code>allowFileUpload</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Enable file and photo uploads.</td></tr>
              <tr><td><code>allowReactions</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Enable emoji reactions on messages.</td></tr>
              <tr><td><code>showOnlineStatus</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show green online indicator dots.</td></tr>
              <tr><td><code>showReadReceipts</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show read receipt checkmarks.</td></tr>
              <tr><td><code>height</code></td><td><code>string</code></td><td><code>"600px"</code></td><td>Container height (any CSS value).</td></tr>
              <tr><td><code>width</code></td><td><code>string</code></td><td><code>"100%"</code></td><td>Container width (any CSS value).</td></tr>
              <tr><td><code>mobileLayout</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Single-column layout with back navigation — ideal for chat modals, floating panels, or narrow containers.</td></tr>
              <tr><td><code>onUnreadCountChange</code></td><td><code>(count: number) =&gt; void</code></td><td>—</td><td>Fires when unread count changes.</td></tr>
              <tr><td><code>onConversationSelect</code></td><td><code>(id: string) =&gt; void</code></td><td>—</td><td>Fires when a conversation is selected.</td></tr>
              <tr><td><code>onUploadFile</code></td><td><code>(file, type) =&gt; Promise&lt;string&gt;</code></td><td>—</td><td>Custom upload handler. Skips Supabase Storage — use for S3, Cloudinary, or private bucket with signed URLs. Must return the file URL.</td></tr>
            </tbody>
          </table>

          <H3 id="ref-chatbutton">&lt;ChatButton&gt;</H3>
          <p>
            A floating or inline button with an unread badge. Pass <code>userData</code> for live badge
            counts via Supabase Realtime.
          </p>
          <Code>{`import { ChatButton } from "quick-chat-react";

<ChatButton
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
  userData={chatUser}
  onClick={() => setOpen(true)}
/>`}</Code>
          <table className="docs-table">
            <thead>
              <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>supabaseUrl</code></td><td><code>string</code></td><td>—</td><td><strong>Required.</strong></td></tr>
              <tr><td><code>supabaseAnonKey</code></td><td><code>string</code></td><td>—</td><td><strong>Required.</strong></td></tr>
              <tr><td><code>userData</code></td><td><code>UserData</code></td><td>—</td><td>Pass to fetch live unread count.</td></tr>
              <tr><td><code>onClick</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Click handler.</td></tr>
              <tr><td><code>href</code></td><td><code>string</code></td><td>—</td><td>Navigate to URL on click.</td></tr>
              <tr><td><code>floating</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Fixed floating button. <code>false</code> = inline.</td></tr>
              <tr><td><code>position</code></td><td><code>"bottom-right" | "bottom-left"</code></td><td><code>"bottom-right"</code></td><td>Screen corner (floating only).</td></tr>
              <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td><td>sm=40px, md=56px, lg=64px.</td></tr>
              <tr><td><code>unreadCount</code></td><td><code>number</code></td><td>—</td><td>Manual badge override (skips Supabase fetch).</td></tr>
              <tr><td><code>icon</code></td><td><code>ReactNode</code></td><td>MessageCircle</td><td>Custom icon element.</td></tr>
              <tr><td><code>badgeColor</code></td><td><code>string</code></td><td>—</td><td>Badge background CSS color.</td></tr>
              <tr><td><code>buttonColor</code></td><td><code>string</code></td><td>—</td><td>Button background CSS color.</td></tr>
              <tr><td><code>iconColor</code></td><td><code>string</code></td><td>—</td><td>Icon CSS color.</td></tr>
              <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Open chat"</code></td><td>aria-label value.</td></tr>
              <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Extra CSS classes.</td></tr>
              <tr><td><code>style</code></td><td><code>CSSProperties</code></td><td>—</td><td>Inline styles (highest priority).</td></tr>
            </tbody>
          </table>

          <p>
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/docs/ChatButton.md" target="_blank" rel="noopener noreferrer">
              → Full ChatButton guide on GitHub
            </a>
          </p>

          <h4>How the unread count works</h4>
          <p>When <code>userData</code> is provided (and no <code>unreadCount</code> override):</p>
          <ol className="docs-list">
            <li>Creates an internal Supabase client and sets the auth session from tokens.</li>
            <li>Fetches unread messages on mount: messages in the user's conversations that have no <code>message_reads</code> row.</li>
            <li>Subscribes to Realtime on <code>messages</code> and <code>message_reads</code> — badge updates automatically.</li>
          </ol>

          <h4>Customization examples</h4>
          <Code>{`// Custom colors
<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  buttonColor="#6366f1"
  iconColor="#ffffff"
  badgeColor="#ef4444"
  onClick={() => setOpen(true)}
/>

// Inline (non-floating) in a navbar
<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  floating={false}
  size="sm"
  onClick={() => setOpen(true)}
/>

// Built-in auth: wire unread count manually
const [unread, setUnread] = useState(0);

<ChatButton
  supabaseUrl={url}
  supabaseAnonKey={key}
  unreadCount={unread}
  onClick={() => setOpen(true)}
/>
<QuickChat
  supabaseUrl={url}
  supabaseAnonKey={key}
  onUnreadCountChange={setUnread}
/>`}</Code>

          <H3 id="ref-mobile-layout">Chat modal &amp; floating panel</H3>
          <p>
            Use <code>mobileLayout=&#123;true&#125;</code> on <code>&lt;QuickChat&gt;</code> when embedding it in a
            compact floating panel or modal. It switches to a single-column layout with back navigation —
            the sidebar and conversation view never show side by side.
          </p>
          <Code>{`import { useState } from "react";
import { ChatButton, QuickChat } from "quick-chat-react";

export function FloatingChat({ userData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatButton
        supabaseUrl={url}
        supabaseAnonKey={key}
        userData={userData}
        floating
        position="bottom-right"
        onClick={() => setOpen((v) => !v)}
      />

      {/* Compact panel anchored bottom-right */}
      <div style={{
        position: "fixed", bottom: "5rem", right: "1.5rem",
        width: 390, height: 680, borderRadius: "1rem",
        overflow: "hidden", display: open ? "block" : "none",
      }}>
        <QuickChat
          supabaseUrl={url}
          supabaseAnonKey={key}
          authMode="external"
          userData={userData}
          height="100%"
          width="100%"
          mobileLayout={true}
        />
      </div>
    </>
  );
}`}</Code>

          <H3 id="ref-useravatar">&lt;UserAvatar&gt;</H3>
          <p>
            A user avatar button for your navbar or header. Detects the current session automatically in
            built-in auth mode. Dropdown shows profile info, theme switcher, and sign out.
          </p>
          <Code>{`import { QuickChat, UserAvatar } from "quick-chat-react";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

<nav>
  <UserAvatar
    supabaseUrl={url}
    supabaseAnonKey={key}
    authMode="built-in"
    showName
  />
</nav>
<QuickChat supabaseUrl={url} supabaseAnonKey={key} authMode="built-in" />`}</Code>
          <table className="docs-table">
            <thead>
              <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>supabaseUrl</code></td><td><code>string</code></td><td>—</td><td><strong>Required.</strong></td></tr>
              <tr><td><code>supabaseAnonKey</code></td><td><code>string</code></td><td>—</td><td><strong>Required.</strong></td></tr>
              <tr><td><code>authMode</code></td><td><code>"built-in" | "external"</code></td><td><code>"built-in"</code></td><td><code>"built-in"</code> detects session automatically.</td></tr>
              <tr><td><code>userData</code></td><td><code>UserData</code></td><td>—</td><td>Required in external auth mode.</td></tr>
              <tr><td><code>showName</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Show display name next to avatar.</td></tr>
              <tr><td><code>nameMaxLength</code></td><td><code>number</code></td><td><code>20</code></td><td>Max chars before name is truncated with …</td></tr>
              <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td><td>sm=32px, md=40px, lg=48px.</td></tr>
              <tr><td><code>floating</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Fixed-position floating element.</td></tr>
              <tr><td><code>position</code></td><td><code>"top-right" | "top-left" | "bottom-right" | "bottom-left"</code></td><td><code>"top-right"</code></td><td>Corner (floating only).</td></tr>
              <tr><td><code>onThemeChange</code></td><td><code>(theme: string) =&gt; void</code></td><td>—</td><td>Called when user picks a theme.</td></tr>
              <tr><td><code>onProfileClick</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Replace built-in profile dialog with custom handler.</td></tr>
              <tr><td><code>onLogout</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Called after sign-out (e.g. redirect to login).</td></tr>
              <tr><td><code>onLogin</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Called when "Sign in" is clicked.</td></tr>
              <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Extra CSS classes.</td></tr>
              <tr><td><code>style</code></td><td><code>CSSProperties</code></td><td>—</td><td>Inline styles.</td></tr>
            </tbody>
          </table>

          <p>
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/docs/UserAvatar.md" target="_blank" rel="noopener noreferrer">
              → Full UserAvatar guide on GitHub
            </a>
          </p>

          <H3 id="ref-userdata">UserData</H3>
          <table className="docs-table">
            <thead>
              <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>id</code></td><td><code>string</code></td><td>Yes</td><td>User's UUID. Must match <code>profiles.id</code> in Supabase.</td></tr>
              <tr><td><code>name</code></td><td><code>string</code></td><td>Yes</td><td>Display name shown in chat.</td></tr>
              <tr><td><code>avatar</code></td><td><code>string</code></td><td>No</td><td>Avatar image URL.</td></tr>
              <tr><td><code>email</code></td><td><code>string</code></td><td>No</td><td>User's email address.</td></tr>
              <tr><td><code>description</code></td><td><code>string</code></td><td>No</td><td>Short bio or role shown on profile.</td></tr>
              <tr><td><code>accessToken</code></td><td><code>string</code></td><td>Yes (external)</td><td>Supabase JWT. Required for <code>authMode="external"</code>.</td></tr>
              <tr><td><code>refreshToken</code></td><td><code>string</code></td><td>Yes (external)</td><td>For auto-refresh. Omitting breaks sessions after 1 h.</td></tr>
            </tbody>
          </table>
        </section>

        {/* ── Responsive Design ────────────────────────────────────── */}
        <section className="docs-section">
          <H2 id="responsive">Responsive Design</H2>
          <p>
            quick-chat-react is built mobile-first. Layout, interaction patterns, and visual chrome all adapt
            to the viewport — no configuration required.
          </p>

          <H3 id="responsive-layout">Layout breakpoint</H3>
          <p>
            On viewports <strong>≥ 768 px</strong>, the sidebar (320–380 px fixed width) and the chat window
            render side by side — the standard desktop messaging layout.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Below 768 px the component switches to a <strong>single-panel navigation model</strong>: the sidebar
            and the conversation view are never shown simultaneously. Selecting a conversation navigates to the
            chat view; a back arrow returns to the sidebar. This mirrors the navigation model of native iOS and
            Android messaging apps and avoids cramped split-view layouts on small screens.
          </p>
          <Code>{`Desktop (≥ 768 px)           Mobile (< 768 px)
┌──────────┬──────────────┐   ┌──────────────────────┐
│ Sidebar  │  Chat window │   │ Sidebar               │
│          │              │   │ — tap conversation —  │
│          │              │   ├──────────────────────┤
│          │              │   │ Chat window  ← back  │
└──────────┴──────────────┘   └──────────────────────┘`}</Code>

          <H3 id="responsive-mobile-layout">mobileLayout prop</H3>
          <p>
            <code>mobileLayout=&#123;true&#125;</code> activates single-panel navigation regardless of viewport
            width. Use it whenever the component lives in a constrained container — a floating panel, modal, or
            narrow sidebar — where a split view would be too cramped even on a wide screen.
          </p>
          <Code>{`// Floating chat panel anchored bottom-right
<QuickChat
  supabaseUrl={url}
  supabaseAnonKey={key}
  mobileLayout={true}
  height="680px"
  width="390px"
/>`}</Code>
          <Tip>
            <code>mobileLayout</code> is the correct prop to set when rendering <code>&lt;QuickChat&gt;</code>{" "}
            inside a modal or floating panel. The component detects its own viewport breakpoint, not the container
            width — so without this prop a narrow panel on a desktop screen still renders the desktop split-panel layout.
          </Tip>

          <H3 id="responsive-mobile-ux">Mobile UX details</H3>
          <p>On mobile the component adopts native-app conventions throughout:</p>
          <table className="docs-table">
            <thead>
              <tr><th>Detail</th><th>Behavior</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fixed chrome</strong></td>
                <td>
                  The conversation header and message input bar are <code>position: fixed</code>, anchored to the
                  top and bottom of the viewport. The message list scrolls freely underneath — exactly as in a
                  native messaging app.
                </td>
              </tr>
              <tr>
                <td><strong>Bottom sheets</strong></td>
                <td>
                  The emoji picker, message context menu, and reaction picker all appear as slide-up bottom
                  sheets with a blurred backdrop overlay, rather than inline popovers or dropdowns.
                </td>
              </tr>
              <tr>
                <td><strong>Adaptive input</strong></td>
                <td>
                  The message input uses a pill shape and backdrop blur on mobile. On desktop it renders as a
                  standard rounded-rectangle input field without the blur.
                </td>
              </tr>
              <tr>
                <td><strong>Safe-area insets</strong></td>
                <td>
                  Interactive surfaces respect <code>env(safe-area-inset-*)</code> so the UI is not obscured by
                  the iOS home indicator or notch on physical devices.
                </td>
              </tr>
              <tr>
                <td><strong>Chat background</strong></td>
                <td>
                  A configurable gradient with a subtle icon pattern is applied to the message area on mobile
                  only. The desktop message area is transparent against your app background. Disable with{" "}
                  <code>showChatBackground=&#123;false&#125;</code> or customize colors via <code>themeColors</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── Custom Theming ────────────────────────────────────────── */}
        <section className="docs-section">
          <H2 id="theming">Custom Theming</H2>
          <p>
            <code>&lt;QuickChat&gt;</code> supports two theming props: <code>themeColors</code> for overriding
            specific color tokens, and <code>showChatBackground</code> to toggle the mobile chat body gradient
            and background pattern.
          </p>

          <H3 id="theming-colors">Color tokens</H3>
          <p>
            Pass <code>themeColors</code> with <code>light</code> and/or <code>dark</code> keys to override
            individual color tokens. Values are space-separated HSL components — the same format used by the
            library's CSS variables (e.g. <code>"270 70% 55%"</code>).
          </p>
          <Code>{`import { QuickChat } from "quick-chat-react";

<QuickChat
  supabaseUrl={url}
  supabaseAnonKey={key}
  themeColors={{
    light: {
      primary:          "270 70% 55%",   // purple accent
      chatBubbleOut:    "270 60% 90%",   // outgoing bubble
      chatBubbleIn:     "0 0% 100%",     // incoming bubble
      chatGradientFrom: "270 50% 45%",   // gradient start
      chatGradientVia:  "290 55% 50%",   // gradient mid
      chatGradientTo:   "310 50% 55%",   // gradient end
    },
    dark: {
      primary:          "270 70% 65%",
      chatBubbleOut:    "270 40% 25%",
      chatBubbleIn:     "210 14% 17%",
      chatGradientFrom: "270 35% 18%",
      chatGradientVia:  "290 30% 22%",
      chatGradientTo:   "310 28% 20%",
    },
  }}
/>`}</Code>

          <Tip>
            You only need to pass the tokens you want to override — all others fall back to the library defaults.
            You can supply just <code>light</code>, just <code>dark</code>, or both.
          </Tip>

          <table className="docs-table">
            <thead>
              <tr><th>Token</th><th>CSS variable</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>primary</code></td><td><code>--primary</code></td><td>Accent color — buttons, active items, read receipts</td></tr>
              <tr><td><code>primaryForeground</code></td><td><code>--primary-foreground</code></td><td>Text on primary-colored surfaces</td></tr>
              <tr><td><code>background</code></td><td><code>--background</code></td><td>Component background</td></tr>
              <tr><td><code>foreground</code></td><td><code>--foreground</code></td><td>Default text color</td></tr>
              <tr><td><code>muted</code></td><td><code>--muted</code></td><td>Subtle background for muted elements</td></tr>
              <tr><td><code>mutedForeground</code></td><td><code>--muted-foreground</code></td><td>Text on muted backgrounds</td></tr>
              <tr><td><code>border</code></td><td><code>--border</code></td><td>Border and input outline color</td></tr>
              <tr><td><code>chatBubbleOut</code></td><td><code>--chat-bubble-out</code></td><td>Outgoing chat bubble background</td></tr>
              <tr><td><code>chatBubbleOutForeground</code></td><td><code>--chat-bubble-out-foreground</code></td><td>Outgoing chat bubble text</td></tr>
              <tr><td><code>chatBubbleIn</code></td><td><code>--chat-bubble-in</code></td><td>Incoming chat bubble background</td></tr>
              <tr><td><code>chatBubbleInForeground</code></td><td><code>--chat-bubble-in-foreground</code></td><td>Incoming chat bubble text</td></tr>
              <tr><td><code>chatGradientFrom</code></td><td><code>--chat-gradient-from</code></td><td>Chat body gradient start (mobile)</td></tr>
              <tr><td><code>chatGradientVia</code></td><td><code>--chat-gradient-via</code></td><td>Chat body gradient mid (mobile)</td></tr>
              <tr><td><code>chatGradientTo</code></td><td><code>--chat-gradient-to</code></td><td>Chat body gradient end (mobile)</td></tr>
            </tbody>
          </table>

          <H3 id="theming-background">Chat background</H3>
          <p>
            By default the chat message area shows a Telegram-style gradient and a subtle icon pattern on
            mobile screens. Set <code>showChatBackground=&#123;false&#125;</code> to disable both for a clean,
            plain background — useful when you've set a custom <code>background</code> color token or want a
            minimal look.
          </p>
          <Code>{`<QuickChat
  supabaseUrl={url}
  supabaseAnonKey={key}
  showChatBackground={false}
/>`}</Code>
          <Note>
            <code>showChatBackground</code> only affects mobile screens. On desktop the chat area is always
            transparent against the app background.
          </Note>
        </section>

        {/* ── Guides ────────────────────────────────────────────────── */}
        <section className="docs-section">
          <H2 id="guides">Guides</H2>

          {/* External Auth Guide */}
          <H3 id="guide-external-auth">External Auth — Use Your Existing Supabase Session</H3>
          <p>
            <strong>Best for:</strong> apps already using Supabase Auth (email/password, Google, GitHub, etc.)
            where you want chat users to be the same as app users.
          </p>
          <Note>
            Your app's Supabase client and QuickChat must point to the <strong>same Supabase project URL</strong>.
            If they point to different projects, use the <a href="#guide-separate">separate project guide</a> instead.
          </Note>

          <h4>Step 1 — Run the migrations</h4>
          <p>Run the files from <code>/supabase/migrations/</code> in filename order against your project.</p>

          <h4>Step 2 — Build a userData object</h4>
          <Code>{`const { data: { session } } = await supabase.auth.getSession();

const chatUser = {
  id: session.user.id,               // Supabase UUID — do not substitute your own ID
  name: session.user.user_metadata.display_name
     ?? session.user.user_metadata.full_name
     ?? session.user.email!,
  avatar: session.user.user_metadata.avatar_url,
  email: session.user.email!,
  accessToken: session.access_token,   // required
  refreshToken: session.refresh_token, // required — omitting breaks auto-refresh
};`}</Code>

          <h4>Step 3 — Keep tokens fresh</h4>
          <p>Supabase access tokens expire after 1 hour. Subscribe to auth changes to forward new tokens:</p>
          <Code>{`import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { UserData } from "quick-chat-react";

export function useExternalChatAuth() {
  const [chatUser, setChatUser] = useState<UserData | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) buildChatUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) buildChatUser(session);
        else setChatUser(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  function buildChatUser(session) {
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
}`}</Code>

          <h4>Common mistakes</h4>
          <table className="docs-table">
            <thead>
              <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
            </thead>
            <tbody>
              <tr><td>Passing Firebase UID as <code>userData.id</code></td><td>No contacts, messages fail silently</td><td>Always use <code>session.user.id</code></td></tr>
              <tr><td>Omitting <code>refreshToken</code></td><td>Chat stops working after 1 hour</td><td>Always include <code>session.refresh_token</code></td></tr>
              <tr><td>Not subscribing to <code>onAuthStateChange</code></td><td>Token expires mid-session</td><td>Use the hook above</td></tr>
              <tr><td>Different Supabase project URLs</td><td>Auth works in app but fails in chat</td><td>Ensure both use the same <code>VITE_SUPABASE_URL</code></td></tr>
            </tbody>
          </table>
          <p style={{ marginTop: "1rem" }}>
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/docs/external-auth.md" target="_blank" rel="noopener noreferrer">
              → Full External Auth guide on GitHub
            </a>
          </p>

          {/* Startup Base Guide */}
          <H3 id="guide-startup">Using quick-chat-react as a Startup Base</H3>
          <p>
            With <code>authMode="built-in"</code> you get a complete user infrastructure in minutes:
            Supabase Auth, user profiles, real-time messaging, and a navbar avatar component.
          </p>
          <Tip>
            The <strong><code>profiles</code> table is yours.</strong> The library only reads the columns it needs
            (<code>display_name</code>, <code>avatar_url</code>, <code>bio</code>, <code>is_online</code>, <code>last_seen</code>).
            Anything else you add is invisible to it and fully under your control.
          </Tip>

          <h4>Extending the profiles table</h4>
          <Code>{`ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan      TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS role      TEXT DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS team_id   UUID,
  ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;`}</Code>
          <p>Nothing breaks — the library selects only named columns, never <code>SELECT *</code>.</p>

          <h4>Plan-based feature gating</h4>
          <Code>{`const profile = useMyProfile(userId);

<QuickChat
  supabaseUrl={url}
  supabaseAnonKey={key}
  authMode="built-in"
  allowVoiceMessages={profile?.plan === "pro"}
  allowFileUpload={profile?.plan !== "free"}
  showGroups={profile?.plan === "pro" || profile?.plan === "team"}
/>`}</Code>

          <h4>Team / workspace isolation via RLS</h4>
          <Code>{`-- Restrict contact search to same team
CREATE POLICY "Team members can view team profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid())
  );`}</Code>
          <p style={{ marginTop: "1rem" }}>
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/docs/startup-base.md" target="_blank" rel="noopener noreferrer">
              → Full Startup Base guide on GitHub
            </a>
          </p>

          {/* Lovable Guide */}
          <H3 id="guide-lovable">Lovable Projects — Existing profiles Table</H3>
          <p>
            Lovable-generated projects include a <code>profiles</code> table. Running the standard migrations
            will fail with <code>relation "profiles" already exists</code>.
          </p>

          <h4>Solution: Additive migration</h4>
          <p>
            Instead of the standard migration files, run{" "}
            <code>supabase/migrations/additive-for-existing-profiles.sql</code> from the SQL Editor.
          </p>
          <p>This migration:</p>
          <ul className="docs-list">
            <li>Does <strong>not</strong> drop or recreate your <code>profiles</code> table</li>
            <li>Adds chat-specific columns (<code>display_name</code>, <code>bio</code>, <code>is_online</code>, <code>last_seen</code>) using <code>ADD COLUMN IF NOT EXISTS</code></li>
            <li>Backfills <code>display_name</code> from <code>full_name</code> for existing rows</li>
            <li>Installs a sync trigger that keeps both columns in sync</li>
            <li>Creates all other chat tables (<code>contacts</code>, <code>conversations</code>, <code>messages</code>, etc.)</li>
          </ul>
          <Note>
            After running the additive migration, follow the{" "}
            <a href="#guide-external-auth">External Auth guide</a> — your Lovable project already has Supabase Auth.
          </Note>
          <p style={{ marginTop: "1rem" }}>
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/supabase/migrations/additive-for-existing-profiles.sql" target="_blank" rel="noopener noreferrer">
              → View additive-for-existing-profiles.sql on GitHub
            </a>
          </p>

          <h4>What changes in your schema</h4>
          <table className="docs-table">
            <thead>
              <tr><th>Change</th><th>Details</th></tr>
            </thead>
            <tbody>
              <tr><td><code>profiles.display_name</code> added</td><td>TEXT, backfilled from <code>full_name</code></td></tr>
              <tr><td><code>profiles.bio</code> added</td><td>TEXT, default ''</td></tr>
              <tr><td><code>profiles.is_online</code> added</td><td>BOOLEAN, default false</td></tr>
              <tr><td><code>profiles.last_seen</code> added</td><td>TIMESTAMPTZ</td></tr>
              <tr><td>Sync trigger installed</td><td><code>trg_sync_profile_names</code> — writes to either column, both stay in sync</td></tr>
              <tr><td>7 new tables created</td><td><code>contacts</code>, <code>conversations</code>, <code>conversation_members</code>, <code>messages</code>, <code>message_reads</code>, <code>message_reactions</code>, <code>user_roles</code></td></tr>
              <tr><td>Storage buckets</td><td><code>avatars</code> and <code>chat-media</code> (no-op if already exists)</td></tr>
            </tbody>
          </table>
          <p style={{ marginTop: "1rem" }}>
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/docs/lovable-existing-schema.md" target="_blank" rel="noopener noreferrer">
              → Full Lovable Schema guide on GitHub
            </a>
          </p>

          {/* Separate Project Guide */}
          <H3 id="guide-separate">Advanced — Separate Supabase Project</H3>
          <Tip>
            <strong>Simpler alternative:</strong> If you can point both your app and the chat at the same
            Supabase project, do that instead. See the <a href="#guide-external-auth">External Auth guide</a>.
          </Tip>
          <p>
            <strong>Best for:</strong> complete data isolation, separate billing, or main project schema conflicts.
          </p>

          <h4>Architecture</h4>
          <Code>{`User logs into your app  (Project A — your main Supabase)
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
<QuickChat authMode="external" userData={...} />  (Project B)`}</Code>

          <h4>Backend — /api/chat-token endpoint (Next.js example)</h4>
          <Code>{`export async function POST(req: Request) {
  // 1. Verify the caller is logged into your app
  const authHeader = req.headers.get("Authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  const { data: { user } } = await mainSupabase.auth.getUser(accessToken);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Get or create shadow user in chat project
  const chatUserId = await getOrCreateChatUser({ id: user.id, email: user.email!, ... });

  // 3. Create a session in the chat project
  const { data: sessionData } = await chatAdmin.auth.admin.createSession(chatUserId);

  return Response.json({
    supabaseUserId: chatUserId,
    accessToken: sessionData.session.access_token,
    refreshToken: sessionData.session.refresh_token,
  });
}`}</Code>

          <h4>Frontend — fetch token and pass to QuickChat</h4>
          <Code>{`export function ChatPage() {
  const chatUser = useSeparateProjectChat(); // fetches /api/chat-token

  if (!chatUser) return null;

  return (
    <QuickChat
      supabaseUrl={process.env.NEXT_PUBLIC_CHAT_SUPABASE_URL!}
      supabaseAnonKey={process.env.NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY!}
      authMode="external"
      userData={chatUser}
    />
  );
}`}</Code>

          <Note>
            <strong>Security:</strong> Never expose <code>CHAT_SUPABASE_SERVICE_ROLE_KEY</code> on the frontend.
            Shadow users in Project B have no password — they can only receive sessions through your{" "}
            <code>/api/chat-token</code> endpoint.
          </Note>
          <p style={{ marginTop: "1rem" }}>
            <a href="https://github.com/AndreyKornyusko/quick-chat-react/blob/main/docs/advanced-separate-project.md" target="_blank" rel="noopener noreferrer">
              → Full Separate Project guide on GitHub
            </a>
          </p>
        </section>

        {/* ── Security ──────────────────────────────────────────────── */}
        <section className="docs-section">
          <H2 id="security">Security Notes</H2>
          <ul className="docs-list">
            <li>
              The <strong>anon key</strong> is safe to expose on the frontend. All access is controlled by
              Supabase Row Level Security (RLS) — users can only read and write their own data.
            </li>
            <li>
              The <strong>service role key</strong> must never be exposed on the frontend. Use it only in your
              backend to generate access tokens.
            </li>
            <li>
              In external mode, <code>accessToken</code> grants the user access to Supabase. Treat it like
              a session token — send it over HTTPS, don't log it, and expire it appropriately.
            </li>
          </ul>

          <H3 id="security-storage">Public chat-media bucket (default)</H3>
          <p>
            By default, uploaded files (photos, voice messages, documents) are stored in a <strong>public</strong> Supabase
            Storage bucket — any direct file URL works without authentication. This is fine for demos and prototyping.
          </p>
          <p>
            <strong>For production apps with sensitive data</strong>, make the bucket private and generate signed URLs
            using the <code>onUploadFile</code> prop:
          </p>
          <ol className="docs-list">
            <li>
              Apply the optional migration:{" "}
              <code>supabase/migrations/20260316000000_optional_private_chat_media.sql</code>
              <br />
              <small>This sets the bucket to private and adds an RLS policy allowing only conversation members to access files.</small>
            </li>
            <li>
              Pass <code>onUploadFile</code> to <code>&lt;QuickChat&gt;</code> to handle the upload and return a signed URL.
            </li>
          </ol>
          <Code>{`// Private Supabase bucket with 1-hour signed URLs
<QuickChat
  supabaseUrl={url}
  supabaseAnonKey={key}
  authMode="external"
  userData={currentUser}
  onUploadFile={async (file) => {
    const path = \`\${currentUser.id}/\${Date.now()}-\${Math.random()}\`;
    await supabase.storage.from("chat-media").upload(path, file);
    const { data } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(path, 3600);
    return data.signedUrl;
  }}
/>

// Amazon S3 (via your own backend endpoint)
onUploadFile={async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload/s3", { method: "POST", body: form });
  const { url } = await res.json();
  return url;
}}

// Cloudinary
onUploadFile={async (file) => {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "your_unsigned_preset");
  const res = await fetch(
    "https://api.cloudinary.com/v1_1/your_cloud/upload",
    { method: "POST", body: form }
  );
  const { secure_url } = await res.json();
  return secure_url;
}}`}</Code>

          <H3 id="security-ratelimit">Rate limiting</H3>
          <p>
            Message sends and emoji reactions are rate-limited at the database layer via PostgreSQL triggers —
            no client-side workaround is possible:
          </p>
          <table className="docs-table">
            <thead>
              <tr><th>Action</th><th>Limit</th></tr>
            </thead>
            <tbody>
              <tr><td>Send message</td><td>30 per 60 seconds per user</td></tr>
              <tr><td>Add reaction</td><td>60 per 60 seconds per user</td></tr>
            </tbody>
          </table>
          <p>
            When a limit is hit, the failed message displays the reason in the chat UI instead of a generic
            "Not sent" error. The Retry button is hidden — retrying immediately would just fail again.
          </p>
          <p>
            To adjust the limits, edit the constants in{" "}
            <code>supabase/migrations/20260324000000_rate_limiting.sql</code> and re-run that migration against
            your Supabase project.
          </p>

          <H3 id="security-profiles">Profile visibility</H3>
          <p>
            All authenticated users can search and view all profiles by default. This is required so users
            can find someone to start a conversation with. For stricter privacy, add a <code>discoverability</code> boolean
            to your <code>profiles</code> table and filter search results via a Supabase Edge Function or your own backend.
          </p>
        </section>

      </main>
    </div>
  );
}
