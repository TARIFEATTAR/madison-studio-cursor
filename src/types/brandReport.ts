/**
 * Brand Report Type Definitions
 * 
 * Core types for the brand audit system including Domain, Scan, and BrandReport.
 * These types represent the source of truth for brand audit data.
 */

/**
 * Domain entity - represents a scanned website domain
 */
export type Domain = {
  id: string;
  organizationId: string;
  domain: string; // e.g., "example.com" (normalized, no www, no protocol)
  displayName?: string; // Optional friendly name
  createdAt: string;
  updatedAt: string;
  metadata?: {
    firstScannedAt?: string;
    lastScannedAt?: string;
    scanCount?: number;
    notes?: string;
  };
};

/**
 * Scan entity - represents a single scan execution
 */
export type Scan = {
  id: string;
  organizationId: string;
  domainId?: string; // Optional reference to domains table
  domain: string; // Denormalized for easier querying
  scanType: 'brand_dna' | 'website_scrape' | 'full_audit' | 'quick_scan';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scanData: BrandReport; // Full report data
  errorMessage?: string;
  metadata?: {
    duration?: number; // Scan duration in milliseconds
    sourceUrl?: string; // Original URL scanned
    userAgent?: string;
    extractionMethods?: {
      logo?: string[]; // e.g., ['brandfetch', 'html_scraping']
      colors?: string[]; // e.g., ['brandfetch', 'css_parsing']
      content?: string[]; // e.g., ['ai_analysis', 'html_parsing']
    };
  };
  createdAt: string;
  updatedAt: string;
};

/**
 * BrandReport - The fully-aggregated report object
 * Used by both the report page and PDF generation
 */
export type BrandReport = {
  site: {
    domain: string;
    url: string;
    logoUrl?: string;
    altLogos?: string[];
    faviconUrl?: string;
    ogImageUrl?: string;
    screenshotUrl?: string;
    logoSource?: 'brandfetch' | 'logo.dev' | 'html_scraping' | 'favicon' | 'none';
    logoConfidenceScore?: number;
  };
  
  brandProfile: {
    brandName?: string;
    tagline?: string;
    positioning?: string;
    primaryAudience?: string[];
    toneTraits?: string[];
    visualKeywords?: string[];
    archetype?: string;
    mission?: string;
    values?: string[];
    essence?: string; // 3-5 keywords
  };
  
  colors: {
    primary: string[]; // Hex color codes
    secondary: string[]; // Hex color codes
    neutrals: string[]; // Hex color codes
    accent?: string[]; // Hex color codes
    rawSources?: {
      fromBrandApi?: {
        source: 'brandfetch' | 'colorize';
        colors: any[];
      };
      fromCss?: {
        variables: string[];
        frequent: Array<{ hex: string; count: number }>;
      };
      fromScreenshot?: {
        dominantColors: string[];
        method: 'k-means' | 'color-thief';
      };
    };
    colorSource?: 'brandfetch' | 'colorize' | 'css_parsing' | 'html_analysis' | 'none';
    colorConfidenceScore?: number;
  };
  
  typography?: {
    primaryFont?: string;
    secondaryFont?: string;
    headlineFont?: string;
    bodyFont?: string;
    guesses?: string[];
    sources?: {
      fromCss?: string[];
      fromGoogleFonts?: string[];
      fromAi?: string[];
    };
  };
  
  brandVoice?: {
    tone?: string[];
    style?: string;
    perspective?: string; // 1st person vs 3rd person
    vocabulary?: {
      keywords?: string[];
      phrases?: string[];
      forbidden?: string[];
    };
  };
  
  strategicAudit?: {
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
  };
  
  contentStrategy?: {
    themes?: string[];
    hooks?: string[];
    formats?: string[];
  };
  
  visualStyle?: {
    mood?: string;
    photography?: string;
    composition?: string;
    imagery?: {
      style?: string;
      subjects?: string[];
    };
  };
  
  scoring?: {
    brandConsistency?: number; // 0-100
    visualConsistency?: number; // 0-100
    messageClarity?: number; // 0-100
    conversionReadiness?: number; // 0-100
    overallScore?: number; // 0-100
  };
  
  recommendations?: Array<{
    category: 'visual' | 'messaging' | 'technical' | 'strategy';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionable?: boolean;
  }>;
  
  scanMeta: {
    scannedAt: string; // ISO timestamp
    version: string; // e.g., "1.0.0"
    sourceUrl: string; // Original URL scanned
    scanId?: string; // Reference to scan record
    extractionMethods?: {
      logo?: string[];
      colors?: string[];
      content?: string[];
    };
  };
  
  // Legacy fields for backward compatibility
  brand_identity?: {
    mission?: string;
    values?: string[];
    target_audience?: string;
  };
  
  brand_voice?: {
    tone?: string[];
    style?: string;
    perspective?: string;
  };
  
  vocabulary?: {
    keywords?: string[];
    phrases?: string[];
    forbidden_inferred?: string[];
  };
  
  strategic_audit?: {
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
  };
  
  content_strategy?: {
    themes?: string[];
    hooks?: string[];
  };
};

/**
 * Scan Input - What's needed to start a scan
 */
