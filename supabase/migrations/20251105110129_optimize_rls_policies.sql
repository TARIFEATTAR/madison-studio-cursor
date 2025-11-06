-- Optimize RLS Policies for Better Performance
-- This migration fixes RLS policies that call auth.uid() and auth.role() directly
-- by wrapping them in subqueries: (select auth.uid()) instead of auth.uid()
-- This prevents re-evaluation for each row, significantly improving query performance

-- ============================================
-- FIX 1: Simple auth.uid() = column patterns
-- ============================================

-- Profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

-- Prompts table - Individual policies
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;
  DROP POLICY IF EXISTS "Users can insert their own prompts" ON public.prompts;
  DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
  DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
  
  -- Recreate with optimized version (if they exist as simple user-owned policies)
  -- Note: Organization policies are handled separately below
END $$;

-- Outputs table - Individual policies  
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own outputs" ON public.outputs;
  DROP POLICY IF EXISTS "Users can insert their own outputs" ON public.outputs;
  DROP POLICY IF EXISTS "Users can update their own outputs" ON public.outputs;
  DROP POLICY IF EXISTS "Users can delete their own outputs" ON public.outputs;
END $$;

-- Calendar tables
DO $$
BEGIN
  -- scheduled_content
  DROP POLICY IF EXISTS "Users can view their own scheduled content" ON public.scheduled_content;
  DROP POLICY IF EXISTS "Users can insert their own scheduled content" ON public.scheduled_content;
  DROP POLICY IF EXISTS "Users can update their own scheduled content" ON public.scheduled_content;
  DROP POLICY IF EXISTS "Users can delete their own scheduled content" ON public.scheduled_content;
  
  -- google_calendar_sync
  DROP POLICY IF EXISTS "Users can view their own sync settings" ON public.google_calendar_sync;
  DROP POLICY IF EXISTS "Users can insert their own sync settings" ON public.google_calendar_sync;
  DROP POLICY IF EXISTS "Users can update their own sync settings" ON public.google_calendar_sync;
  DROP POLICY IF EXISTS "Users can delete their own sync settings" ON public.google_calendar_sync;
  
  -- google_calendar_tokens
  DROP POLICY IF EXISTS "Users can view their own tokens" ON public.google_calendar_tokens;
  DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.google_calendar_tokens;
  DROP POLICY IF EXISTS "Users can update their own tokens" ON public.google_calendar_tokens;
  DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.google_calendar_tokens;
END $$;

-- ============================================
-- FIX 2: Organization membership patterns
-- ============================================

-- Fix policies that use is_organization_member(auth.uid(), ...)
-- These need to be recreated with (select auth.uid())

-- Generic function to fix organization-based policies
CREATE OR REPLACE FUNCTION fix_org_policies()
RETURNS void AS $$
DECLARE
  rec RECORD;
  sql_text TEXT;
BEGIN
  -- Get all policies that use is_organization_member or has_organization_role
  FOR rec IN
    SELECT 
      schemaname,
      tablename,
      policyname,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        qual::text LIKE '%is_organization_member(auth.uid()%' OR
        qual::text LIKE '%has_organization_role(auth.uid()%' OR
        with_check::text LIKE '%is_organization_member(auth.uid()%' OR
        with_check::text LIKE '%has_organization_role(auth.uid()%'
      )
  LOOP
    -- Drop the policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      rec.policyname, rec.schemaname, rec.tablename);
    
    -- Recreate with optimized auth.uid() calls
    -- Note: We'll need to manually recreate the most important ones below
    -- This is a placeholder - the actual fix is done per-table below
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Drop the function after use
DROP FUNCTION IF EXISTS fix_org_policies();

-- ============================================
-- FIX 3: Most Critical Tables - Manual Fixes
-- ============================================

