-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON ARCHITECTURE - DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- This migration creates the Three Silos architecture for Madison:
--   Silo A: The Masters (Rules & Principles) - Full documents, no chunking
--   Silo B: The Facts (Structured Data) - JSONB, direct lookup
--   Silo C: The Vibe (Semantic Examples) - Vector embeddings for search
--
-- Created: December 10, 2025
-- Version: 1.0
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENABLE REQUIRED EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable pgvector for semantic search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SILO A: THE MASTERS (Rules & Principles)
-- These are full documents that are NEVER chunked. The Router selects a master
-- by name, and the Assembler loads the ENTIRE document into context.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Copy Masters (Ogilvy, Hopkins, Peterman, etc.)
CREATE TABLE IF NOT EXISTS public.madison_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_name TEXT NOT NULL UNIQUE,
  -- e.g., 'OGILVY_SPECIFICITY', 'PETERMAN_ROMANCE', 'HOPKINS_REASON_WHY'
  
  squad TEXT NOT NULL,
  -- 'THE_SCIENTISTS', 'THE_STORYTELLERS', 'THE_DISRUPTORS'
  
  full_content TEXT NOT NULL,
  -- Complete markdown document - NEVER chunked
  
  summary TEXT,
  -- Brief description for Router selection
  
  forbidden_language TEXT[] DEFAULT '{}',
  -- Words/phrases this master never uses
  
  example_output TEXT,
  -- Example of ideal output from this master
  
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Additional configuration (e.g., use_for categories, strength areas)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast squad-based retrieval
CREATE INDEX IF NOT EXISTS idx_madison_masters_squad ON public.madison_masters(squad);
CREATE INDEX IF NOT EXISTS idx_madison_masters_name ON public.madison_masters(master_name);

-- Visual Masters (Avedon, Leibovitz, Richardson, etc.)
CREATE TABLE IF NOT EXISTS public.visual_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_name TEXT NOT NULL UNIQUE,
  -- e.g., 'AVEDON_ISOLATION', 'LEIBOVITZ_ENVIRONMENT', 'RICHARDSON_RAW'
  
  squad TEXT NOT NULL,
  -- 'THE_MINIMALISTS', 'THE_STORYTELLERS', 'THE_DISRUPTORS'
  
  full_content TEXT NOT NULL,
  -- Complete guidelines document
  
  summary TEXT,
  -- Brief description for Router selection
  
  example_images TEXT[] DEFAULT '{}',
  -- Reference image URLs
  
  forbidden_styles TEXT[] DEFAULT '{}',
  -- Visual elements to avoid
  
  prompt_template TEXT,
  -- Midjourney/DALL-E/Flux template for image generation
  
  composition_rules JSONB DEFAULT '{}'::jsonb,
  -- Specific composition guidelines
  
  lighting_rules JSONB DEFAULT '{}'::jsonb,
  -- Lighting specifications
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for squad retrieval
CREATE INDEX IF NOT EXISTS idx_visual_masters_squad ON public.visual_masters(squad);
CREATE INDEX IF NOT EXISTS idx_visual_masters_name ON public.visual_masters(master_name);

