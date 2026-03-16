-- OPTIONAL PRODUCTION SECURITY MIGRATION
--
-- By default the chat-media bucket is public (any URL works without auth).
-- This is fine for demos but not for production apps with sensitive data.
--
-- Apply this migration to make the bucket private and restrict file access
-- to authenticated conversation members only.
--
-- After applying this migration you MUST pass the `onUploadFile` prop to
-- <QuickChat> to generate signed URLs — otherwise uploaded files will return
-- 403 errors when the browser tries to display them.
--
-- Example (see README for full details):
--   onUploadFile={async (file, type) => {
--     const path = `${userId}/${conversationId}/${Date.now()}`;
--     await supabase.storage.from("chat-media").upload(path, file);
--     const { data } = await supabase.storage
--       .from("chat-media")
--       .createSignedUrl(path, 3600);
--     return data.signedUrl;
--   }}

-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chat-media';

-- Drop the open "Anyone can view" policy
DROP POLICY IF EXISTS "Anyone can view chat media" ON storage.objects;

-- Only conversation members can view files in that conversation's folder
-- Path format: {user_id}/{conversation_id}/{filename}
CREATE POLICY "Conversation members can view chat media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-media'
  AND EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id::text = (storage.foldername(name))[2]
    AND user_id = auth.uid()
  )
);
