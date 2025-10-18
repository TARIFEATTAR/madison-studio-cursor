-- Create video completions table to track user progress
CREATE TABLE public.video_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_video UNIQUE (user_id, video_id)
);

-- Create index for performance
CREATE INDEX idx_video_completions_user_id ON public.video_completions(user_id);

-- Enable RLS
ALTER TABLE public.video_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own completions
CREATE POLICY "Users can view their own video completions"
  ON public.video_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video completions"
  ON public.video_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video completions"
  ON public.video_completions
  FOR DELETE
  USING (auth.uid() = user_id);