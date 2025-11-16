# Build Monitoring & System Health Dashboard - UI/UX Prompt

## Overview
Create a comprehensive system monitoring dashboard that visualizes the health, status, and performance of the Asala Studio application. This dashboard should provide real-time insights into build status, API calls, database operations, edge functions, and system metrics.

## Key Requirements

### 1. Dashboard Layout Structure

**Main Dashboard Page: `/admin/system-health` or `/monitoring`**

```
┌─────────────────────────────────────────────────────────────┐
│  System Health Dashboard                                   │
│  [Last Updated: 2s ago] [Auto-refresh: ON] [Export]       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ System   │ │ API      │ │ Database │ │ Edge      │    │
│  │ Status   │ │ Status   │ │ Health   │ │ Functions │    │
│  │ 🟢 OK    │ │ 🟡 98%   │ │ 🟢 99%   │ │ 🟢 100%   │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Real-time Activity Feed                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [12:34:56] Image generated - Recipe created ✅       │  │
│  │ [12:34:52] Edge function: generate-madison-image ⚡  │  │
│  │ [12:34:48] API call: POST /prompts ✅               │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Performance Metrics                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ API Response │ │ DB Query     │ │ Edge Func    │      │
│  │ Times        │ │ Performance  │ │ Execution    │      │
│  │ [Chart]      │ │ [Chart]      │ │ [Chart]      │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Core Components Needed

#### A. System Status Overview Card
- **Purpose**: High-level system health indicator
- **Metrics to Display**:
  - Overall System Status (🟢 Healthy / 🟡 Warning / 🔴 Critical)
  - Uptime percentage (last 24h, 7d, 30d)
  - Active users count
  - Current load/performance score
- **Visual**: Large status badge with color coding, trend indicators

#### B. API Monitoring Panel
- **Purpose**: Track all API calls and responses
- **Metrics to Display**:
  - Request count (last hour, day, week)
  - Success rate percentage
  - Average response time
  - Error rate and types
  - Top endpoints by volume
  - Failed requests with details
- **Visual**: Line charts, tables, error logs
- **Filters**: Time range, endpoint type, status code

#### C. Edge Function Health Monitor
- **Purpose**: Monitor Supabase Edge Functions
- **Metrics to Display**:
  - Function execution count
  - Success/failure rates
  - Average execution time
  - Recent invocations log
  - Error logs with stack traces
  - Function-specific metrics (generate-madison-image, mark-generated-image-saved, etc.)
- **Visual**: Function cards with status, execution timeline, error details

#### D. Database Health Dashboard
- **Purpose**: Monitor database operations
- **Metrics to Display**:
  - Query performance (slow queries)
  - Connection pool status
  - Table size and growth
  - Recent operations count
  - RLS policy hits/misses
  - Index usage statistics
- **Visual**: Query performance charts, table statistics

#### E. Image Recipe Creation Tracker
- **Purpose**: Specific monitoring for image recipe creation flow
- **Metrics to Display**:
  - Images generated today/hour
  - Recipe creation success rate
  - Recipe creation failures with error details
  - Time from generation to recipe creation
  - Failed recipe creations with reasons
  - Recent recipe creation events
- **Visual**: Real-time feed, success/failure indicators, error breakdown

#### F. Real-time Activity Feed
- **Purpose**: Live stream of system events
- **Events to Show**:
  - Image generation events
  - Recipe creation attempts (success/failure)
  - API calls
  - Edge function invocations
  - Database operations
  - Error events
- **Visual**: Scrollable timeline with color-coded events, filters by event type

#### G. Performance Metrics Charts
- **Purpose**: Visualize performance over time
- **Charts Needed**:
  - API response time trends
  - Database query performance
  - Edge function execution times
  - Error rate trends
  - User activity patterns
- **Visual**: Line charts, bar charts, area charts with time ranges (1h, 24h, 7d, 30d)

### 3. Data Collection Strategy

#### Frontend Logging
- Intercept API calls and log to monitoring system
- Track edge function invocations
- Log user actions and errors
- Send telemetry to Supabase table or analytics service

#### Backend/Edge Function Logging
- Enhanced console logging in edge functions
- Log all operations to `system_logs` table
- Track metrics in `system_metrics` table
- Error tracking with full context

#### Database Tables Needed
```sql
-- System logs table
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- 'api_call', 'edge_function', 'recipe_creation', etc.
  event_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error', 'warning'
  details JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  user_id UUID,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System metrics table
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  tags JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recipe creation tracking
CREATE TABLE recipe_creation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES generated_images(id),
  prompt_id UUID REFERENCES prompts(id),
  status TEXT NOT NULL, -- 'success', 'failed', 'skipped'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  execution_time_ms INTEGER
);
```

### 4. UI/UX Design Specifications

#### Color Scheme
- 🟢 Green: Healthy/Success (status code 200-299)
- 🟡 Yellow: Warning (status code 300-399, slow responses)
- 🔴 Red: Error/Critical (status code 400+, failures)
- 🔵 Blue: Info/Processing
- ⚪ Gray: Neutral/Unknown

#### Component Library
- Use existing shadcn-ui components
- Cards for status displays
- Tables for logs and data
- Charts using Recharts or similar
- Real-time updates using React Query
- Toast notifications for critical alerts

#### Responsive Design
- Desktop: Full dashboard with all panels
- Tablet: Collapsible sections
- Mobile: Stacked cards, simplified view

### 5. Implementation Steps

#### Phase 1: Basic Monitoring
1. Create `/admin/system-health` route
2. Build basic status cards
3. Implement real-time activity feed
4. Add basic API call logging

#### Phase 2: Advanced Metrics
1. Add performance charts
2. Implement edge function monitoring
3. Add database health tracking
4. Create recipe creation tracker

#### Phase 3: Alerts & Notifications
1. Set up alert thresholds
2. Email/Slack notifications for critical errors
3. Dashboard alerts for warnings
4. Auto-refresh functionality

#### Phase 4: Historical Analysis
1. Store metrics for long-term analysis
2. Trend analysis and predictions
3. Export capabilities
4. Custom date range filtering

### 6. Specific Features for Image Recipe Creation

#### Recipe Creation Monitor
- Real-time tracking of recipe creation attempts
- Success/failure indicators
- Error message display
- Time to creation metrics
- Filter by image ID, organization, date range
- Link to specific failed recipes for debugging

#### Debug View
- Show full request/response data
- Edge function logs
- Database query details
- Error stack traces
- User context (who, when, what)

### 7. Access Control
- Admin-only route (`/admin/system-health`)
- Check for admin role in organization
- Log all dashboard access
- Sensitive data masking for non-admins

### 8. Technical Stack
- React + TypeScript
- React Query for data fetching
- Supabase for backend/database
- Recharts for visualizations
- shadcn-ui for components
- Real-time subscriptions for live updates

## Prompt for AI Assistant

"Create a comprehensive system monitoring dashboard for Asala Studio that provides real-time visibility into:
1. System health and status
2. API call monitoring with success rates and response times
3. Edge function execution tracking and error logging
4. Database health and query performance
5. Image recipe creation tracking with success/failure rates
6. Real-time activity feed showing all system events
7. Performance metrics charts over time

The dashboard should:
- Use the existing design system (shadcn-ui, Tailwind CSS)
- Be accessible at `/admin/system-health` route
- Show real-time updates without page refresh
- Include filtering and search capabilities
- Display errors with full context for debugging
- Have a clean, professional UI with color-coded status indicators
- Be responsive for mobile/tablet/desktop

Create the necessary database tables for logging, implement the frontend components, and add logging hooks throughout the application to feed data to the dashboard."

## Files to Create/Modify

### New Files
- `src/pages/SystemHealth.tsx` - Main dashboard page
- `src/components/system-health/SystemStatusCard.tsx`
- `src/components/system-health/APIMonitor.tsx`
- `src/components/system-health/EdgeFunctionMonitor.tsx`
- `src/components/system-health/DatabaseHealth.tsx`
- `src/components/system-health/RecipeCreationTracker.tsx`
- `src/components/system-health/ActivityFeed.tsx`
- `src/components/system-health/PerformanceCharts.tsx`
- `src/hooks/useSystemHealth.tsx`
- `src/hooks/useSystemLogs.tsx`
- `src/utils/systemLogger.ts` - Logging utility

### Database Migrations
- `supabase/migrations/YYYYMMDDHHMMSS_create_system_logs.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_system_metrics.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_recipe_creation_logs.sql`

### Modified Files
- `src/App.tsx` - Add route for `/admin/system-health`
- `src/pages/ImageEditor.tsx` - Add logging hooks
- `supabase/functions/generate-madison-image/index.ts` - Enhanced logging
- Add logging to all edge functions

## Success Criteria
- ✅ Real-time visibility into system operations
- ✅ Clear error tracking and debugging information
- ✅ Recipe creation success/failure tracking
- ✅ Performance metrics visualization
- ✅ Easy navigation and filtering
- ✅ Mobile-responsive design
- ✅ Admin-only access control

