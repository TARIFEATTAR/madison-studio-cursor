-- Security Fix: Remove Organization Membership Bypass (rls_org_creator_bypass)
-- This migration fixes the privilege escalation vulnerability where users who created
-- content could retain access even after leaving the organization.
--
-- Changes: Remove 'created_by OR organization_member' logic from SELECT/UPDATE/DELETE policies
-- Result: Only current organization members can access organizational data

-- ============================================================================
-- TABLE: prompts
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization prompts" ON public.prompts;
CREATE POLICY "Users can view their own or organization prompts"
  ON public.prompts FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization prompts" ON public.prompts;
CREATE POLICY "Users can update their own or organization prompts"
  ON public.prompts FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization prompts" ON public.prompts;
CREATE POLICY "Users can delete their own or organization prompts"
  ON public.prompts FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- Keep INSERT policy unchanged (validates user is authenticated and org member)
-- Already correct: WITH CHECK (auth.uid() = created_by AND is_organization_member(auth.uid(), organization_id))

-- ============================================================================
-- TABLE: outputs
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization outputs" ON public.outputs;
CREATE POLICY "Users can view their own or organization outputs"
  ON public.outputs FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization outputs" ON public.outputs;
CREATE POLICY "Users can update their own or organization outputs"
  ON public.outputs FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization outputs" ON public.outputs;
CREATE POLICY "Users can delete their own or organization outputs"
  ON public.outputs FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- ============================================================================
-- TABLE: master_content
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization master content" ON public.master_content;
CREATE POLICY "Users can view their own or organization master content"
  ON public.master_content FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization master content" ON public.master_content;
CREATE POLICY "Users can update their own or organization master content"
  ON public.master_content FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization master content" ON public.master_content;
CREATE POLICY "Users can delete their own or organization master content"
  ON public.master_content FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- ============================================================================
-- TABLE: derivative_assets
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization derivative assets" ON public.derivative_assets;
CREATE POLICY "Users can view their own or organization derivative assets"
  ON public.derivative_assets FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization derivative assets" ON public.derivative_assets;
CREATE POLICY "Users can update their own or organization derivative assets"
  ON public.derivative_assets FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization derivative assets" ON public.derivative_assets;
CREATE POLICY "Users can delete their own or organization derivative assets"
  ON public.derivative_assets FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- ============================================================================
-- TABLE: scheduled_content (uses user_id instead of created_by)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization scheduled content" ON public.scheduled_content;
CREATE POLICY "Users can view their own or organization scheduled content"
  ON public.scheduled_content FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization scheduled content" ON public.scheduled_content;
CREATE POLICY "Users can update their own or organization scheduled content"
  ON public.scheduled_content FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization scheduled content" ON public.scheduled_content;
CREATE POLICY "Users can delete their own or organization scheduled content"
  ON public.scheduled_content FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- ============================================================================
-- TABLE: calendar_schedule
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization calendar schedules" ON public.calendar_schedule;
CREATE POLICY "Users can view their own or organization calendar schedules"
  ON public.calendar_schedule FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization calendar schedules" ON public.calendar_schedule;
CREATE POLICY "Users can update their own or organization calendar schedules"
  ON public.calendar_schedule FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization calendar schedules" ON public.calendar_schedule;
CREATE POLICY "Users can delete their own or organization calendar schedules"
  ON public.calendar_schedule FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- ============================================================================
-- TABLE: calendar_notes (uses user_id instead of created_by)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization notes" ON public.calendar_notes;
CREATE POLICY "Users can view their own or organization notes"
  ON public.calendar_notes FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization notes" ON public.calendar_notes;
CREATE POLICY "Users can update their own or organization notes"
  ON public.calendar_notes FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization notes" ON public.calendar_notes;
CREATE POLICY "Users can delete their own or organization notes"
  ON public.calendar_notes FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- ============================================================================
-- TABLE: calendar_tasks (uses user_id instead of created_by)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization tasks" ON public.calendar_tasks;
CREATE POLICY "Users can view their own or organization tasks"
  ON public.calendar_tasks FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization tasks" ON public.calendar_tasks;
CREATE POLICY "Users can update their own or organization tasks"
  ON public.calendar_tasks FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization tasks" ON public.calendar_tasks;
CREATE POLICY "Users can delete their own or organization tasks"
  ON public.calendar_tasks FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- ============================================================================
-- TABLE: calendar_settings (uses user_id instead of created_by)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own or organization calendar settings" ON public.calendar_settings;
CREATE POLICY "Users can view their own or organization calendar settings"
  ON public.calendar_settings FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can update their own or organization calendar settings" ON public.calendar_settings;
CREATE POLICY "Users can update their own or organization calendar settings"
  ON public.calendar_settings FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Users can delete their own or organization calendar settings" ON public.calendar_settings;
CREATE POLICY "Users can delete their own or organization calendar settings"
  ON public.calendar_settings FOR DELETE
  USING (public.is_organization_member(auth.uid(), organization_id));

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- - Fixed RLS policies on 9 tables (prompts, outputs, master_content, derivative_assets,
--   scheduled_content, calendar_schedule, calendar_notes, calendar_tasks, calendar_settings)
-- - Removed creator bypass vulnerability (auth.uid() = created_by OR organization_member)
-- - Now only current organization members can access organizational data
-- - Former members/removed users can no longer access content they created
-- - INSERT policies unchanged (still validate user authentication and org membership)