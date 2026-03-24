-- Rate limiting via BEFORE INSERT triggers
-- Messages:  30 per 60 seconds per user
-- Reactions: 60 per 60 seconds per user
--
-- Limits are intentionally generous for normal chat usage.
-- Adjust the constants inside each function to tune for your app.

-- ─── Messages ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
  rate_limit   CONSTANT INTEGER := 30;
  window_secs  CONSTANT INTEGER := 60;
BEGIN
  SELECT COUNT(*)
  INTO recent_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND created_at > NOW() - (window_secs || ' seconds')::INTERVAL;

  IF recent_count >= rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded: you can send at most % messages per % seconds. Please slow down.',
      rate_limit, window_secs
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER rate_limit_messages
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_rate_limit();

-- ─── Reactions ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_reaction_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
  rate_limit   CONSTANT INTEGER := 60;
  window_secs  CONSTANT INTEGER := 60;
BEGIN
  SELECT COUNT(*)
  INTO recent_count
  FROM public.message_reactions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - (window_secs || ' seconds')::INTERVAL;

  IF recent_count >= rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded: you can add at most % reactions per % seconds. Please slow down.',
      rate_limit, window_secs
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER rate_limit_reactions
  BEFORE INSERT ON public.message_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_reaction_rate_limit();
