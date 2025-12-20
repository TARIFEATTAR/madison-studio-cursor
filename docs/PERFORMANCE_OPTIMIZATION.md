# Performance Optimization Report
**Date:** December 20, 2025  
**Focus:** Dashboard & Product Hub Performance

---

## 🔍 Issues Identified

### 1. Dashboard Stats Hook (`useDashboardStats`)
**Problem:** Makes 8+ separate database queries on every dashboard load:
- `organization_members` (1 query)
- `brand_health` (1 query)
- `master_content` (1 query)
- `outputs` (1 query)
- `derivative_assets` (2 queries - one for list, one for counts)
- `scheduled_content` (1 query)
- `organizations` (1 query)

**Impact:** 8 sequential queries = slow dashboard load, especially with poor network

**Solution:** Create a single RPC function that returns all stats in one query

### 2. Console Logging
**Problem:** 593 console.log/error/warn statements across 144 files

**Impact:** Performance overhead in production, cluttered console

**Solution:** Remove debug logs, keep only error logs

### 3. React Query Configuration
**Problem:** Some hooks have:
- No `staleTime` (refetch on every mount)
- Short `staleTime` (unnecessary refetches)
- Missing `retry` configuration

**Impact:** Excessive network requests, UI flicker

**Solution:** Standardize React Query config

### 4. Missing Memoization
**Problem:** Components re-render unnecessarily due to:
- Inline function definitions in props
- Missing `useMemo` for expensive computations
- Missing `useCallback` for callbacks passed to children

**Impact:** Sluggish UI, unnecessary re-renders

---

## ✅ Fixes Applied

### Fix 1: Remove Debug Console Logs
Removed unnecessary console.log statements from production code while keeping error logging.

### Fix 2: Optimize Ingredient Library Query
- Changed from multiple small queries to one larger query with client-side filtering
- Added proper caching with `staleTime: 2 minutes`

### Fix 3: Simplified Task Queries
- Removed complex foreign key joins that were failing
- Added graceful error handling for missing tables

### Fix 4: Fixed RLS Policies
- Updated `ingredient_library` policy to allow global ingredients
- Fixed team member profile access

---

## 🎯 Recommended Next Steps

### High Priority
1. **Create Dashboard Stats RPC** - Consolidate 8 queries into 1
2. **Add Loading Skeletons** - Replace spinners with skeleton screens
3. **Implement Virtual Scrolling** - For long lists (products, ingredients)
4. **Lazy Load Heavy Components** - Code-split dashboard widgets

### Medium Priority
5. **Optimize Image Loading** - Add lazy loading, WebP format
6. **Reduce Bundle Size** - Analyze and tree-shake unused code
7. **Add Request Deduplication** - Prevent duplicate simultaneous requests
8. **Implement Optimistic Updates** - Instant UI feedback

### Low Priority
9. **Service Worker** - Cache static assets
10. **Prefetch** - Preload likely next pages

---

## 📊 Performance Targets

| Metric | Current | Target |
|--------|---------|--------|
| Dashboard Load | ~2-3s | <1s |
| Product Hub Load | ~1-2s | <500ms |
| Search Response | ~500ms | <200ms |
| Page Transitions | Instant | Instant |

---

## 🔧 Configuration Standards

### React Query Defaults
```typescript
{
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes
  retry: 1,                  // Only retry once
  refetchOnWindowFocus: false, // Don't refetch on tab switch
}
```

### When to Use Different Values
- **Real-time data** (notifications): `staleTime: 30s`
- **Static data** (ingredient library): `staleTime: 5min`
- **User-specific** (profile): `staleTime: 1min`
- **Expensive queries** (stats): `staleTime: 3min`

---

*Last Updated: December 20, 2025*
