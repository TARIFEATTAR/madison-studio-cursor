-- Add created_by column to calendar_schedule table
ALTER TABLE public.calendar_schedule 
ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set existing rows to a default user (if any exist)
-- This will be NULL for existing rows, which is fine since we'll make it NOT NULL after

-- Make created_by NOT NULL for new inserts
ALTER TABLE public.calendar_schedule 
ALTER COLUMN created_by SET NOT NULL;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view calendar schedules" ON public.calendar_schedule;
DROP POLICY IF EXISTS "Users can insert calendar schedules" ON public.calendar_schedule;
DROP POLICY IF EXISTS "Users can update calendar schedules" ON public.calendar_schedule;
DROP POLICY IF EXISTS "Users can delete calendar schedules" ON public.calendar_schedule;

-- Create secure policies that restrict access to content creator
CREATE POLICY "Users can view their own calendar schedules"
  ON public.calendar_schedule FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own calendar schedules"
  ON public.calendar_schedule FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own calendar schedules"
  ON public.calendar_schedule FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own calendar schedules"
  ON public.calendar_schedule FOR DELETE
  USING (auth.uid() = created_by);