-- Schwartz Awareness Stage Templates
CREATE TABLE IF NOT EXISTS public.schwartz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL UNIQUE,
  -- 'unaware', 'problem_aware', 'solution_aware', 'product_aware', 'most_aware'
  
  template_content TEXT NOT NULL,
  -- Full structure outline with examples
  
  description TEXT,
  -- Explanation of when to use this stage
  
  key_principles TEXT[] DEFAULT '{}',
  -- Core principles for this stage
  
  opening_strategies TEXT[] DEFAULT '{}',
  -- How to open copy at this stage
  
  forbidden_approaches TEXT[] DEFAULT '{}',
  -- What NOT to do at this stage
  
  example_headlines TEXT[] DEFAULT '{}',
  -- Example headlines for this stage
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schwartz_templates_stage ON public.schwartz_templates(stage);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SILO B: THE FACTS (Structured Data)
-- These are JSONB tables with direct lookup by ID. NEVER vector search this data.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Brand DNA (The Central Hub for each organization's brand identity)
CREATE TABLE IF NOT EXISTS public.brand_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Visual Identity
  visual JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
  {
    logo: {
      url: string,
      source: 'clearbit' | 'favicon' | 'manual' | 'scan',
      variants: { light?: string, dark?: string, icon?: string },
      safeZone: { minWidth: number, clearSpace: number }
    },
    colors: {
      primary: string (hex),
      secondary: string (hex),
      accent: string (hex),
      palette: string[],
      usage: { primary: string, secondary: string, accent: string }
    },
    typography: {
      headline: { family: string, weights: number[], usage: string },
      body: { family: string, weights: number[], usage: string },
      accent: { family: string, weights: number[], usage: string }
    },
    visualStyle: {
      photography: 'studio' | 'natural_light' | 'lifestyle' | 'product_only' | 'mixed',
      composition: 'centered' | 'asymmetric' | 'rule_of_thirds',
      lighting: 'natural' | 'studio' | 'dramatic' | 'flat',
      colorGrading: 'warm' | 'cool' | 'muted' | 'vibrant' | 'monochrome'
    }
  }
  */
  
  -- Brand Essence
  essence JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
  {
    mission: string (1-2 sentences),
    keywords: string[] (3-5 descriptors),
    tone: 'clinical' | 'romantic' | 'playful' | 'sophisticated' | 'disruptive' | 'authentic',
    copySquad: 'THE_SCIENTISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS' | null,
    visualSquad: 'THE_MINIMALISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS' | null,
    primaryCopyMaster: string (e.g., 'HOPKINS_REASON_WHY'),
    primaryVisualMaster: string (e.g., 'AVEDON_ISOLATION'),
    brandVoice: { tone: string[], style: string, perspective: string }
  }
  */
  
  -- Constraints (What to avoid)
  constraints JSONB DEFAULT '{}'::jsonb,
  /*
  {
    forbiddenWords: string[],
    forbiddenStyles: string[],
    voiceGuidelines: string,
    logoUsageRules: string,
    competitorNames: string[]
  }
  */
  
  -- Scan Metadata
  scan_method TEXT NOT NULL DEFAULT 'manual',
  -- 'url_scan' | 'document' | 'manual' | 'url_scan_enhanced'
  
  scan_metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    source_url?: string,
    scanned_at?: string (ISO datetime),
    confidence?: number (0-1),
    document_name?: string,
    document_analyzed_at?: string,
    gemini_model?: string,
    claude_model?: string
  }
  */
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for brand_dna
CREATE INDEX IF NOT EXISTS idx_brand_dna_org_id ON public.brand_dna(org_id);
CREATE INDEX IF NOT EXISTS idx_brand_dna_copy_squad ON public.brand_dna((essence->>'copySquad'));
CREATE INDEX IF NOT EXISTS idx_brand_dna_visual_squad ON public.brand_dna((essence->>'visualSquad'));

-- Product Catalog (specs, prices, ingredients - never hallucinated)
CREATE TABLE IF NOT EXISTS public.brand_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  -- User-defined product identifier
  
  name TEXT NOT NULL,
  
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
  {
    price: number,
    currency: string,
    ingredients: string[],
    dimensions: { width: number, height: number, depth: number },
    weight: string,
    sku: string,
    category: string,
    subcategory: string,
    benefits: string[],
    usageInstructions: string,
    warnings: string[]
  }
  */
  
  copy_hints JSONB DEFAULT '{}'::jsonb,
  /*
  {
    keySellingPoints: string[],
    targetAudience: string,
    painPointsAddressed: string[],
    differentiators: string[]
  }
  */
  
  images TEXT[] DEFAULT '{}',
  -- Product image URLs
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id, product_id)
);

