-- ============================================================
-- App-specific extensions to the quick-chat-react base schema
-- Run AFTER 00_quick_chat_schema.sql
-- ============================================================

-- Extend the profiles table with app-specific columns.
-- The library only reads: display_name, avatar_url, bio, is_online, last_seen
-- Everything below is purely for your app's own logic.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan       TEXT    NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS role       TEXT    NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS onboarded  BOOLEAN NOT NULL DEFAULT false;

-- Example: add a team / organisation for multi-tenant apps
-- ALTER TABLE public.profiles
--   ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id);
