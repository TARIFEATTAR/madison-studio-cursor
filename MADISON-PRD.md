# Madison Product Requirements Document (PRD)

## 1. Overview & Vision

Madison is an AI-powered Editorial Director integrated into the Scriptora brand intelligence platform. It serves as a conversational assistant that helps content creators generate high-quality, on-brand content across multiple formats and channels. Madison combines brand knowledge absorption (from uploaded documents and websites) with AI generation capabilities to ensure all content maintains consistent brand voice, adheres to product-specific guidelines, and meets platform requirements. The primary user personas are: (1) Brand managers needing to scale content production while maintaining quality, (2) Marketing teams requiring multi-channel derivative assets from master content, and (3) Solo entrepreneurs seeking professional-grade content creation without hiring agencies.

---

## 2. Current Scope (Live Build)

### 2.1 AI Conversation Module (Madison)

**Functionality**: Enables users to converse with Madison for content generation, refinement, and strategic counsel.

**Inputs**:
- User prompts and conversational history
- Brand context (extracted from uploaded documents)
- Product information (from brand_products table)
- Collection settings (Humanities, Reserve, Purity, Elemental)
- Content type requirements (blog post, email, ad copy, etc.)

**Outputs**:
- Generated content (text-based)
- Editorial feedback and suggestions
- Conversational responses with markdown formatting

**Dependencies**:
- Supabase Edge Function: `generate-with-claude`
- Anthropic Claude API (`claude-sonnet-4-20250514`)
- Brand knowledge database tables
- React components: `EditorialAssistant.tsx`, `EditorialAssistantPanel.tsx`, `MadisonPanel.tsx`

**UI Flows**:
1. User opens Madison panel via floating trigger button
2. User types message or selects quick action
3. System sends request to edge function with brand context
4. Madison streams response with typing indicator
5. User can copy, continue conversation, or close panel

**Technical Implementation**:
- Real-time streaming responses
- Exponential backoff retry logic for API resilience (3 retries, 1-2-4 second delays)
- Brand context injection: automatically pulls organization's brand voice, products, and guidelines
- Mode-based prompting: "generate" mode for new content, "consult" mode for feedback

---

### 2.2 Content Editor Module

**Functionality**: Full-featured editor for creating, editing, and managing master content.

**Inputs**:
- Text content (title, body)
- Metadata (content type, collection, status)
- Quality ratings
- Product associations

**Outputs**:
- Saved master content records
- Updated content with version tracking

**Dependencies**:
- Supabase `master_content` table
- React Query for data fetching
- Auto-save functionality

**UI Flows**:
1. User navigates to Create/Editor
2. User inputs content or generates via Madison
3. System auto-saves every 30 seconds
4. User can manually save, archive, or publish
5. Content appears in Library upon save

**Technical Implementation**:
- Three-step save routine to handle concurrency (resolve → validate → save)
- Prevents "ON CONFLICT" errors on partial unique indexes
- Word count tracking
- Status management (draft → published → archived)

---

### 2.3 Content Repurposing Module (Multiply/Amplify)

**Functionality**: Transforms master content into derivative assets optimized for specific channels.

**Inputs**:
- Master content ID
- Target derivative type (email, Instagram, Twitter, LinkedIn, Pinterest, TikTok, YouTube, podcast, visual asset, Etsy listing)
- Platform-specific constraints

**Outputs**:
- Formatted derivative content
- Platform specifications (character limits, hashtag requirements, etc.)
- Quality ratings

**Dependencies**:
- Supabase Edge Function: `repurpose-content`
- `derivative_assets` table
- Transformation prompts library

**UI Flows**:
1. User selects master content from Library
2. User clicks "Amplify" or navigates to Multiply page
3. User selects derivative type(s) from grid
4. System generates derivatives with loading animation
5. User reviews, edits, and saves/schedules derivatives

**Technical Implementation**:
- Predefined transformation prompts for each derivative type
- Platform-specific constraints (e.g., Instagram 2200 chars, Twitter 280)
- Batch generation support (create multiple derivatives simultaneously)
- Planned: Etsy listing generation with compliance validation