-- Indexes for brand_products
CREATE INDEX IF NOT EXISTS idx_brand_products_org_id ON public.brand_products(org_id);
CREATE INDEX IF NOT EXISTS idx_brand_products_product_id ON public.brand_products(product_id);
CREATE INDEX IF NOT EXISTS idx_brand_products_category ON public.brand_products((specs->>'category'));

-- Design Systems (Tailwind-compatible tokens)
CREATE TABLE IF NOT EXISTS public.design_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
  {
    colors: {
      background: string,
      foreground: string,
      card: string,
      primary: string,
      secondary: string,
      accent: string,
      muted: string,
      border: string,
      destructive: string
    },
    typography: {
      fontFamily: { serif: string, sans: string, mono: string },
      fontSize: { ... },
      fontWeight: { ... }
    },
    spacing: { ... },
    borderRadius: { lg: string, md: string, sm: string },
    shadows: { 'level-1': string, 'level-2': string, 'level-3': string }
  }
  */
  
  css_variables TEXT,
  -- Generated CSS custom properties
  
  tailwind_config JSONB DEFAULT '{}'::jsonb,
  -- Tailwind extend configuration
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_design_systems_org_id ON public.design_systems(org_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SILO C: THE VIBE (Semantic Examples)
-- These use vector embeddings for semantic search. The ONLY place for fuzzy search.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Brand Writing Examples (approved copy samples)
CREATE TABLE IF NOT EXISTS public.brand_writing_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  -- The actual writing example
  
  embedding extensions.vector(1536),
  -- OpenAI text-embedding-3-small (1536 dimensions)
  
  source TEXT NOT NULL,
  -- 'uploaded_pdf' | 'manual_entry' | 'generated_and_approved' | 'website_scan'
  
  channel TEXT,
  -- 'email' | 'instagram' | 'facebook' | 'product_page' | 'website' | etc.
  
  content_type TEXT,
  -- 'headline' | 'body_copy' | 'cta' | 'tagline' | 'product_description' | etc.
  
  tone_tags TEXT[] DEFAULT '{}',
  -- ['clinical', 'romantic', 'playful', etc.]
  
  metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    document_name?: string,
    extracted_at?: string,
    performance?: { clicks?: number, conversions?: number, engagement?: number },
    approved_by?: string,
    notes?: string
  }
  */
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for brand_writing_examples
CREATE INDEX IF NOT EXISTS idx_writing_examples_org_id ON public.brand_writing_examples(org_id);
CREATE INDEX IF NOT EXISTS idx_writing_examples_source ON public.brand_writing_examples(source);
CREATE INDEX IF NOT EXISTS idx_writing_examples_channel ON public.brand_writing_examples(channel);

-- Vector similarity search index (IVFFlat for performance)
-- Note: This index should be created after data is loaded for best results
CREATE INDEX IF NOT EXISTS idx_writing_examples_embedding 
ON public.brand_writing_examples 
USING ivfflat (embedding extensions.vector_cosine_ops) 
WITH (lists = 100);

-- Brand Visual Examples (approved images with CLIP embeddings)
CREATE TABLE IF NOT EXISTS public.brand_visual_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  
  image_embedding extensions.vector(512),
  -- CLIP embedding (512 dimensions)
  
  style_tags TEXT[] DEFAULT '{}',
  -- ['minimalist', 'product_shot', 'lifestyle', 'natural_light', etc.]
  
  squad_used TEXT,
  -- Which visual squad created this
  
  master_used TEXT,
  -- Which visual master was used
  
  metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    channel?: string,
    performance?: { impressions?: number, engagement?: number, clicks?: number },
    source?: 'uploaded' | 'generated_and_approved',
    prompt_used?: string,
    approved_by?: string
  }
  */
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for brand_visual_examples
CREATE INDEX IF NOT EXISTS idx_visual_examples_org_id ON public.brand_visual_examples(org_id);
CREATE INDEX IF NOT EXISTS idx_visual_examples_style_tags ON public.brand_visual_examples USING GIN (style_tags);
CREATE INDEX IF NOT EXISTS idx_visual_examples_squad ON public.brand_visual_examples(squad_used);

