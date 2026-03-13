-- ============================================================
-- quick-chat-react: Additive Migration for Existing profiles Table
-- ============================================================
-- Use this file INSTEAD of the standard migration files if your
-- project already has a `profiles` table (e.g. a Lovable-generated
-- schema). This migration does NOT drop or recreate your table —
-- it only adds the columns and objects that quick-chat-react needs.
--
-- If your project does NOT have a `profiles` table yet, use the
-- standard migration files in filename order instead.
-- ============================================================


-- ==========================================
-- 1. ENUM TYPES
-- ==========================================
DO $$ BEGIN
  CREATE TYPE public.conversation_type AS ENUM ('private', 'group');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.member_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.message_type AS ENUM ('text', 'photo', 'video', 'file', 'voice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ==========================================
-- 2. EXTEND EXISTING profiles TABLE
-- ==========================================
-- Add chat-specific columns. IF NOT EXISTS makes this safe to run
-- on any schema regardless of which columns already exist.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio         TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_online   BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen   TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill display_name from full_name (Lovable-generated column)
-- Safe if full_name does not exist — the DO block catches the error.
DO $$ BEGIN
  UPDATE public.profiles
  SET display_name = COALESCE(full_name, display_name)
  WHERE display_name = '';
EXCEPTION WHEN undefined_column THEN
  -- full_name column does not exist, nothing to backfill
  NULL;
END $$;

-- Sync trigger: keep full_name and display_name consistent whenever
-- either one is written. Handles both Lovable (writes full_name) and
-- quick-chat-react (writes display_name) update paths automatically.
CREATE OR REPLACE FUNCTION public.sync_profile_names()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    -- full_name changed → mirror into display_name
    IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
      NEW.display_name := COALESCE(NEW.full_name, NEW.display_name);
    -- display_name changed → mirror into full_name
    ELSIF NEW.display_name IS DISTINCT FROM OLD.display_name THEN
      NEW.full_name := NEW.display_name;
    END IF;
  EXCEPTION WHEN undefined_column THEN
    -- full_name does not exist on this schema — no sync needed
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_names ON public.profiles;
CREATE TRIGGER trg_sync_profile_names
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_names();


-- ==========================================
-- 3. REPLACE handle_new_user TRIGGER
-- ==========================================
-- Replaces any existing trigger with an upsert-safe version that
-- works whether or not a profiles row already exists for the user.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url   = COALESCE(EXCLUDED.avatar_url,   profiles.avatar_url);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 4. HELPER TABLES (safe — do not exist in standard Lovable schemas)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, contact_id),
  CHECK (user_id <> contact_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       public.conversation_type NOT NULL DEFAULT 'private',
  name       TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            public.member_role NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content             TEXT,
  type                public.message_type NOT NULL DEFAULT 'text',
  file_url            TEXT,
  file_name           TEXT,
  file_size           BIGINT,
  reply_to_id         UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  forwarded_from_id   UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_edited           BOOLEAN DEFAULT false,
  is_deleted          BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_reads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji      TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    public.app_role NOT NULL,
  UNIQUE(user_id, role)
);


-- ==========================================
-- 5. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_contacts_user       ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact    ON public.contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_conv   ON public.conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_user   ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv       ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender     ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created    ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_reads_msg   ON public.message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user  ON public.message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_content_search
  ON public.messages USING gin(to_tsvector('english', coalesce(content, '')));


