import { CodeBlock } from "@/components/demo/CodeBlock";
import { PropsTable, type PropDef } from "@/components/demo/PropsTable";
import { DemoPlayground } from "@/components/demo/DemoPlayground";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Package, Database, Key, ChevronDown, ExternalLink, Zap, Shield } from "lucide-react";

const quickChatProps: PropDef[] = [
  { name: "supabaseUrl", type: "string", default: "", required: true, description: "Your Supabase project URL" },
  { name: "supabaseAnonKey", type: "string", default: "", required: true, description: "Your Supabase anon/publishable key" },
  { name: "userData", type: "UserData", default: "", required: false, description: "User info object (required when authMode is 'external')" },
  { name: "theme", type: "'light' | 'dark' | 'system'", default: "'system'", required: false, description: "UI color theme" },
  { name: "authMode", type: "'built-in' | 'external'", default: "'built-in'", required: false, description: "Use built-in Supabase auth or pass your own user data" },
  { name: "showGroups", type: "boolean", default: "true", required: false, description: "Show group conversations in sidebar" },
  { name: "allowVoiceMessages", type: "boolean", default: "true", required: false, description: "Enable voice message recording" },
  { name: "allowFileUpload", type: "boolean", default: "true", required: false, description: "Enable file and photo uploads" },
  { name: "allowReactions", type: "boolean", default: "true", required: false, description: "Enable emoji reactions on messages" },
  { name: "showOnlineStatus", type: "boolean", default: "true", required: false, description: "Show green online indicator dots" },
  { name: "showReadReceipts", type: "boolean", default: "true", required: false, description: "Show read receipt checkmarks" },
  { name: "height", type: "string", default: "'100vh'", required: false, description: "Container height CSS value" },
  { name: "width", type: "string", default: "'100%'", required: false, description: "Container width CSS value" },
  { name: "onUnreadCountChange", type: "(count: number) => void", default: "", required: false, description: "Callback fired when unread message count changes" },
  { name: "onConversationSelect", type: "(id: string) => void", default: "", required: false, description: "Callback fired when a conversation is selected" },
];