---

### 2.4 Brand Knowledge Center

**Functionality**: Absorbs and structures brand intelligence from uploaded documents and websites.

**Inputs**:
- PDF documents (brand guidelines, style guides)
- Website URLs for scraping
- Manual brand profile inputs (voice, story, identity)

**Outputs**:
- Extracted brand knowledge (stored in `brand_knowledge` table)
- Structured brand context for AI generation
- Document processing status updates

**Dependencies**:
- Supabase Edge Functions: `process-brand-document`, `scrape-brand-website`, `extract-brand-knowledge`
- Storage bucket: `brand-documents`
- `brand_documents` table

**UI Flows**:
1. User uploads PDF or enters website URL during onboarding
2. System processes document in background
3. Extracted knowledge populates brand profile
4. User can view/edit brand profile in Settings
5. All Madison generations automatically use this context

**Technical Implementation**:
- PDF text extraction and parsing
- Website content scraping with structured extraction
- Knowledge categorization (voice, tone, values, forbidden phrases, etc.)
- Processing status tracking (pending → processing → completed → error)

---

### 2.5 Product Management

**Functionality**: Manage product catalog with category-specific attributes.

**Inputs**:
- Product name, type, category
- Category-specific fields (scent notes for fragrances, materials for home fragrance, etc.)
- Collection assignment

**Outputs**:
- Structured product records
- Product context for content generation

**Dependencies**:
- `brand_products` table
- Category configuration system
- React components: `ProductsTab.tsx`

**UI Flows**:
1. User navigates to Settings → Products
2. User adds new product or edits existing
3. User selects category (personal fragrance, home fragrance, body care, etc.)
4. Form adapts to show category-specific fields
5. User saves product
6. Product becomes available in content generation flows

**Technical Implementation**:
- Dynamic form rendering based on category
- CSV import support for bulk product uploads
- Product-to-collection mapping
- Integration with content generation (products auto-populate in prompts)

---

### 2.6 Library (The Archives)

**Functionality**: Central repository for all content (master and derivatives) with filtering, search, and organization.

**Inputs**:
- Search queries
- Filter selections (content type, collection, date range, status)
- Sort preferences

**Outputs**:
- Filtered and sorted content grid
- Content detail modals
- Export capabilities

**Dependencies**:
- `master_content` and `derivative_assets` tables
- React Query for data fetching
- Components: `Library.tsx`, `ContentGrid.tsx`, `ContentCard.tsx`, `ContentDetailModal.tsx`

**UI Flows**:
1. User navigates to Library
2. User applies filters (type, collection, date)
3. System displays content in grid or compact view
4. User clicks content to view details
5. User can edit, archive, schedule, or export from modal

**Technical Implementation**:
- Real-time filtering and sorting
- Date grouping (Today, Yesterday, This Week, etc.)
- View density toggle (comfortable vs. compact)
- Archive functionality with soft delete
- Export to PDF/DOCX with brand styling

---

### 2.7 Calendar & Scheduling (The Planner)

**Functionality**: Content calendar with scheduling, Google Calendar sync, and task management.

**Inputs**:
- Scheduled content items
- Calendar notes
- Tasks with due dates
- Google Calendar OAuth credentials

**Outputs**:
- Visual calendar (month/week/agenda views)
- Synced Google Calendar events
- Task completion tracking

**Dependencies**:
- `scheduled_content`, `calendar_tasks`, `calendar_notes` tables
- Supabase Edge Functions: `google-calendar-oauth`, `sync-to-google-calendar`
- Google Calendar API
- React components: `Calendar.tsx`, `MonthView.tsx`, `WeekView.tsx`, `AgendaView.tsx`

**UI Flows**:
1. User navigates to Calendar
2. User views schedule in preferred view (month/week/agenda)
3. User schedules content from Library or creates new events
4. User connects Google Calendar (OAuth flow)
5. Events sync bidirectionally with Google Calendar
6. User manages tasks in sidebar panel

**Technical Implementation**:
- Google OAuth 2.0 integration
- Encrypted token storage
- Bidirectional sync (Scriptora ↔ Google Calendar)
- Event creation with content associations
- Task management with completion tracking

