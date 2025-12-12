import { Database } from '@/integrations/supabase/types';

export type DbTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type DbEnums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export interface BrandProfile extends DbTables<'organizations'> {
  brand_config: BrandConfig | null;
}

export interface BrandConfig {
  industry?: string;
  description?: string;
  brandName?: string;
  [key: string]: unknown;
}

export interface BrandKnowledge extends DbTables<'brand_knowledge'> {
  content: BrandKnowledgeContent;
}

export interface BrandKnowledgeContent {
  mission?: string;
  vision?: string;
  values?: string;
  personality?: string;
  voice_guidelines?: string;
  tone_spectrum?: string;
  description?: string;
  [key: string]: unknown;
}

export interface MasterContent extends DbTables<'master_content'> {
  metadata?: Record<string, unknown>;
}

export interface GeneratedImage extends DbTables<'generated_images'> {
  settings?: Record<string, unknown>;
}

export interface CalendarTask extends DbTables<'calendar_tasks'> {}

export interface CalendarNote extends DbTables<'calendar_notes'> {}

export type OrganizationRole = DbEnums<'organization_role'>;