const chatButtonProps: PropDef[] = [
  { name: "supabaseUrl", type: "string", default: "", required: true, description: "Your Supabase project URL" },
  { name: "supabaseAnonKey", type: "string", default: "", required: true, description: "Your Supabase anon/publishable key" },
  { name: "userData", type: "UserData", default: "", required: false, description: "User data for fetching unread count" },
  { name: "onClick", type: "() => void", default: "", required: false, description: "Custom click handler" },
  { name: "href", type: "string", default: "", required: false, description: "URL to navigate to on click" },
  { name: "position", type: "'bottom-right' | 'bottom-left'", default: "'bottom-right'", required: false, description: "Fixed position on screen" },
  { name: "unreadCount", type: "number", default: "auto", required: false, description: "Manually override unread count badge" },
  { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", required: false, description: "Button size variant" },
  { name: "badgeColor", type: "string", default: "primary", required: false, description: "Badge background color" },
  { name: "icon", type: "ReactNode", default: "MessageCircle", required: false, description: "Custom icon element" },
];

const userDataProps: PropDef[] = [
  { name: "id", type: "string", default: "", required: true, description: "Unique user identifier (UUID)" },
  { name: "name", type: "string", default: "", required: true, description: "Display name shown in chat" },
  { name: "avatar", type: "string", default: "", required: false, description: "Avatar image URL" },
  { name: "description", type: "string", default: "", required: false, description: "User bio or status message" },
  { name: "email", type: "string", default: "", required: false, description: "User email address" },
];

const migrationSQL = `-- ============================================
-- quick-chat-react: Required Supabase Migration
-- ============================================

-- 1. Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.conversation_type AS ENUM ('private', 'group');
CREATE TYPE public.member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.message_type AS ENUM ('text', 'photo', 'video', 'file', 'voice');

-- 2. Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type conversation_type DEFAULT 'private',
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 4. Conversation members
CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role member_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- 5. Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT,
  type message_type DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  reply_to_id UUID REFERENCES messages(id),
  forwarded_from_id UUID REFERENCES messages(id),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Message reactions
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- 7. Message read receipts
CREATE TABLE public.message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id)
);
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- 8. Contacts
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, contact_id)
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 9. User roles (for admin features)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 10. Security definer helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$;

-- 11. Auto-create profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

const installCode = `npm install quick-chat-react`;

const envCode = `# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...`;

const basicUsage = `import { QuickChat } from 'quick-chat-react';
import 'quick-chat-react/style.css';

function App() {
  return (
    <QuickChat
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseAnonKey={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}
    />
  );
}`;

const externalAuthUsage = `import { QuickChat } from 'quick-chat-react';
import 'quick-chat-react/style.css';

function App() {
  const currentUser = useYourAuth(); // your auth hook

  return (
    <QuickChat
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseAnonKey={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}
      authMode="external"
      userData={{
        id: currentUser.id,
        name: currentUser.displayName,
        avatar: currentUser.photoURL,
        email: currentUser.email,
      }}
      theme="dark"
      showGroups={true}
      allowVoiceMessages={true}
    />
  );
}`;

const chatButtonUsage = `import { ChatButton } from 'quick-chat-react';
import 'quick-chat-react/style.css';

function Layout() {
  return (
    <>
      {/* Your app content */}
      <ChatButton
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
        supabaseAnonKey={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}
        href="/chat"
        position="bottom-right"
        size="md"
      />
    </>
  );
}`;

const Demo = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">quick-chat-react</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A drop-in, full-featured chat component for React. Powered by Supabase.
            Real-time messaging, groups, voice, file uploads, reactions — all configurable via props.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Badge variant="secondary" className="gap-1"><Package className="h-3 w-3" /> npm</Badge>
            <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" /> Real-time</Badge>
            <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> RLS</Badge>
          </div>
          <div className="pt-4">
            <CodeBlock code={installCode} language="bash" className="max-w-md mx-auto" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Quick Start */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> Quick Start
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">1. Install</h3>
              <CodeBlock code={installCode} language="bash" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">2. Set Environment Variables</h3>
              <CodeBlock code={envCode} language="env" title=".env" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">3. Use the Component</h3>
              <CodeBlock code={basicUsage} language="tsx" title="App.tsx — Built-in Auth" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">4. Or with External Auth</h3>
              <CodeBlock code={externalAuthUsage} language="tsx" title="App.tsx — External Auth" />
            </div>
          </div>
        </section>

        {/* Live Playground */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" /> Interactive Playground
          </h2>
          <p className="text-muted-foreground">
            Toggle props below to see how the component configuration changes. The mock preview updates in real-time.
          </p>
          <DemoPlayground />
        </section>

        {/* ChatButton Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">ChatButton — Floating Icon</h2>
          <p className="text-muted-foreground">
            Add a floating message icon with unread badge anywhere in your app. Click redirects to your chat page.
          </p>
          <CodeBlock code={chatButtonUsage} language="tsx" title="Layout.tsx" />
          {/* Visual demo */}
          <div className="relative h-32 rounded-lg border border-border bg-muted/20 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Your application content</span>
            <div className="absolute bottom-4 right-4">
              <button className="relative h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
                <MessageCircle className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Props Tables */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold">Props Reference</h2>
          <PropsTable title="<QuickChat /> Props" props={quickChatProps} />
          <PropsTable title="<ChatButton /> Props" props={chatButtonProps} />
          <PropsTable title="UserData Interface" props={userDataProps} />
        </section>

        {/* Environment Variables */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" /> Environment Variables
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">Variable</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Where to Find</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-mono text-xs text-primary">VITE_SUPABASE_URL</td>
                  <td className="px-4 py-3 text-muted-foreground">Your Supabase project URL</td>
                  <td className="px-4 py-3 text-muted-foreground">Supabase Dashboard → Settings → API</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-primary">VITE_SUPABASE_PUBLISHABLE_KEY</td>
                  <td className="px-4 py-3 text-muted-foreground">Supabase anon (publishable) key</td>
                  <td className="px-4 py-3 text-muted-foreground">Supabase Dashboard → Settings → API → anon key</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold text-destructive">⚠️ Security Note</p>
            <p className="text-muted-foreground mt-1">
              Only use the <strong>anon/publishable</strong> key in client-side code. Never expose your <code className="bg-muted px-1 rounded">service_role</code> key.
              All data access is protected by Row Level Security (RLS) policies on your Supabase tables.
            </p>
          </div>
        </section>

        {/* Supabase Setup */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> Supabase Database Setup
          </h2>
          <p className="text-muted-foreground">
            Run this migration in your Supabase SQL Editor to create all required tables, enums, and security functions.
            This sets up: profiles, conversations, messages, reactions, read receipts, contacts, and user roles.
          </p>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm space-y-2">
            <p className="font-semibold text-amber-600 dark:text-amber-400">⚠️ Sensitive Data Warning</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>This migration creates tables that store <strong>user profiles, messages, and contact relationships</strong></li>
              <li>Ensure you have <strong>Row Level Security (RLS) enabled</strong> on all tables (included in migration)</li>
              <li>Add appropriate <strong>RLS policies</strong> to restrict access per user</li>
              <li>Never disable RLS in production — all queries run as the authenticated user</li>
              <li>Review and customize the policies to match your application's authorization model</li>
            </ul>
          </div>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:underline cursor-pointer">
              <ChevronDown className="h-4 w-4" />
              Show full migration SQL
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <CodeBlock code={migrationSQL} language="sql" title="supabase_migration.sql" />
            </CollapsibleContent>
          </Collapsible>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-12 text-center text-sm text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">quick-chat-react</p>
          <p>Built with React, Tailwind CSS, and Supabase</p>
          <a href="https://github.com" className="inline-flex items-center gap-1 text-primary hover:underline">
            View on GitHub <ExternalLink className="h-3 w-3" />
          </a>
        </footer>
      </main>
    </div>
  );
};

export default Demo;