---

### 2.8 Prompt Library (The Reservoir)

**Functionality**: Store, organize, and reuse prompt templates with performance tracking.

**Inputs**:
- Prompt text and metadata
- Tags, collection, content type
- Template placeholders

**Outputs**:
- Saved prompt templates
- Usage statistics (times used, avg quality rating)
- Refined prompts (via AI enhancement)

**Dependencies**:
- `prompts` table
- Supabase Edge Function: `refine-prompt-template`
- Components: `Templates.tsx`, `PromptCard.tsx`, `PromptDetailModal.tsx`

**UI Flows**:
1. User navigates to Prompt Library
2. User browses templates by collection/category
3. User selects prompt to view details
4. User can use, edit, or refine prompt
5. System tracks usage and quality metrics
6. User can save custom prompts

**Technical Implementation**:
- Prompt versioning system
- Quality rating aggregation
- Template variable replacement ({{product_name}}, {{collection}}, etc.)
- AI-powered prompt refinement
- Effectiveness scoring based on usage patterns

---

### 2.9 Settings & Configuration

**Functionality**: Comprehensive settings for brand profile, products, collections, team management, and integrations.

**Inputs**:
- Organization details
- Brand voice and identity settings
- Team member invitations
- Collection configurations
- Integration credentials

**Outputs**:
- Updated organization settings
- Configured brand profile
- Active team members
- Integration statuses

**Dependencies**:
- `organizations`, `organization_members`, `brand_collections` tables
- Settings components: `BrandGuidelinesTab.tsx`, `ProductsTab.tsx`, `CollectionsTab.tsx`, `TeamTab.tsx`

**UI Flows**:
1. User navigates to Settings
2. User selects tab (Brand, Products, Collections, Team, etc.)
3. User updates settings
4. System validates and saves changes
5. Changes reflect across all content generation

**Technical Implementation**:
- Organization-based multi-tenancy
- Role-based access control (Owner, Admin, Member)
- Brand profile with industry-specific templates
- Collection management (4 core collections: Humanities, Reserve, Purity, Elemental)
- Document upload and processing status tracking

---

### 2.10 Madison Training System (Admin Only)

**Functionality**: Super admin interface for managing Madison's system configuration and training documents.

**Inputs**:
- Training documents (PDFs)
- System configuration (persona, editorial philosophy, voice spectrum, quality standards)

**Outputs**:
- Updated Madison system behavior
- Processed training materials

**Dependencies**:
- `madison_system_config`, `madison_training_documents` tables
- Supabase Edge Function: `process-madison-training-document`
- Storage bucket: `madison-training-docs`
- Super admin access control

**UI Flows**:
1. Super admin navigates to Madison Training (Settings → Madison Training)
2. Admin uploads training documents or edits system config
3. System processes documents and updates configuration
4. Changes affect all Madison interactions globally

**Technical Implementation**:
- Super admin-only RLS policies
- Document processing with extraction
- System prompt construction using configuration
- Global impact across all organizations

---

## 3. User Stories & Use Cases

### Story 1: Brand Manager Scaling Content Production
**As a** brand manager with 50+ products,  
**I want to** generate on-brand product descriptions quickly,  
**So that** I can launch new products faster without compromising brand voice.

**Mapped Features**: Product Management, Madison AI, Brand Knowledge Center, Master Content Editor

---

### Story 2: Marketing Team Creating Multi-Channel Campaigns
**As a** marketing coordinator,  
**I want to** transform one blog post into 10+ social media posts, emails, and ads,  
**So that** I maintain messaging consistency across all channels without manual rewriting.

**Mapped Features**: Multiply/Amplify Module, Derivative Assets, Library, Calendar

---

### Story 3: Solo Entrepreneur Maintaining Professional Presence
**As a** solo entrepreneur with limited time,  
**I want to** schedule a month's worth of content in one session,  
**So that** I can focus on my business while maintaining consistent marketing.

**Mapped Features**: Calendar & Scheduling, Google Calendar Sync, Prompt Library, Madison AI

---

