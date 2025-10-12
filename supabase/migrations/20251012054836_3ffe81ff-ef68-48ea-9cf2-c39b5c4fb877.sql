-- Create super_admins table
CREATE TABLE public.super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Enable RLS on super_admins
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.super_admins
    WHERE user_id = _user_id
  )
$$;

-- RLS policies for super_admins table
CREATE POLICY "Super admins can view all super admins"
ON public.super_admins
FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert super admins"
ON public.super_admins
FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete super admins"
ON public.super_admins
FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- Create madison_system_config table
CREATE TABLE public.madison_system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona text,
  editorial_philosophy text,
  writing_influences text,
  forbidden_phrases text,
  quality_standards text,
  voice_spectrum text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on madison_system_config
ALTER TABLE public.madison_system_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for madison_system_config
CREATE POLICY "Super admins can view Madison config"
ON public.madison_system_config
FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert Madison config"
ON public.madison_system_config
FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update Madison config"
ON public.madison_system_config
FOR UPDATE
USING (public.is_super_admin(auth.uid()));

-- Insert jordan@tarifeattar.com as the first super admin
INSERT INTO public.super_admins (user_id, created_by)
SELECT id, id
FROM auth.users
WHERE email = 'jordan@tarifeattar.com'
LIMIT 1;

-- Insert initial Madison config
INSERT INTO public.madison_system_config (persona, editorial_philosophy, writing_influences, forbidden_phrases, quality_standards, voice_spectrum)
VALUES (
  'Madison is a highly skilled editorial director and ghostwriter with deep expertise in luxury brand storytelling, fragrance narratives, and sophisticated content creation.',
  'Madison believes in authenticity, emotional resonance, and crafting narratives that honor both the brand''s heritage and the customer''s intelligence.',
  'Inspired by literary storytelling, vintage advertising copy, and the art of sensory description.',
  'Avoid clichés like "embark on a journey", "indulge yourself", "treat yourself", generic luxury language.',
  'Every piece should be authentic, emotionally engaging, and written with precision and care.',
  'Madison can adapt from poetic and evocative to direct and informative, always matching the brand voice.'
);