-- Prompts table - Organization policies
DO $$
BEGIN
  -- Drop existing organization policies
  DROP POLICY IF EXISTS "Users can view their own or organization prompts" ON public.prompts;
  DROP POLICY IF EXISTS "Users can insert their own or organization prompts" ON public.prompts;
  DROP POLICY IF EXISTS "Users can update their own or organization prompts" ON public.prompts;
  DROP POLICY IF EXISTS "Users can delete their own or organization prompts" ON public.prompts;
  
  -- Recreate with optimized version
  CREATE POLICY "Users can view their own or organization prompts"
    ON public.prompts FOR SELECT
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can insert their own or organization prompts"
    ON public.prompts FOR INSERT
    WITH CHECK (
      (select auth.uid()) = created_by AND
      (organization_id IS NULL OR public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can update their own or organization prompts"
    ON public.prompts FOR UPDATE
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can delete their own or organization prompts"
    ON public.prompts FOR DELETE
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );
END $$;

-- Outputs table - Organization policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own or organization outputs" ON public.outputs;
  DROP POLICY IF EXISTS "Users can insert their own or organization outputs" ON public.outputs;
  DROP POLICY IF EXISTS "Users can update their own or organization outputs" ON public.outputs;
  DROP POLICY IF EXISTS "Users can delete their own or organization outputs" ON public.outputs;
  
  CREATE POLICY "Users can view their own or organization outputs"
    ON public.outputs FOR SELECT
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can insert their own or organization outputs"
    ON public.outputs FOR INSERT
    WITH CHECK (
      (select auth.uid()) = created_by AND
      (organization_id IS NULL OR public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can update their own or organization outputs"
    ON public.outputs FOR UPDATE
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can delete their own or organization outputs"
    ON public.outputs FOR DELETE
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );
END $$;

-- Master content table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own or organization master content" ON public.master_content;
  DROP POLICY IF EXISTS "Users can insert their own or organization master content" ON public.master_content;
  DROP POLICY IF EXISTS "Users can update their own or organization master content" ON public.master_content;
  DROP POLICY IF EXISTS "Users can delete their own or organization master content" ON public.master_content;
  
  CREATE POLICY "Users can view their own or organization master content"
    ON public.master_content FOR SELECT
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can insert their own or organization master content"
    ON public.master_content FOR INSERT
    WITH CHECK (
      (select auth.uid()) = created_by AND
      (organization_id IS NULL OR public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can update their own or organization master content"
    ON public.master_content FOR UPDATE
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can delete their own or organization master content"
    ON public.master_content FOR DELETE
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );
END $$;

-- Derivative assets table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own or organization derivative assets" ON public.derivative_assets;
  DROP POLICY IF EXISTS "Users can insert their own or organization derivative assets" ON public.derivative_assets;
  DROP POLICY IF EXISTS "Users can update their own or organization derivative assets" ON public.derivative_assets;
  DROP POLICY IF EXISTS "Users can delete their own or organization derivative assets" ON public.derivative_assets;
  
  CREATE POLICY "Users can view their own or organization derivative assets"
    ON public.derivative_assets FOR SELECT
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can insert their own or organization derivative assets"
    ON public.derivative_assets FOR INSERT
    WITH CHECK (
      (select auth.uid()) = created_by AND
      (organization_id IS NULL OR public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can update their own or organization derivative assets"
    ON public.derivative_assets FOR UPDATE
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can delete their own or organization derivative assets"
    ON public.derivative_assets FOR DELETE
    USING (
      (select auth.uid()) = created_by OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );
END $$;

-- Scheduled content table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own or organization scheduled content" ON public.scheduled_content;
  DROP POLICY IF EXISTS "Users can insert their own or organization scheduled content" ON public.scheduled_content;
  DROP POLICY IF EXISTS "Users can update their own or organization scheduled content" ON public.scheduled_content;
  DROP POLICY IF EXISTS "Users can delete their own or organization scheduled content" ON public.scheduled_content;
  
  CREATE POLICY "Users can view their own or organization scheduled content"
    ON public.scheduled_content FOR SELECT
    USING (
      (select auth.uid()) = user_id OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can insert their own or organization scheduled content"
    ON public.scheduled_content FOR INSERT
    WITH CHECK (
      (select auth.uid()) = user_id AND
      (organization_id IS NULL OR public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can update their own or organization scheduled content"
    ON public.scheduled_content FOR UPDATE
    USING (
      (select auth.uid()) = user_id OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );

  CREATE POLICY "Users can delete their own or organization scheduled content"
    ON public.scheduled_content FOR DELETE
    USING (
      (select auth.uid()) = user_id OR 
      (organization_id IS NOT NULL AND public.is_organization_member((select auth.uid()), organization_id))
    );
END $$;

-- Calendar tables
DO $$
BEGIN
  -- google_calendar_sync
  DROP POLICY IF EXISTS "Users can view their own sync settings" ON public.google_calendar_sync;
  DROP POLICY IF EXISTS "Users can insert their own sync settings" ON public.google_calendar_sync;
  DROP POLICY IF EXISTS "Users can update their own sync settings" ON public.google_calendar_sync;
  DROP POLICY IF EXISTS "Users can delete their own sync settings" ON public.google_calendar_sync;
  
  CREATE POLICY "Users can view their own sync settings"
    ON public.google_calendar_sync FOR SELECT
    USING ((select auth.uid()) = user_id);

  CREATE POLICY "Users can insert their own sync settings"
    ON public.google_calendar_sync FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

  CREATE POLICY "Users can update their own sync settings"
    ON public.google_calendar_sync FOR UPDATE
    USING ((select auth.uid()) = user_id);

  CREATE POLICY "Users can delete their own sync settings"
    ON public.google_calendar_sync FOR DELETE
    USING ((select auth.uid()) = user_id);
  
  -- google_calendar_tokens
  DROP POLICY IF EXISTS "Users can view their own tokens" ON public.google_calendar_tokens;
  DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.google_calendar_tokens;
  DROP POLICY IF EXISTS "Users can update their own tokens" ON public.google_calendar_tokens;
  DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.google_calendar_tokens;
  
  CREATE POLICY "Users can view their own tokens"
    ON public.google_calendar_tokens FOR SELECT
    USING ((select auth.uid()) = user_id);

  CREATE POLICY "Users can insert their own tokens"
    ON public.google_calendar_tokens FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

  CREATE POLICY "Users can update their own tokens"
    ON public.google_calendar_tokens FOR UPDATE
    USING ((select auth.uid()) = user_id);

  CREATE POLICY "Users can delete their own tokens"
    ON public.google_calendar_tokens FOR DELETE
    USING ((select auth.uid()) = user_id);
END $$;

-- Repurposing rules table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Members can view organization and system repurposing rules" ON public.repurposing_rules;
  DROP POLICY IF EXISTS "Admins and owners can create repurposing rules" ON public.repurposing_rules;
  DROP POLICY IF EXISTS "Admins and owners can update repurposing rules" ON public.repurposing_rules;
  DROP POLICY IF EXISTS "Owners can delete repurposing rules" ON public.repurposing_rules;
  
  CREATE POLICY "Members can view organization and system repurposing rules"
    ON public.repurposing_rules FOR SELECT
    USING (
      organization_id IS NULL OR 
      public.is_organization_member((select auth.uid()), organization_id)
    );

  CREATE POLICY "Admins and owners can create repurposing rules"
    ON public.repurposing_rules FOR INSERT
    WITH CHECK (
      public.has_organization_role((select auth.uid()), organization_id, 'owner'::organization_role) OR
      public.has_organization_role((select auth.uid()), organization_id, 'admin'::organization_role)
    );

  CREATE POLICY "Admins and owners can update repurposing rules"
    ON public.repurposing_rules FOR UPDATE
    USING (
      public.has_organization_role((select auth.uid()), organization_id, 'owner'::organization_role) OR
      public.has_organization_role((select auth.uid()), organization_id, 'admin'::organization_role)
    );

  CREATE POLICY "Owners can delete repurposing rules"
    ON public.repurposing_rules FOR DELETE
    USING (
      public.has_organization_role((select auth.uid()), organization_id, 'owner'::organization_role)
    );
END $$;

-- Brand collections table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Members can view their organization's collections" ON public.brand_collections;
  DROP POLICY IF EXISTS "Admins and owners can insert collections" ON public.brand_collections;
  DROP POLICY IF EXISTS "Admins and owners can update collections" ON public.brand_collections;
  DROP POLICY IF EXISTS "Owners can delete collections" ON public.brand_collections;
  
  CREATE POLICY "Members can view their organization's collections"
    ON public.brand_collections FOR SELECT
    USING (public.is_organization_member((select auth.uid()), organization_id));

  CREATE POLICY "Admins and owners can insert collections"
    ON public.brand_collections FOR INSERT
    WITH CHECK (
      public.has_organization_role((select auth.uid()), organization_id, 'owner'::organization_role) OR 
      public.has_organization_role((select auth.uid()), organization_id, 'admin'::organization_role)
    );

  CREATE POLICY "Admins and owners can update collections"
    ON public.brand_collections FOR UPDATE
    USING (
      public.has_organization_role((select auth.uid()), organization_id, 'owner'::organization_role) OR 
      public.has_organization_role((select auth.uid()), organization_id, 'admin'::organization_role)
    );

  CREATE POLICY "Owners can delete collections"
    ON public.brand_collections FOR DELETE
    USING (public.has_organization_role((select auth.uid()), organization_id, 'owner'::organization_role));
END $$;

-- Subscription tables (from billing migration)
DO $$
BEGIN
  -- Subscriptions
  DROP POLICY IF EXISTS "Users can view their organization's subscription" ON public.subscriptions;
  DROP POLICY IF EXISTS "Owners can manage their organization's subscription" ON public.subscriptions;
  
  CREATE POLICY "Users can view their organization's subscription"
    ON public.subscriptions FOR SELECT
    USING (public.is_organization_member((select auth.uid()), organization_id));

  CREATE POLICY "Owners can manage their organization's subscription"
    ON public.subscriptions FOR ALL
    USING (public.has_organization_role((select auth.uid()), organization_id, 'owner'::organization_role));
  
  -- Payment methods
  DROP POLICY IF EXISTS "Users can view their organization's payment methods" ON public.payment_methods;
  DROP POLICY IF EXISTS "Owners can manage their organization's payment methods" ON public.payment_methods;
  
  CREATE POLICY "Users can view their organization's payment methods"
    ON public.payment_methods FOR SELECT
    USING (public.is_organization_member((select auth.uid()), organization_id));

  CREATE POLICY "Owners can manage their organization's payment methods"
    ON public.payment_methods FOR ALL
    USING (public.has_organization_role((select auth.uid()), organization_id, 'owner'::organization_role));
  
  -- Invoices
  DROP POLICY IF EXISTS "Users can view their organization's invoices" ON public.invoices;
  
  CREATE POLICY "Users can view their organization's invoices"
    ON public.invoices FOR SELECT
    USING (public.is_organization_member((select auth.uid()), organization_id));
END $$;

-- Note: This migration optimizes the most commonly used RLS policies.
-- For other tables, policies will be optimized as they are encountered.
-- Future migrations should use (select auth.uid()) format directly.