### Story 4: Content Creator Ensuring Brand Compliance
**As a** content creator working for a luxury brand,  
**I want to** have my draft content reviewed for brand alignment,  
**So that** I don't accidentally use forbidden phrases or off-brand language.

**Mapped Features**: Madison Consult Mode, Brand Knowledge Center, Editorial Assistant

---

### Story 5: E-commerce Seller Generating Marketplace Listings
**As an** Etsy seller with handmade products,  
**I want to** generate compliant, SEO-optimized listings from my product descriptions,  
**So that** I can increase visibility while adhering to Etsy's terms of service.

**Mapped Features**: Etsy Listing Derivative (planned), Product Management, Multiply Module

---

### Story 6: Agency Managing Multiple Brand Accounts
**As a** creative agency,  
**I want to** switch between client organizations with distinct brand voices,  
**So that** I can manage multiple brands without cross-contamination.

**Mapped Features**: Organization Multi-tenancy, Team Management, Brand Profiles

---

### Story 7: Content Strategist Analyzing Performance
**As a** content strategist,  
**I want to** track which prompts and content types perform best,  
**So that** I can optimize my content strategy over time.

**Mapped Features**: Prompt Library Quality Ratings, Master Content Quality Tracking, Derivative Performance Metrics (partial)

---

## 4. Performance & Technical Notes

### 4.1 Data Handling

**Brand Document Absorption**:
- PDF parsing via edge functions
- Text extraction with chunking for large documents
- Structured knowledge extraction (voice, tone, values, forbidden phrases)
- Storage: `brand-documents` bucket, metadata in `brand_documents` table
- Processing pipeline: Upload → Parse → Extract → Structure → Store → Apply to AI context

**Database Access**:
- Supabase PostgreSQL with Row-Level Security (RLS)
- Organization-based isolation (all tables scoped to `organization_id`)
- Real-time subscriptions for collaborative features (planned)
- Multi-table joins for complex queries (e.g., master content + derivatives + products)

**AI Model Interaction**:
- Primary: Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- Retry logic: Exponential backoff for 500 errors (3 attempts, 1-2-4 sec delays)
- Context window: Up to 200K tokens
- Streaming responses for real-time UX
- Alternative: Lovable AI Gateway (Google Gemini 2.5 Flash) available but not currently used

---

### 4.2 Platform Dependencies

**Frontend**:
- React 18.3.1 with TypeScript
- Vite 5.x for build tooling
- Tailwind CSS with custom design system ("The Codex")
- shadcn/ui component library
- React Router for navigation
- TanStack Query (React Query) for data fetching and caching
- Framer Motion for animations

**Backend**:
- Supabase (via Lovable Cloud)
- PostgreSQL database with RLS
- Edge Functions (Deno runtime)
- Storage buckets for file uploads
- Real-time subscriptions (available, not fully utilized)

**External Integrations**:
- Anthropic Claude API (AI generation)
- Google Calendar API (OAuth + sync)
- Lovable AI Gateway (available, not active)

**Design System**:
- Custom color palette: "Black Books & Cream Paper" aesthetic
- Typography: Cormorant Garamond (headings), Lato (body), Crimson Text (accents)
- Shadow and gradient systems
- Responsive breakpoints with mobile-first approach

---

### 4.3 Security & Access Control

**Authentication**:
- Supabase Auth with email/password
- Auto-confirm email signups enabled
- Session management with secure tokens

**Authorization**:
- Role-based access: Owner, Admin, Member
- RLS policies on all tables
- Organization-scoped data isolation
- Super admin role for Madison training

**Data Protection**:
- Encrypted token storage for Google Calendar
- Secure edge function execution
- API key management via Supabase secrets

---

## 5. Known Issues / Limitations

### 5.1 AI Generation Stability
**Issue**: Anthropic Claude API occasionally returns 500 Internal Server Errors.  
**Impact**: Users experience "Communication error: Unable to reach Editorial Director."  
**Mitigation**: Implemented exponential backoff retry logic (3 attempts).  
**Long-term solution**: Consider migration to Lovable AI Gateway for better reliability.

---

