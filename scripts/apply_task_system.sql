-- ═══════════════════════════════════════════════════════════════════════════════
-- APPLY TASK SYSTEM
-- Run this in the Supabase SQL Editor to enable the task system
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create enums
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM (
      'pending', 'in_progress', 'review', 'blocked', 'completed', 'cancelled'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'due_date_type') THEN
    CREATE TYPE public.due_date_type AS ENUM ('flexible', 'firm', 'blocker');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE public.activity_type AS ENUM (
      'created', 'updated', 'status_changed', 'assigned', 'commented',
      'attachment_added', 'due_date_changed', 'completed', 'reopened'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'task_assigned', 'task_mentioned', 'task_due_soon', 'task_overdue',
      'task_completed', 'task_commented', 'task_status_changed',
      'product_updated', 'certification_expiring', 'sds_outdated'
    );
  END IF;
END $$;

-- Product Stages table
CREATE TABLE IF NOT EXISTS public.product_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'Circle',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  default_assignee_role public.team_role,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_stage_name_per_org UNIQUE (organization_id, name)
);

-- Product Tasks table
CREATE TABLE IF NOT EXISTS public.product_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status DEFAULT 'pending',
  priority public.task_priority DEFAULT 'medium',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  due_date_type public.due_date_type DEFAULT 'flexible',
  stage_id UUID REFERENCES public.product_stages(id) ON DELETE SET NULL,
  section TEXT,
  tags TEXT[] DEFAULT '{}',
  context_notes TEXT,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  parent_task_id UUID REFERENCES public.product_tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.product_tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Activity table
CREATE TABLE IF NOT EXISTS public.product_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.product_tasks(id) ON DELETE CASCADE,
  activity_type public.activity_type NOT NULL,
  description TEXT,
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  product_id UUID REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.product_tasks(id) ON DELETE CASCADE,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_tasks_org ON public.product_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_tasks_product ON public.product_tasks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tasks_assignee ON public.product_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_product_tasks_status ON public.product_tasks(status);
CREATE INDEX IF NOT EXISTS idx_product_tasks_due_date ON public.product_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_product_activity_org ON public.product_activity(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE NOT is_read;

-- Enable RLS
ALTER TABLE public.product_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "product_stages_select" ON public.product_stages;
CREATE POLICY "product_stages_select" ON public.product_stages
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

DROP POLICY IF EXISTS "product_stages_all" ON public.product_stages;
CREATE POLICY "product_stages_all" ON public.product_stages
  FOR ALL USING (organization_id = ANY(public.get_user_organization_ids()));

DROP POLICY IF EXISTS "product_tasks_select" ON public.product_tasks;
CREATE POLICY "product_tasks_select" ON public.product_tasks
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

DROP POLICY IF EXISTS "product_tasks_all" ON public.product_tasks;
CREATE POLICY "product_tasks_all" ON public.product_tasks
  FOR ALL USING (organization_id = ANY(public.get_user_organization_ids()));

DROP POLICY IF EXISTS "task_comments_select" ON public.task_comments;
CREATE POLICY "task_comments_select" ON public.task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_tasks t
      WHERE t.id = task_id AND t.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "task_comments_insert" ON public.task_comments;
CREATE POLICY "task_comments_insert" ON public.task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_tasks t
      WHERE t.id = task_id AND t.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_activity_select" ON public.product_activity;
CREATE POLICY "product_activity_select" ON public.product_activity
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_team_workload(_org_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  team_role public.team_role,
  pending_tasks BIGINT,
  in_progress_tasks BIGINT,
  overdue_tasks BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    om.user_id,
    p.full_name,
    p.email,
    om.team_role,
    COUNT(t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
    COUNT(t.id) FILTER (WHERE t.status IN ('pending', 'in_progress') AND t.due_date < NOW()) as overdue_tasks
  FROM public.organization_members om
  LEFT JOIN public.profiles p ON p.id = om.user_id
  LEFT JOIN public.product_tasks t ON t.assignee_id = om.user_id AND t.organization_id = _org_id
  WHERE om.organization_id = _org_id
  GROUP BY om.user_id, p.full_name, p.email, om.team_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_suggested_assignees(_org_id UUID, _section TEXT)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  team_role public.team_role,
  relevance_score INTEGER,
  current_workload BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.user_id,
    w.full_name,
    w.team_role,
    CASE 
      WHEN _section IN ('formulation', 'ingredients', 'compliance', 'sds', 'packaging') AND w.team_role = 'compliance' THEN 100
      WHEN _section IN ('media', 'content') AND w.team_role = 'creative' THEN 100
      WHEN _section = 'marketing' AND w.team_role = 'marketing' THEN 100
      WHEN _section = 'pricing' AND w.team_role = 'finance' THEN 100
      WHEN w.team_role = 'founder' THEN 50
      ELSE 10
    END as relevance_score,
    (w.pending_tasks + w.in_progress_tasks) as current_workload
  FROM public.get_team_workload(_org_id) w
  ORDER BY relevance_score DESC, current_workload ASC
  LIMIT 5;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_team_workload(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_suggested_assignees(UUID, TEXT) TO authenticated;

SELECT 'Task system applied successfully!' as result;
