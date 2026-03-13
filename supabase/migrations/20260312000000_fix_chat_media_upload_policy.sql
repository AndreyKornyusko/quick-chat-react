-- Tighten chat-media INSERT to enforce uploader ownership.
-- New path format: {user_id}/{conversation_id}/{filename}
-- Consistent with the existing DELETE policy which uses the same foldername check.

DROP POLICY IF EXISTS "Authenticated users can upload chat media" ON storage.objects;

CREATE POLICY "Users can upload own chat media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
