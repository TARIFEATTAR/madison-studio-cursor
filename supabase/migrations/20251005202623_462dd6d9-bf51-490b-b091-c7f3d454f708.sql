-- Create calendar_tasks table
CREATE TABLE public.calendar_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  task_text text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  due_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_tasks
CREATE POLICY "Users can view their own tasks"
ON public.calendar_tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON public.calendar_tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.calendar_tasks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON public.calendar_tasks
FOR DELETE
USING (auth.uid() = user_id);

-- Create calendar_notes table
CREATE TABLE public.calendar_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  note_content text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_notes
CREATE POLICY "Users can view their own notes"
ON public.calendar_notes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
ON public.calendar_notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.calendar_notes
FOR UPDATE
USING (auth.uid() = user_id);

-- Add updated_at trigger for calendar_tasks
CREATE TRIGGER update_calendar_tasks_updated_at
BEFORE UPDATE ON public.calendar_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for calendar_notes
CREATE TRIGGER update_calendar_notes_updated_at
BEFORE UPDATE ON public.calendar_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();