export type ScanInput = {
  url: string;
  organizationId: string;
  scanType?: Scan['scanType'];
  options?: {
    includeScreenshot?: boolean;
    includePerformance?: boolean;
    includeSEO?: boolean;
    extractionMethods?: {
      logo?: ('brandfetch' | 'logo.dev' | 'html_scraping' | 'favicon')[];
      colors?: ('brandfetch' | 'colorize' | 'css_parsing' | 'html_analysis')[];
    };
  };
};

/**
 * Scan Result - What's returned from a scan
 */
export type ScanResult = {
  scan: Scan;
  report: BrandReport;
  success: boolean;
  errors?: string[];
  warnings?: string[];
};

/**
 * Report Generation Options
 */
export type ReportGenerationOptions = {
  format?: 'pdf' | 'html' | 'json';
  includeSections?: string[];
  excludeSections?: string[];
  branding?: {
    useClientBranding?: boolean; // Use client's colors/logo in report
    mapsystemBranding?: boolean; // Include mapsystem.io branding
  };
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
};

/**
 * Type guards and utilities
 */
export function isValidBrandReport(data: any): data is BrandReport {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.site === 'object' &&
    typeof data.site.domain === 'string' &&
    typeof data.site.url === 'string' &&
    typeof data.colors === 'object' &&
    Array.isArray(data.colors.primary) &&
    Array.isArray(data.colors.secondary) &&
    Array.isArray(data.colors.neutrals) &&
    typeof data.scanMeta === 'object' &&
    typeof data.scanMeta.scannedAt === 'string' &&
    typeof data.scanMeta.sourceUrl === 'string'
  );
}

export function normalizeDomain(urlOrDomain: string): string {
  // Remove protocol
  let domain = urlOrDomain.replace(/^https?:\/\//, '');
  // Remove www.
  domain = domain.replace(/^www\./, '');
  // Remove trailing slash
  domain = domain.replace(/\/$/, '');
  // Remove path
  domain = domain.split('/')[0];
  // Remove port
  domain = domain.split(':')[0];
  return domain.toLowerCase().trim();
}

export function createEmptyBrandReport(domain: string, url: string): BrandReport {
  return {
    site: {
      domain: normalizeDomain(domain),
      url: url,
    },
    brandProfile: {},
    colors: {
      primary: [],
      secondary: [],
      neutrals: [],
    },
    scanMeta: {
      scannedAt: new Date().toISOString(),
      version: '1.0.0',
      sourceUrl: url,
    },
  };
}

/**
 * Merge multiple BrandReports (useful for combining scan results)
 */
export function mergeBrandReports(reports: BrandReport[]): BrandReport {
  if (reports.length === 0) {
    throw new Error('Cannot merge empty array of reports');
  }
  
  if (reports.length === 1) {
    return reports[0];
  }
  
  const base = reports[0];
  
  // Merge colors (union, deduplicated)
  const mergedColors: BrandReport['colors'] = {
    primary: [...new Set(reports.flatMap(r => r.colors.primary))],
    secondary: [...new Set(reports.flatMap(r => r.colors.secondary))],
    neutrals: [...new Set(reports.flatMap(r => r.colors.neutrals))],
    accent: [...new Set(reports.flatMap(r => r.colors.accent || []))],
  };
  
  // Merge brand profile (take first non-empty value)
  const mergedProfile: BrandReport['brandProfile'] = {
    brandName: reports.find(r => r.brandProfile.brandName)?.brandProfile.brandName || base.brandProfile.brandName,
    tagline: reports.find(r => r.brandProfile.tagline)?.brandProfile.tagline || base.brandProfile.tagline,
    positioning: reports.find(r => r.brandProfile.positioning)?.brandProfile.positioning || base.brandProfile.positioning,
    primaryAudience: [...new Set(reports.flatMap(r => r.brandProfile.primaryAudience || []))],
    toneTraits: [...new Set(reports.flatMap(r => r.brandProfile.toneTraits || []))],
    visualKeywords: [...new Set(reports.flatMap(r => r.brandProfile.visualKeywords || []))],
    archetype: reports.find(r => r.brandProfile.archetype)?.brandProfile.archetype || base.brandProfile.archetype,
    mission: reports.find(r => r.brandProfile.mission)?.brandProfile.mission || base.brandProfile.mission,
    values: [...new Set(reports.flatMap(r => r.brandProfile.values || []))],
    essence: reports.find(r => r.brandProfile.essence)?.brandProfile.essence || base.brandProfile.essence,
  };
  
  // Use most recent scan meta
  const latestScan = reports.reduce((latest, current) => {
    return new Date(current.scanMeta.scannedAt) > new Date(latest.scanMeta.scannedAt) 
      ? current 
      : latest;
  });
  
  return {
    ...base,
    site: {
      ...base.site,
      logoUrl: reports.find(r => r.site.logoUrl)?.site.logoUrl || base.site.logoUrl,
      altLogos: [...new Set(reports.flatMap(r => r.site.altLogos || []))],
      faviconUrl: reports.find(r => r.site.faviconUrl)?.site.faviconUrl || base.site.faviconUrl,
      ogImageUrl: reports.find(r => r.site.ogImageUrl)?.site.ogImageUrl || base.site.ogImageUrl,
    },
    brandProfile: mergedProfile,
    colors: mergedColors,
    scanMeta: latestScan.scanMeta,
  };
}

