/**
 * Brand Report Converter Utilities
 * 
 * Converts between legacy formats and the new BrandReport type.
 * Ensures backward compatibility during migration.
 */

import { BrandReport, normalizeDomain } from '@/types/brandReport';

/**
 * Convert legacy brand DNA format to BrandReport
 * This handles the format currently returned by analyze-brand-dna
 */
export function convertLegacyBrandDNAToBrandReport(
  legacyData: any,
  url: string
): BrandReport {
  const domain = normalizeDomain(url);
  
  // Extract brand name
  const brandName = legacyData.brandName || domain.split('.')[0];
  
  // Convert color palette
  const colors = {
    primary: [],
    secondary: [],
    neutrals: [],
    accent: [],
  } as BrandReport['colors'];
  
  if (legacyData.colorPalette && Array.isArray(legacyData.colorPalette)) {
    legacyData.colorPalette.forEach((color: any) => {
      const hex = color.hex || color;
      if (!hex) return;
      
      const usage = (color.usage || '').toLowerCase();
      if (usage.includes('primary') || usage.includes('main')) {
        colors.primary.push(hex);
      } else if (usage.includes('secondary') || usage.includes('accent')) {
        colors.secondary.push(hex);
      } else if (usage.includes('neutral') || usage.includes('background') || usage.includes('text')) {
        colors.neutrals.push(hex);
      } else {
        // Default to primary if we don't have many
        if (colors.primary.length < 3) {
          colors.primary.push(hex);
        } else {
          colors.secondary.push(hex);
        }
      }
    });
  }
  
  // Add primary color if exists
  if (legacyData.primaryColor && !colors.primary.includes(legacyData.primaryColor)) {
    colors.primary.unshift(legacyData.primaryColor);
  }
  
  // Add color source info if available
  if (legacyData.colorSource) {
    colors.colorSource = legacyData.colorSource;
  }
  if (legacyData.colorConfidenceScore !== undefined) {
    colors.colorConfidenceScore = legacyData.colorConfidenceScore;
  }
  
  // Build brand report
  const report: BrandReport = {
    site: {
      domain: domain,
      url: url,
      logoUrl: legacyData.logo?.url,
      altLogos: legacyData.logo?.alternatives,
      logoSource: legacyData.logo?.source,
      logoConfidenceScore: legacyData.logo?.confidenceScore,
    },
    
    brandProfile: {
      brandName: brandName,
      mission: legacyData.brandMission || legacyData.brand_identity?.mission,
      values: legacyData.brand_identity?.values || [],
      essence: legacyData.brandEssence,
      primaryAudience: legacyData.brand_identity?.target_audience 
        ? [legacyData.brand_identity.target_audience] 
        : [],
      toneTraits: legacyData.brand_voice?.tone || legacyData.brandVoice?.tone || [],
      visualKeywords: legacyData.visualStyle?.mood 
        ? legacyData.visualStyle.mood.split(',').map((s: string) => s.trim())
        : [],
    },
    
    colors: colors,
    
    typography: {
      headlineFont: legacyData.fonts?.headline,
      bodyFont: legacyData.fonts?.body,
      primaryFont: legacyData.fonts?.headline,
      secondaryFont: legacyData.fonts?.body,
    },
    
    brandVoice: {
      tone: legacyData.brand_voice?.tone || legacyData.brandVoice?.tone || [],
      style: legacyData.brand_voice?.style || legacyData.brandVoice?.style,
      perspective: legacyData.brand_voice?.perspective || legacyData.brandVoice?.perspective,
      vocabulary: {
        keywords: legacyData.vocabulary?.keywords || [],
        phrases: legacyData.vocabulary?.phrases || [],
        forbidden: legacyData.vocabulary?.forbidden_inferred || [],
      },
    },
    
    strategicAudit: {
      summary: legacyData.strategic_audit?.summary,
      strengths: legacyData.strategic_audit?.strengths || [],
      weaknesses: legacyData.strategic_audit?.weaknesses || [],
      opportunities: legacyData.strategic_audit?.opportunities || [],
    },
    
    contentStrategy: {
      themes: legacyData.content_strategy?.themes || [],
      hooks: legacyData.content_strategy?.hooks || [],
    },
    
    visualStyle: {
      mood: legacyData.visualStyle?.mood,
      photography: legacyData.visualStyle?.photography,
      composition: legacyData.visualStyle?.composition,
    },
    
    scanMeta: {
      scannedAt: new Date().toISOString(),
      version: '1.0.0',
      sourceUrl: url,
    },
    
    // Include legacy fields for backward compatibility
    brand_identity: legacyData.brand_identity,
    brand_voice: legacyData.brand_voice,
    vocabulary: legacyData.vocabulary,
    strategic_audit: legacyData.strategic_audit,
    content_strategy: legacyData.content_strategy,
  };
  
  return report;
}