-- ==========================================
-- 6. HELPER FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_owner_or_admin(_conversation_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_profile(_viewer_id uuid, _profile_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    _viewer_id = _profile_id
    OR EXISTS (
      SELECT 1 FROM public.conversation_members cm1
      JOIN public.conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
      WHERE cm1.user_id = _viewer_id AND cm2.user_id = _profile_id
    )
    OR EXISTS (
      SELECT 1 FROM public.contacts
      WHERE (user_id = _viewer_id AND contact_id = _profile_id)
         OR (user_id = _profile_id AND contact_id = _viewer_id)
    );
$$;


-- ==========================================
-- 7. SHARED TRIGGERS (updated_at, conversation bump)
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_updates_conversation ON public.messages;
CREATE TRIGGER trg_message_updates_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();


-- ==========================================
-- 8. ENABLE RLS
-- ==========================================
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles         ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 9. RLS POLICIES
-- ==========================================

-- PROFILES
-- Drop any existing SELECT policy so we install the correct one.
DROP POLICY IF EXISTS "Users can view all profiles"        ON public.profiles;
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"       ON public.profiles;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- CONTACTS
DROP POLICY IF EXISTS "Users can view own contacts"  ON public.contacts;
DROP POLICY IF EXISTS "Users can add contacts"       ON public.contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;

CREATE POLICY "Users can view own contacts"
  ON public.contacts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR contact_id = auth.uid());

CREATE POLICY "Users can add contacts"
  ON public.contacts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND contact_id <> auth.uid());

CREATE POLICY "Users can delete own contacts"
  ON public.contacts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- CONVERSATIONS
DROP POLICY IF EXISTS "Members can view conversations"              ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations"             ON public.conversations;
DROP POLICY IF EXISTS "Owners/admins can update group conversations" ON public.conversations;

CREATE POLICY "Members can view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (is_conversation_member(id, auth.uid()) OR created_by = auth.uid());

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners/admins can update group conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (is_conversation_owner_or_admin(id, auth.uid()));

-- CONVERSATION MEMBERS
DROP POLICY IF EXISTS "Members can view conversation members" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can join conversations"          ON public.conversation_members;
DROP POLICY IF EXISTS "Owners/admins can update members"      ON public.conversation_members;
DROP POLICY IF EXISTS "Owners/admins can remove members"      ON public.conversation_members;

CREATE POLICY "Members can view conversation members"
  ON public.conversation_members FOR SELECT TO authenticated
  USING (is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Users can join conversations"
  ON public.conversation_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_conversation_owner_or_admin(conversation_id, auth.uid()));

CREATE POLICY "Owners/admins can update members"
  ON public.conversation_members FOR UPDATE TO authenticated
  USING (is_conversation_owner_or_admin(conversation_id, auth.uid()));

CREATE POLICY "Owners/admins can remove members"
  ON public.conversation_members FOR DELETE TO authenticated
  USING (is_conversation_owner_or_admin(conversation_id, auth.uid()) OR user_id = auth.uid());

-- MESSAGES
DROP POLICY IF EXISTS "Members can view messages"  ON public.messages;
DROP POLICY IF EXISTS "Members can send messages"  ON public.messages;
DROP POLICY IF EXISTS "Senders can edit messages"  ON public.messages;
DROP POLICY IF EXISTS "Senders can delete messages" ON public.messages;

CREATE POLICY "Members can view messages"
  ON public.messages FOR SELECT TO authenticated
  USING (is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Senders can edit messages"
  ON public.messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Senders can delete messages"
  ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- MESSAGE READS
DROP POLICY IF EXISTS "Members can view read receipts"       ON public.message_reads;
DROP POLICY IF EXISTS "Members can mark messages as read"    ON public.message_reads;

CREATE POLICY "Members can view read receipts"
  ON public.message_reads FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = message_id
      AND is_conversation_member(m.conversation_id, auth.uid())
  ));

CREATE POLICY "Members can mark messages as read"
  ON public.message_reads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = message_id
      AND is_conversation_member(m.conversation_id, auth.uid())
  ));

-- MESSAGE REACTIONS
DROP POLICY IF EXISTS "Users can view reactions in their conversations" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can add reactions"                         ON public.message_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions"            ON public.message_reactions;

CREATE POLICY "Users can view reactions in their conversations"
  ON public.message_reactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
    WHERE m.id = message_reactions.message_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Users can add reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- USER ROLES
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ==========================================
-- 10. STORAGE BUCKETS (idempotent)
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
DROP POLICY IF EXISTS "Anyone can view avatars"    ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Chat media storage policies
DROP POLICY IF EXISTS "Authenticated users can upload chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own chat media"           ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat media"                ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat media"           ON storage.objects;

CREATE POLICY "Anyone can view chat media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-media');

CREATE POLICY "Users can upload own chat media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own chat media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ==========================================
-- 11. REALTIME
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