### 5.2 Content Editor Concurrency
**Issue**: Previous "ON CONFLICT" errors when multiple users edited same content.  
**Impact**: Save failures, potential data loss.  
**Mitigation**: Implemented three-step save routine (resolve → validate → save).  
**Limitation**: Edge cases with rapid concurrent edits may still occur.

---

### 5.3 Derivative Generation - Multiply Page
**Issue** (from session replay notes): Multiply page sometimes reverts content when switching between derivative types.  
**Impact**: User frustration, need to re-select master content.  
**Status**: Under investigation, may be state management issue.

---

### 5.4 Library Scheduling Limitations
**Issue** (from session replay notes): Scheduling flow from Library may not persist calendar selections.  
**Impact**: Users need to re-enter scheduling details.  
**Status**: Needs QA testing and potential fix.

---

### 5.5 Etsy Listing Compliance
**Issue**: Etsy's AI-generated content policies evolve frequently.  
**Impact**: Generated listings may require manual review to ensure compliance.  
**Mitigation**: Planned validation helper and craftsmanship story requirements.  
**Limitation**: Cannot guarantee 100% compliance without manual oversight.

---

### 5.6 Google Calendar Sync - Token Expiry
**Issue**: Refresh tokens can expire if not used within 7 days (Google policy).  
**Impact**: Users need to re-authenticate periodically.  
**Mitigation**: Token refresh logic in place, but cannot prevent Google-side expiry.

---

### 5.7 Performance with Large Organizations
**Issue**: Organizations with 500+ products or 1000+ content items may experience slow queries.  
**Impact**: Delayed loading in Library and filtering.  
**Mitigation**: Pagination and lazy loading (partially implemented).  
**Long-term solution**: Query optimization and caching strategies.

---

## 6. Future Scope / Next Phase

### 6.1 Etsy Listing Generator (In Progress)
- Add `etsy_listing` derivative type
- Implement Etsy-specific validation (title length, keyword stuffing, handmade verification)
- Create transformation prompt with 2025 Etsy compliance rules
- Add craftsmanship story field to product management
- Test with various product categories

---

### 6.2 Migration to Lovable AI Gateway
- Transition from Anthropic Claude to Google Gemini 2.5 Flash
- Benefits: Better reliability, no external API key management, cost optimization
- Requires: Prompt format adjustments, testing for quality parity
- Timeline: Considered but not prioritized (retry logic sufficient for now)

---

### 6.3 ERP Integration
**Placeholder**: System designed to accommodate future ERP connections for inventory, orders, fulfillment.  
**Use case**: Sync product catalog with Shopify, WooCommerce, or other platforms.  
**Data model**: `brand_products` table can be extended with SKU, inventory fields.

---

### 6.4 Analytics & Performance Dashboard
**Placeholder**: Track content performance metrics across channels.  
**Features**:
- Engagement rates (likes, shares, clicks)
- A/B testing for derivative variations
- Prompt effectiveness scoring
- ROI tracking for content campaigns

**Data model**: `performance_metrics` JSONB field exists in `derivative_assets` table.

---

### 6.5 Testimonial Sync
**Placeholder**: Automatically pull customer reviews and testimonials into content generation.  
**Use case**: Generate social proof content, product description enhancements.  
**Data model**: New `testimonials` table (not yet created).

---

