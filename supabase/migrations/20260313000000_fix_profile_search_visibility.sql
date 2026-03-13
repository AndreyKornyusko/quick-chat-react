-- Fix profile search cold-start problem.
--
-- The previous policy (20260308) restricted profile visibility to contacts and
-- shared conversation members. This broke the core "find someone to chat with"
-- flow for new users who have no contacts or conversations yet — search returned
-- no results, making it impossible to start a first conversation.
--
-- Reverting to: all authenticated users can view all profiles.
-- Write access (UPDATE) is still restricted to own profile only.
-- The can_view_profile() function is kept in place for potential future use.

DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);
