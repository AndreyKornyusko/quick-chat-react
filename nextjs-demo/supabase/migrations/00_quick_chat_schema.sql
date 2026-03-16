-- ============================================================
-- quick-chat-react v1.0.4 — Required Supabase Schema
-- Run this file FIRST in your Supabase SQL Editor.
-- ============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.conversation_type AS ENUM ('private', 'group');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.member_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.message_type AS ENUM ('text', 'photo', 'video', 'file', 'voice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- Tables
-- ============================================================

-- Profiles (1:1 with auth.users)
-- The library reads: display_name, avatar_url, bio, is_online, last_seen
-- You can safely add any extra columns — the lib ignores them
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  bio           TEXT,
  is_online     BOOLEAN NOT NULL DEFAULT false,
  last_seen     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (used by has_role() helper function)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        public.conversation_type NOT NULL DEFAULT 'private',
  name        TEXT,
  avatar_url  TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversation members
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            public.member_role NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type              public.message_type NOT NULL DEFAULT 'text',
  content           TEXT,
  file_url          TEXT,
  file_name         TEXT,
  file_size         BIGINT,
  reply_to_id       UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  forwarded_from_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_deleted        BOOLEAN NOT NULL DEFAULT false,
  is_edited         BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Message reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Message reads (read receipts)
CREATE TABLE IF NOT EXISTS public.message_reads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, contact_id)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON public.message_reads(user_id, message_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON public.contacts(user_id);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('chat-files',  'chat-files',  false, 52428800,  NULL),
  ('chat-voices', 'chat-voices', false, 10485760,  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4']),
  ('avatars',     'avatars',     true,  5242880,   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Enable Row Level Security
-- ============================================================
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts             ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper functions (required by the library)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id UUID, _user_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_owner_or_admin(_conversation_id UUID, _user_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_id UUID, _viewer_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT _profile_id = _viewer_id
    OR EXISTS (
      SELECT 1 FROM public.contacts
      WHERE user_id = _viewer_id AND contact_id = _profile_id
    );
$$;

-- ============================================================
-- RLS Policies (drop-and-recreate so re-running is safe)
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "profiles: read own or contact"    ON public.profiles;
DROP POLICY IF EXISTS "profiles: read by authenticated"  ON public.profiles;
DROP POLICY IF EXISTS "profiles: update own"             ON public.profiles;
DROP POLICY IF EXISTS "profiles: insert own"             ON public.profiles;
-- All authenticated users can read profiles — required for contact search
CREATE POLICY "profiles: read by authenticated" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles: update own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: insert own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles
DROP POLICY IF EXISTS "user_roles: read own" ON public.user_roles;
CREATE POLICY "user_roles: read own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- conversations
DROP POLICY IF EXISTS "conversations: read if member"        ON public.conversations;
DROP POLICY IF EXISTS "conversations: insert"                ON public.conversations;
DROP POLICY IF EXISTS "conversations: update if owner/admin" ON public.conversations;
DROP POLICY IF EXISTS "conversations: delete if owner"       ON public.conversations;
CREATE POLICY "conversations: read if member" ON public.conversations
  FOR SELECT USING (public.is_conversation_member(id, auth.uid()));
CREATE POLICY "conversations: insert" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "conversations: update if owner/admin" ON public.conversations
  FOR UPDATE USING (public.is_conversation_owner_or_admin(id, auth.uid()));
CREATE POLICY "conversations: delete if owner" ON public.conversations
  FOR DELETE USING (public.is_conversation_owner_or_admin(id, auth.uid()));

-- conversation_members
DROP POLICY IF EXISTS "members: read if member of conversation" ON public.conversation_members;
DROP POLICY IF EXISTS "members: insert own"                     ON public.conversation_members;
DROP POLICY IF EXISTS "members: insert"                         ON public.conversation_members;
DROP POLICY IF EXISTS "members: delete own"                     ON public.conversation_members;
CREATE POLICY "members: read if member of conversation" ON public.conversation_members
  FOR SELECT USING (public.is_conversation_member(conversation_id, auth.uid()));
-- Allow inserting yourself OR inserting another user if you are the conversation owner/admin
CREATE POLICY "members: insert" ON public.conversation_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR public.is_conversation_owner_or_admin(conversation_id, auth.uid())
  );
CREATE POLICY "members: delete own" ON public.conversation_members
  FOR DELETE USING (auth.uid() = user_id);

-- messages
DROP POLICY IF EXISTS "messages: read if member"   ON public.messages;
DROP POLICY IF EXISTS "messages: insert if member" ON public.messages;
DROP POLICY IF EXISTS "messages: update own"       ON public.messages;
DROP POLICY IF EXISTS "messages: delete own"       ON public.messages;
CREATE POLICY "messages: read if member" ON public.messages
  FOR SELECT USING (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "messages: insert if member" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND public.is_conversation_member(conversation_id, auth.uid())
  );
CREATE POLICY "messages: update own" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "messages: delete own" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id);

-- message_reactions
DROP POLICY IF EXISTS "reactions: read if conversation member" ON public.message_reactions;
DROP POLICY IF EXISTS "reactions: insert own"                  ON public.message_reactions;
DROP POLICY IF EXISTS "reactions: delete own"                  ON public.message_reactions;
CREATE POLICY "reactions: read if conversation member" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
        AND public.is_conversation_member(m.conversation_id, auth.uid())
    )
  );
CREATE POLICY "reactions: insert own" ON public.message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions: delete own" ON public.message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- message_reads
DROP POLICY IF EXISTS "reads: read own"   ON public.message_reads;
DROP POLICY IF EXISTS "reads: insert own" ON public.message_reads;
CREATE POLICY "reads: read own"   ON public.message_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reads: insert own" ON public.message_reads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- contacts
DROP POLICY IF EXISTS "contacts: read own"   ON public.contacts;
DROP POLICY IF EXISTS "contacts: insert own" ON public.contacts;
DROP POLICY IF EXISTS "contacts: delete own" ON public.contacts;
CREATE POLICY "contacts: read own"   ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contacts: insert own" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts: delete own" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Storage policies
DROP POLICY IF EXISTS "avatars: public read"           ON storage.objects;
DROP POLICY IF EXISTS "avatars: authenticated upload"  ON storage.objects;
DROP POLICY IF EXISTS "chat-files: member read"        ON storage.objects;
DROP POLICY IF EXISTS "chat-files: member upload"      ON storage.objects;
DROP POLICY IF EXISTS "chat-voices: member read"       ON storage.objects;
DROP POLICY IF EXISTS "chat-voices: member upload"     ON storage.objects;
CREATE POLICY "avatars: public read"          ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars: authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "chat-files: member read"       ON storage.objects FOR SELECT USING (bucket_id = 'chat-files'  AND auth.role() = 'authenticated');
CREATE POLICY "chat-files: member upload"     ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-files'  AND auth.role() = 'authenticated');
CREATE POLICY "chat-voices: member read"      ON storage.objects FOR SELECT USING (bucket_id = 'chat-voices' AND auth.role() = 'authenticated');
CREATE POLICY "chat-voices: member upload"    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-voices' AND auth.role() = 'authenticated');