### 6.6 Real-Time Collaboration
**Capability**: Supabase real-time subscriptions available but not utilized.  
**Features**:
- Live cursors in Content Editor
- Presence indicators (who's viewing/editing)
- Collaborative commenting on drafts
- Instant updates when teammates schedule content

---

### 6.7 Advanced Prompt Wizard
**Enhancement**: Guided prompt creation with AI assistance.  
**Features**:
- Template builder with drag-and-drop components
- Variable suggestion based on product schema
- A/B testing for prompt variations
- Automatic optimization recommendations

---

### 6.8 Mobile App (PWA)
**Platform**: Progressive Web App for on-the-go content management.  
**Features**:
- Lightweight content review and approval
- Push notifications for scheduled content
- Quick edits and repurposing
- Voice-to-text for Madison conversations

---

## 7. Success Metrics

### 7.1 Content Generation Accuracy
**KPI**: Average quality rating ≥ 4.0/5.0 for AI-generated content  
**Measurement**: Track `quality_rating` field in `master_content` and `outputs` tables  
**Target**: 80% of content rated 4+ stars within 30 days of launch

---

### 7.2 Derivative Diversity
**KPI**: Average 5+ derivative types per master content  
**Measurement**: Count distinct `asset_type` values per `master_content_id` in `derivative_assets`  
**Target**: Users create at least 5 derivatives for each blog post/master content

---

### 7.3 Scheduling Reliability
**KPI**: 95% successful Google Calendar sync rate  
**Measurement**: Track `sync_status` in `scheduled_content` table (success vs. failed)  
**Target**: Less than 5% sync failures per month

---

### 7.4 Brand Alignment
**KPI**: <10% of content flagged for brand voice issues  
**Measurement**: Manual review sample + user feedback on Madison's brand adherence  
**Target**: 90%+ of generated content passes brand voice audit

---

### 7.5 User Engagement
**KPI**: Average 3+ sessions per week per active user  
**Measurement**: Track user login frequency and session duration  
**Target**: 70% of users return 3+ times weekly

---

### 7.6 Prompt Library Utilization
**KPI**: 60% of content generated using saved prompts  
**Measurement**: Count `prompt_id` associations in `outputs` and `master_content`  
**Target**: Users rely on template library for majority of content creation

---

### 7.7 Time to First Value
**KPI**: Users generate first quality content within 15 minutes of signup  
**Measurement**: Time between account creation and first `master_content` save with quality_rating ≥ 4  
**Target**: 80% of users create quality content in first session

---

### 7.8 API Reliability
**KPI**: 99.5% uptime for Madison conversations  
**Measurement**: Monitor edge function success rate, retry counts, error logs  
**Target**: <0.5% failure rate after retry logic implementation

---

### 7.9 Derivative Export Volume
**KPI**: 100+ derivative assets exported per organization per month  
**Measurement**: Track exports from Library (PDF, DOCX downloads)  
**Target**: Active organizations export 100+ assets monthly

---

### 7.10 Team Collaboration
**KPI**: 40% of organizations have 2+ team members  
**Measurement**: Count `organization_members` per `organization_id`  
**Target**: Growth in multi-user organizations to 40% within 6 months

---

## Appendix: Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Editor  │  │ Library  │  │ Multiply │  │ Calendar │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │              │             │
│       └─────────────┴──────────────┴──────────────┘             │
│                       │                                         │
│              ┌────────▼────────┐                                │
│              │ Supabase Client │                                │
│              └────────┬────────┘                                │
└───────────────────────┼──────────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────────┐
│                    LOVABLE CLOUD (Supabase)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      PostgreSQL DB                        │   │
│  │  • master_content     • derivative_assets                 │   │
│  │  • brand_products     • brand_knowledge                   │   │
│  │  • prompts            • scheduled_content                 │   │
│  │  • organizations      • organization_members              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Edge Functions                         │   │
│  │  • generate-with-claude      (AI generation)              │   │
│  │  • repurpose-content         (Derivatives)                │   │
│  │  • process-brand-document    (PDF parsing)                │   │
│  │  • google-calendar-oauth     (OAuth flow)                 │   │
│  │  • sync-to-google-calendar   (Event sync)                 │   │
│  │  • think-mode-chat           (Madison streaming)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Storage Buckets                        │   │
│  │  • brand-documents           • brand-assets               │   │
│  │  • madison-training-docs     • worksheet-uploads          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Anthropic       │  │ Google Calendar │  │ Lovable AI      │ │
│  │ Claude API      │  │ API             │  │ Gateway         │ │
│  │ (Active)        │  │ (OAuth + Sync)  │  │ (Available)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Document Metadata

**Version**: 1.0  
**Generated**: January 2025  
**Based on**: Live Scriptora/Madison build (commit as of user session)  
**Author**: AI-generated from current codebase  
**Next Review**: After Etsy listing feature launch  

---

**END OF MADISON PRD**
