-- ═══════════════════════════════════════════════════════════════════════════════
-- WEEK 13: TASK SYSTEM
-- Product tasks, stages, activity tracking, and notifications
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: ENUMS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Task status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM (
      'pending',
      'in_progress',
      'review',
      'blocked',
      'completed',
      'cancelled'
    );
  END IF;
END $$;

-- Task priority enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE public.task_priority AS ENUM (
      'low',
      'medium',
      'high',
      'urgent'
    );
  END IF;
END $$;

-- Due date type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'due_date_type') THEN
    CREATE TYPE public.due_date_type AS ENUM (
      'flexible',    -- Nice to have by this date
      'firm',        -- Should be done by this date
      'blocker'      -- Must be done - blocks other work
    );
  END IF;
END $$;

-- Activity type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE public.activity_type AS ENUM (
      'created',
      'updated',
      'status_changed',
      'assigned',
      'commented',
      'attachment_added',
      'due_date_changed',
      'completed',
      'reopened'
    );
  END IF;
END $$;

-- Notification type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'task_assigned',
      'task_mentioned',
      'task_due_soon',
      'task_overdue',
      'task_completed',
      'task_commented',
      'task_status_changed',
      'product_updated',
      'certification_expiring',
      'sds_outdated'
    );
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: PRODUCT STAGES TABLE
-- Configurable workflow stages per organization
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280', -- Tailwind gray-500
  icon TEXT DEFAULT 'Circle',
  
  -- Order in workflow
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Stage settings
  is_default BOOLEAN DEFAULT false, -- New products start here
  is_final BOOLEAN DEFAULT false,   -- Marks product as complete
  
  -- Auto-assignment rules
  default_assignee_role public.team_role,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_stage_name_per_org UNIQUE (organization_id, name)
);

-- Seed default stages
CREATE OR REPLACE FUNCTION public.seed_default_stages(_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.product_stages (organization_id, name, description, color, icon, sort_order, is_default, is_final, default_assignee_role)
  VALUES
    (_org_id, 'Ideation', 'Initial concept and research', '#8B5CF6', 'Lightbulb', 1, true, false, 'founder'),
    (_org_id, 'Formulation', 'Developing the formula', '#3B82F6', 'Beaker', 2, false, false, 'compliance'),
    (_org_id, 'Testing', 'Stability and safety testing', '#F59E0B', 'TestTube', 3, false, false, 'compliance'),
    (_org_id, 'Design', 'Packaging and branding', '#EC4899', 'Palette', 4, false, false, 'creative'),
    (_org_id, 'Compliance', 'Regulatory documentation', '#10B981', 'Shield', 5, false, false, 'compliance'),
    (_org_id, 'Pre-Launch', 'Marketing prep and final checks', '#6366F1', 'Rocket', 6, false, false, 'marketing'),
    (_org_id, 'Launched', 'Product is live', '#22C55E', 'CheckCircle', 7, false, true, 'founder')
  ON CONFLICT (organization_id, name) DO NOTHING;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: PRODUCT TASKS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status and priority
  status public.task_status DEFAULT 'pending',
  priority public.task_priority DEFAULT 'medium',
  
  -- Assignment
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Due date
  due_date TIMESTAMPTZ,
  due_date_type public.due_date_type DEFAULT 'flexible',
  
  -- Workflow
  stage_id UUID REFERENCES public.product_stages(id) ON DELETE SET NULL,
  
  -- Categorization
  section TEXT, -- Which product section: formulation, ingredients, packaging, etc.
  tags TEXT[] DEFAULT '{}',
  
  -- Context
  context_notes TEXT,
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Parent task (for subtasks)
  parent_task_id UUID REFERENCES public.product_tasks(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_tasks_org ON public.product_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_tasks_product ON public.product_tasks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tasks_assignee ON public.product_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_product_tasks_status ON public.product_tasks(status);
CREATE INDEX IF NOT EXISTS idx_product_tasks_due_date ON public.product_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_product_tasks_parent ON public.product_tasks(parent_task_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: TASK COMMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.product_tasks(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  -- Mentions (user IDs)
  mentions UUID[] DEFAULT '{}',
  
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: PRODUCT ACTIVITY LOG
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.product_tasks(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type public.activity_type NOT NULL,
  description TEXT,
  
  -- What changed
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  
  -- Who did it
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_activity_org ON public.product_activity(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_activity_product ON public.product_activity(product_id);
CREATE INDEX IF NOT EXISTS idx_product_activity_task ON public.product_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_product_activity_created ON public.product_activity(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 6: NOTIFICATIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Notification details
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  
  -- Related entities
  product_id UUID REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.product_tasks(id) ON DELETE CASCADE,
  
  -- Link to navigate to
  link TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Email status
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 7: ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

-- Product Stages RLS
ALTER TABLE public.product_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_stages_select" ON public.product_stages
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_stages_insert" ON public.product_stages
  FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_stages_update" ON public.product_stages
  FOR UPDATE USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_stages_delete" ON public.product_stages
  FOR DELETE USING (organization_id = ANY(public.get_user_organization_ids()));

-- Product Tasks RLS
ALTER TABLE public.product_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_tasks_select" ON public.product_tasks
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_tasks_insert" ON public.product_tasks
  FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_tasks_update" ON public.product_tasks
  FOR UPDATE USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_tasks_delete" ON public.product_tasks
  FOR DELETE USING (organization_id = ANY(public.get_user_organization_ids()));

-- Task Comments RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_comments_select" ON public.task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_tasks t
      WHERE t.id = task_id
      AND t.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "task_comments_insert" ON public.task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_tasks t
      WHERE t.id = task_id
      AND t.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "task_comments_update" ON public.task_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "task_comments_delete" ON public.task_comments
  FOR DELETE USING (author_id = auth.uid());

-- Product Activity RLS
ALTER TABLE public.product_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_activity_select" ON public.product_activity
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_activity_insert" ON public.product_activity
  FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

-- Notifications RLS (users can only see their own)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

-- System can insert notifications for anyone
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 8: TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Updated_at trigger for tasks
CREATE TRIGGER update_product_tasks_updated_at
  BEFORE UPDATE ON public.product_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for stages
CREATE TRIGGER update_product_stages_updated_at
  BEFORE UPDATE ON public.product_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for comments
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 9: HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Get team members with task counts for smart assignment
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

-- Get suggested assignees for a task based on section and workload
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
      -- Match role to section
      WHEN _section IN ('formulation', 'ingredients', 'compliance', 'sds', 'packaging') AND w.team_role = 'compliance' THEN 100
      WHEN _section IN ('media', 'content') AND w.team_role = 'creative' THEN 100
      WHEN _section = 'marketing' AND w.team_role = 'marketing' THEN 100
      WHEN _section = 'pricing' AND w.team_role = 'finance' THEN 100
      WHEN w.team_role = 'founder' THEN 50  -- Founders can do anything
      ELSE 10
    END as relevance_score,
    (w.pending_tasks + w.in_progress_tasks) as current_workload
  FROM public.get_team_workload(_org_id) w
  ORDER BY 
    relevance_score DESC,
    current_workload ASC
  LIMIT 5;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.seed_default_stages(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_workload(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_suggested_assignees(UUID, TEXT) TO authenticated;

-- Success
SELECT 'Task system tables created successfully!' as result;