/**
 * Convert BrandReport back to legacy format (for backward compatibility)
 */
export function convertBrandReportToLegacy(brandReport: BrandReport): any {
  return {
    brandName: brandReport.brandProfile.brandName,
    primaryColor: brandReport.colors.primary[0],
    colorPalette: [
      ...brandReport.colors.primary.map(hex => ({ hex, name: 'Primary', usage: 'Primary brand color' })),
      ...brandReport.colors.secondary.map(hex => ({ hex, name: 'Secondary', usage: 'Secondary/accent color' })),
      ...brandReport.colors.neutrals.map(hex => ({ hex, name: 'Neutral', usage: 'Neutral/background color' })),
    ],
    fonts: {
      headline: brandReport.typography?.headlineFont,
      body: brandReport.typography?.bodyFont,
    },
    logo: {
      detected: !!brandReport.site.logoUrl,
      url: brandReport.site.logoUrl,
      description: brandReport.site.logoUrl ? 'Logo extracted from website' : 'No logo found',
      source: brandReport.site.logoSource,
      confidenceScore: brandReport.site.logoConfidenceScore,
      alternatives: brandReport.site.altLogos,
    },
    visualStyle: {
      mood: brandReport.visualStyle?.mood,
      photography: brandReport.visualStyle?.photography,
      composition: brandReport.visualStyle?.composition,
    },
    brandMission: brandReport.brandProfile.mission,
    brandEssence: brandReport.brandProfile.essence,
    brand_identity: brandReport.brand_identity || {
      mission: brandReport.brandProfile.mission,
      values: brandReport.brandProfile.values,
      target_audience: brandReport.brandProfile.primaryAudience?.join(', '),
    },
    brand_voice: brandReport.brand_voice || brandReport.brandVoice,
    vocabulary: brandReport.vocabulary,
    strategic_audit: brandReport.strategic_audit,
    content_strategy: brandReport.content_strategy,
    colorSource: brandReport.colors.colorSource,
    colorConfidenceScore: brandReport.colors.colorConfidenceScore,
  };
}

/**
 * Validate and normalize a BrandReport
 */
export function normalizeBrandReport(report: Partial<BrandReport>, url: string): BrandReport {
  const domain = normalizeDomain(url);
  
  return {
    site: {
      domain: report.site?.domain || domain,
      url: report.site?.url || url,
      logoUrl: report.site?.logoUrl,
      altLogos: report.site?.altLogos || [],
      faviconUrl: report.site?.faviconUrl,
      ogImageUrl: report.site?.ogImageUrl,
      logoSource: report.site?.logoSource,
      logoConfidenceScore: report.site?.logoConfidenceScore,
    },
    
    brandProfile: {
      brandName: report.brandProfile?.brandName || domain.split('.')[0],
      tagline: report.brandProfile?.tagline,
      positioning: report.brandProfile?.positioning,
      primaryAudience: report.brandProfile?.primaryAudience || [],
      toneTraits: report.brandProfile?.toneTraits || [],
      visualKeywords: report.brandProfile?.visualKeywords || [],
      archetype: report.brandProfile?.archetype,
      mission: report.brandProfile?.mission,
      values: report.brandProfile?.values || [],
      essence: report.brandProfile?.essence,
    },
    
    colors: {
      primary: report.colors?.primary || [],
      secondary: report.colors?.secondary || [],
      neutrals: report.colors?.neutrals || [],
      accent: report.colors?.accent || [],
      rawSources: report.colors?.rawSources,
      colorSource: report.colors?.colorSource,
      colorConfidenceScore: report.colors?.colorConfidenceScore,
    },
    
    typography: report.typography,
    brandVoice: report.brandVoice,
    strategicAudit: report.strategicAudit,
    contentStrategy: report.contentStrategy,
    visualStyle: report.visualStyle,
    scoring: report.scoring,
    recommendations: report.recommendations || [],
    
    scanMeta: {
      scannedAt: report.scanMeta?.scannedAt || new Date().toISOString(),
      version: report.scanMeta?.version || '1.0.0',
      sourceUrl: report.scanMeta?.sourceUrl || url,
      scanId: report.scanMeta?.scanId,
      extractionMethods: report.scanMeta?.extractionMethods,
    },
    
    // Legacy fields
    brand_identity: report.brand_identity,
    brand_voice: report.brand_voice,
    vocabulary: report.vocabulary,
    strategic_audit: report.strategic_audit,
    content_strategy: report.content_strategy,
  };
}