-- Vector similarity search index for visual examples
CREATE INDEX IF NOT EXISTS idx_visual_examples_embedding 
ON public.brand_visual_examples 
USING ivfflat (image_embedding extensions.vector_cosine_ops) 
WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════════════════════
-- OUTPUT TRACKING (Generated Content)
-- Track what Madison generates for learning and analytics
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  content_type TEXT NOT NULL,
  -- 'copy' | 'image' | 'composite' | 'email' | 'ad'
  
  content TEXT,
  -- Generated text content
  
  image_url TEXT,
  -- Generated image URL (if applicable)
  
  strategy_used JSONB,
  -- Full strategy JSON from Router agent
  /*
  {
    copySquad: string,
    visualSquad: string,
    primaryCopyMaster: string,
    primaryVisualMaster: string,
    forbiddenCopySquads: string[],
    forbiddenLanguage: string[],
    schwartzStage: string,
    reasoning: string
  }
  */
  
  context_used JSONB DEFAULT '{}'::jsonb,
  -- What context was assembled
  /*
  {
    masterDocuments: string[],
    productId?: string,
    writingExamplesCount: number,
    visualExamplesCount: number
  }
  */
  
  user_brief TEXT,
  -- Original user request
  
  channel TEXT,
  -- Target channel
  
  performance JSONB DEFAULT '{}'::jsonb,
  -- Tracked performance metrics
  /*
  {
    clicks?: number,
    conversions?: number,
    impressions?: number,
    engagement?: number,
    rating?: number (user rating 1-5)
  }
  */
  
  approved BOOLEAN DEFAULT false,
  -- User approved this content
  
  feedback TEXT,
  -- User feedback
  
  pipeline_duration_ms INTEGER,
  -- How long the pipeline took
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for generated_content
CREATE INDEX IF NOT EXISTS idx_generated_content_org_id ON public.generated_content(org_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON public.generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_approved ON public.generated_content(approved);
CREATE INDEX IF NOT EXISTS idx_generated_content_created ON public.generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_channel ON public.generated_content(channel);

-- ═══════════════════════════════════════════════════════════════════════════════
-- VECTOR SEARCH FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to find similar writing examples
CREATE OR REPLACE FUNCTION public.match_writing_examples(
  query_embedding extensions.vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  p_org_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source TEXT,
  channel TEXT,
  content_type TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    bwe.id,
    bwe.content,
    bwe.source,
    bwe.channel,
    bwe.content_type,
    1 - (bwe.embedding <=> query_embedding) AS similarity
  FROM public.brand_writing_examples bwe
  WHERE (p_org_id IS NULL OR bwe.org_id = p_org_id)
    AND bwe.embedding IS NOT NULL
    AND 1 - (bwe.embedding <=> query_embedding) > match_threshold
  ORDER BY bwe.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to find similar visual examples
CREATE OR REPLACE FUNCTION public.match_visual_examples(
  query_embedding extensions.vector(512),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  p_org_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  style_tags TEXT[],
  squad_used TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    bve.id,
    bve.image_url,
    bve.style_tags,
    bve.squad_used,
    1 - (bve.image_embedding <=> query_embedding) AS similarity
  FROM public.brand_visual_examples bve
  WHERE (p_org_id IS NULL OR bve.org_id = p_org_id)
    AND bve.image_embedding IS NOT NULL
    AND 1 - (bve.image_embedding <=> query_embedding) > match_threshold
  ORDER BY bve.image_embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.madison_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schwartz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_writing_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_visual_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS: SILO A (Masters are PUBLIC READ - they're shared training data)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Madison Masters: Anyone authenticated can read
DROP POLICY IF EXISTS "Anyone can read madison_masters" ON public.madison_masters;
CREATE POLICY "Anyone can read madison_masters"
  ON public.madison_masters
  FOR SELECT
  USING (true);

-- Only service role can insert/update (seeding happens server-side)
DROP POLICY IF EXISTS "Service role can manage madison_masters" ON public.madison_masters;
CREATE POLICY "Service role can manage madison_masters"
  ON public.madison_masters
  FOR ALL
  USING (auth.role() = 'service_role');

-- Visual Masters: Anyone authenticated can read
DROP POLICY IF EXISTS "Anyone can read visual_masters" ON public.visual_masters;
CREATE POLICY "Anyone can read visual_masters"
  ON public.visual_masters
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage visual_masters" ON public.visual_masters;
CREATE POLICY "Service role can manage visual_masters"
  ON public.visual_masters
  FOR ALL
  USING (auth.role() = 'service_role');

-- Schwartz Templates: Anyone authenticated can read
DROP POLICY IF EXISTS "Anyone can read schwartz_templates" ON public.schwartz_templates;
CREATE POLICY "Anyone can read schwartz_templates"
  ON public.schwartz_templates
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage schwartz_templates" ON public.schwartz_templates;
CREATE POLICY "Service role can manage schwartz_templates"
  ON public.schwartz_templates
  FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS: SILO B (Organization-scoped data)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Brand DNA: Members can view their org's brand DNA
DROP POLICY IF EXISTS "Members can view their org brand_dna" ON public.brand_dna;
CREATE POLICY "Members can view their org brand_dna"
  ON public.brand_dna
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_dna.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can insert their org brand_dna" ON public.brand_dna;
CREATE POLICY "Members can insert their org brand_dna"
  ON public.brand_dna
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_dna.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update their org brand_dna" ON public.brand_dna;
CREATE POLICY "Admins can update their org brand_dna"
  ON public.brand_dna
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_dna.org_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Brand Products: Members can view, admins can manage
DROP POLICY IF EXISTS "Members can view their org brand_products" ON public.brand_products;
CREATE POLICY "Members can view their org brand_products"
  ON public.brand_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_products.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage their org brand_products" ON public.brand_products;
CREATE POLICY "Admins can manage their org brand_products"
  ON public.brand_products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_products.org_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Design Systems: Members can view, admins can manage
DROP POLICY IF EXISTS "Members can view their org design_systems" ON public.design_systems;
CREATE POLICY "Members can view their org design_systems"
  ON public.design_systems
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = design_systems.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage their org design_systems" ON public.design_systems;
CREATE POLICY "Admins can manage their org design_systems"
  ON public.design_systems
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = design_systems.org_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS: SILO C (Organization-scoped semantic data)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Brand Writing Examples
DROP POLICY IF EXISTS "Members can view their org writing_examples" ON public.brand_writing_examples;
CREATE POLICY "Members can view their org writing_examples"
  ON public.brand_writing_examples
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_writing_examples.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can insert their org writing_examples" ON public.brand_writing_examples;
CREATE POLICY "Members can insert their org writing_examples"
  ON public.brand_writing_examples
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_writing_examples.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can delete their org writing_examples" ON public.brand_writing_examples;
CREATE POLICY "Admins can delete their org writing_examples"
  ON public.brand_writing_examples
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_writing_examples.org_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Brand Visual Examples
DROP POLICY IF EXISTS "Members can view their org visual_examples" ON public.brand_visual_examples;
CREATE POLICY "Members can view their org visual_examples"
  ON public.brand_visual_examples
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_visual_examples.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can insert their org visual_examples" ON public.brand_visual_examples;
CREATE POLICY "Members can insert their org visual_examples"
  ON public.brand_visual_examples
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_visual_examples.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can delete their org visual_examples" ON public.brand_visual_examples;
CREATE POLICY "Admins can delete their org visual_examples"
  ON public.brand_visual_examples
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_visual_examples.org_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS: GENERATED CONTENT
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Members can view their org generated_content" ON public.generated_content;
CREATE POLICY "Members can view their org generated_content"
  ON public.generated_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = generated_content.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can insert their org generated_content" ON public.generated_content;
CREATE POLICY "Members can insert their org generated_content"
  ON public.generated_content
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = generated_content.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can update their org generated_content" ON public.generated_content;
CREATE POLICY "Members can update their org generated_content"
  ON public.generated_content
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = generated_content.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS FOR UPDATED_AT
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers
DROP TRIGGER IF EXISTS update_madison_masters_updated_at ON public.madison_masters;
CREATE TRIGGER update_madison_masters_updated_at
  BEFORE UPDATE ON public.madison_masters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_visual_masters_updated_at ON public.visual_masters;
CREATE TRIGGER update_visual_masters_updated_at
  BEFORE UPDATE ON public.visual_masters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_schwartz_templates_updated_at ON public.schwartz_templates;
CREATE TRIGGER update_schwartz_templates_updated_at
  BEFORE UPDATE ON public.schwartz_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_dna_updated_at ON public.brand_dna;
CREATE TRIGGER update_brand_dna_updated_at
  BEFORE UPDATE ON public.brand_dna
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_products_updated_at ON public.brand_products;
CREATE TRIGGER update_brand_products_updated_at
  BEFORE UPDATE ON public.brand_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_systems_updated_at ON public.design_systems;
CREATE TRIGGER update_design_systems_updated_at
  BEFORE UPDATE ON public.design_systems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Get brand DNA for an organization
CREATE OR REPLACE FUNCTION public.get_brand_dna(p_org_id UUID)
RETURNS TABLE (
  id UUID,
  org_id UUID,
  visual JSONB,
  essence JSONB,
  constraints JSONB,
  scan_method TEXT,
  scan_metadata JSONB
)
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT 
    bd.id,
    bd.org_id,
    bd.visual,
    bd.essence,
    bd.constraints,
    bd.scan_method,
    bd.scan_metadata
  FROM public.brand_dna bd
  WHERE bd.org_id = p_org_id
  LIMIT 1;
$$;

-- Get all masters for a specific squad
CREATE OR REPLACE FUNCTION public.get_masters_by_squad(p_squad TEXT)
RETURNS TABLE (
  id UUID,
  master_name TEXT,
  squad TEXT,
  full_content TEXT,
  summary TEXT,
  forbidden_language TEXT[]
)
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT 
    mm.id,
    mm.master_name,
    mm.squad,
    mm.full_content,
    mm.summary,
    mm.forbidden_language
  FROM public.madison_masters mm
  WHERE mm.squad = p_squad
  ORDER BY mm.master_name;
$$;

-- Get a specific master by name
CREATE OR REPLACE FUNCTION public.get_master_by_name(p_master_name TEXT)
RETURNS TABLE (
  id UUID,
  master_name TEXT,
  squad TEXT,
  full_content TEXT,
  summary TEXT,
  forbidden_language TEXT[],
  example_output TEXT,
  metadata JSONB
)
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT 
    mm.id,
    mm.master_name,
    mm.squad,
    mm.full_content,
    mm.summary,
    mm.forbidden_language,
    mm.example_output,
    mm.metadata
  FROM public.madison_masters mm
  WHERE mm.master_name = p_master_name
  LIMIT 1;
$$;

-- Get Schwartz template by stage
CREATE OR REPLACE FUNCTION public.get_schwartz_template(p_stage TEXT)
RETURNS TABLE (
  id UUID,
  stage TEXT,
  template_content TEXT,
  description TEXT,
  key_principles TEXT[],
  opening_strategies TEXT[],
  forbidden_approaches TEXT[]
)
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT 
    st.id,
    st.stage,
    st.template_content,
    st.description,
    st.key_principles,
    st.opening_strategies,
    st.forbidden_approaches
  FROM public.schwartz_templates st
  WHERE st.stage = p_stage
  LIMIT 1;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Grant usage on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.match_writing_examples TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_visual_examples TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_brand_dna TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_masters_by_squad TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_master_by_name TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_schwartz_template TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Madison Architecture Schema migration completed successfully!';
  RAISE NOTICE 'Tables created: madison_masters, visual_masters, schwartz_templates, brand_dna, brand_products, design_systems, brand_writing_examples, brand_visual_examples, generated_content';
END $$;

