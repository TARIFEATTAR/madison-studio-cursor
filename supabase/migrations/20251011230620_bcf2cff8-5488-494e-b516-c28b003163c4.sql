-- Drop vocabulary_library table
DROP TABLE IF EXISTS public.vocabulary_library CASCADE;

-- Drop dip_week_calendar table
DROP TABLE IF EXISTS public.dip_week_calendar CASCADE;

-- Remove dip_week column from master_content
ALTER TABLE public.master_content DROP COLUMN IF EXISTS dip_week;

-- Remove pillar_focus column from master_content
ALTER TABLE public.master_content DROP COLUMN IF EXISTS pillar_focus;

-- Remove dip_week column from prompts
ALTER TABLE public.prompts DROP COLUMN IF EXISTS dip_week;

-- Remove pillar_focus column from prompts
ALTER TABLE public.prompts DROP COLUMN IF EXISTS pillar_focus;

-- Remove dip_week column from scheduled_content
ALTER TABLE public.scheduled_content DROP COLUMN IF EXISTS dip_week;

-- Remove pillar column from scheduled_content
ALTER TABLE public.scheduled_content DROP COLUMN IF EXISTS pillar;

-- Remove pillar column from calendar_schedule
ALTER TABLE public.calendar_schedule DROP COLUMN IF EXISTS pillar;

-- Remove visual_world column from calendar_schedule
ALTER TABLE public.calendar_schedule DROP COLUMN IF EXISTS visual_world;

-- Drop the enum types
DROP TYPE IF EXISTS public.pillar_type CASCADE;
DROP TYPE IF EXISTS public.visual_world CASCADE;