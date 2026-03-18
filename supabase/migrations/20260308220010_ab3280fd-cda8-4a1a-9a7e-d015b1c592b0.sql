-- Add video_url and has_video_feature columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_video_feature boolean DEFAULT false;

-- Create storage bucket for profile videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-videos', 'profile-videos', true, 31457280, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- RLS for profile-videos bucket
CREATE POLICY "Users can upload own videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view profile videos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-videos');