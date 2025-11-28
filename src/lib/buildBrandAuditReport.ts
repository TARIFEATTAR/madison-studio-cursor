import { BrandReport } from "@/types/brandReport";

export interface BrandAuditReportPayload {
  coreIdentifiers: {
    clientName: string;
    brandName: string;
    domain: string;
    dateGenerated: string;
    logoUrl: string;
    tagline: string;
    brandDescription: string;
    heroQuote: string;
  };
  executiveSummaryData: {
    executiveSummary: string;
    topStrengths: string[];
    topRisks: string[];
    pullQuote: string;
  };
  brandIdentityDetails: {
    brandValues: string[];
    mission: string;
    vision: string;
    positioningStatement: string;
    brandArchetype: string;
    primaryAudience: string[];
    toneTraits: string[];
    voiceDescription: string;
  };
  visualLanguage: {
    colorPalette: { label: string; hex: string }[];
    typography: {
      headlineFont: string;
      bodyFont: string;
      usageNotes: string;
    };
    logoVariations: string[];
    moodboardImages: string[];
    iconographyStyle: string;
  };
  websiteDigitalScan: {
    websiteScreenshots: string[];
    websiteFindings: string;
    contentObservations: string[];
    priorityIssues: { issue: string; severity: string }[];
  };
  consistencyAndHealthScoring: {
    brandConsistencyScore: number;
    visualConsistencyScore: number;
    messageClarityScore: number;
    overallScore: number;
    scoreInsights: {
      brandConsistency: string[];
      visualConsistency: string[];
      messageClarity: string[];
    };
    chartData: { label: string; value: number }[];
  };
  recommendationsAndRoadmap: {
    quickWins: string[];
    strategicInitiatives: { phase: string; items: string[] }[];
    roadmapTimeline: { phaseName: string; timeHorizon: string; actions: string[] }[];
    recommendationNarrative: string;
  };
  contentKnowledgeAssets: {
    documentsAnalyzed: string[];
    contentGaps: string[];
    essentialFiveStatus: string;
    aiReadiness: string;
    brandHealthStatus: string;
  };
  footerMetadata: {
    preparedBy: string;
    pageNumber: string;
    disclaimer: string;
    nextSteps: string;
  };
}

const uniqueColors = (...groups: (string[] | undefined)[]) => {
  const set = new Set<string>();
  groups.forEach((group) => {
    group?.forEach((hex) => {
      if (hex) set.add(hex);
    });
  });
  return Array.from(set).slice(0, 5);
};

const fallbackList = (value?: string[] | null) => (value && value.length ? value : []);

export const buildBrandAuditReport = (
  report: BrandReport,
  options: { clientName: string; domain: string },
): BrandAuditReportPayload => {
  const brandName = report.brandProfile.brandName || options.domain;
  const tagline = report.brandProfile.tagline || "Crafted for consistency.";
  const heroQuote =
    report.brandProfile.essence ||
    report.brandProfile.positioning ||
    "Translating heritage into modern luxury.";
  const description =
    report.brandProfile.positioning ||
    "A Madison Studio brand partner undergoing a comprehensive audit.";

  const colors = uniqueColors(report.colors.primary, report.colors.secondary, report.colors.neutrals);
  const colorPalette = colors.map((hex, index) => ({
    label: `Color ${index + 1}`,
    hex,
  }));

  const typography = report.typography || {};

  const websiteScreenshots = report.site.screenshotUrl ? [report.site.screenshotUrl] : [];

  const scoring = report.scoring || {};

  const recommendations = report.recommendations || [];

  return {
    coreIdentifiers: {
      clientName: options.clientName || brandName || "Brand Partner",
      brandName,
      domain: options.domain,
      dateGenerated: new Date().toISOString().split("T")[0],
      logoUrl: report.site.logoUrl || "",
      tagline,
      brandDescription: description,
      heroQuote,
    },
    executiveSummaryData: {
      executiveSummary:
        report.strategicAudit?.summary ||
        "This report surfaces key opportunities to refine messaging, unify visuals, and strengthen strategic clarity.",
      topStrengths: fallbackList(report.strategicAudit?.strengths),
      topRisks: fallbackList(report.strategicAudit?.weaknesses),
      pullQuote:
        report.brandProfile.essence ||
        "The brand carries emotional depth, but must articulate its purpose more boldly.",
    },
    brandIdentityDetails: {
      brandValues: fallbackList(report.brandProfile.values),
      mission: report.brandProfile.mission || "Mission statement not yet defined.",
      vision: "Vision statement coming soon.",
      positioningStatement:
        report.brandProfile.positioning ||
        "Positioning statement in development. Madison Studio recommends defining a concise articulation of value.",
      brandArchetype: report.brandProfile.archetype || "Unspecified",
      primaryAudience: fallbackList(report.brandProfile.primaryAudience),
      toneTraits: fallbackList(report.brandProfile.toneTraits),
      voiceDescription:
        report.brandVoice?.style ||
        report.brandVoice?.perspective ||
        "Voice attributes pending. Consider codifying brand narrative pillars.",
    },
    visualLanguage: {
      colorPalette: colorPalette.length
        ? colorPalette
        : [
          { label: "Soft White", hex: "#FAF9F7" },
          { label: "Stone Beige", hex: "#E8E4DF" },
          { label: "Umber Sand", hex: "#C9B8A7" },
          { label: "Aged Brass", hex: "#C29B5C" },
          { label: "Deep Charcoal", hex: "#1A1A1A" },
        ],
      typography: {
        headlineFont: typography.headlineFont || typography.primaryFont || "Georgia",
        bodyFont: typography.bodyFont || typography.secondaryFont || "Inter",
        usageNotes:
          typography.headlineFont || typography.bodyFont
            ? "Headlines use the primary serif. Body copy leverages the sans-serif system font for clarity."
            : "Typography system pending. Madison Studio recommends defining a serif/sans pairing for hierarchy.",
      },
      logoVariations: report.site.altLogos || [],
      moodboardImages: fallbackList(report.visualStyle?.imagery?.subjects),
      iconographyStyle: report.visualStyle?.imagery?.style || "Minimalist line-based symbols.",
    },
    websiteDigitalScan: {
      websiteScreenshots,
      websiteFindings:
        report.strategicAudit?.opportunities?.join(" ") ||
        "Website maintains aesthetic coherence but needs clearer narrative flow and stronger CTAs.",
      contentObservations: fallbackList(report.brandVoice?.vocabulary?.phrases),
      priorityIssues: (report.recommendations || [])
        .filter((rec) => rec.priority === "high")
        .map((rec) => ({
          issue: rec.title,
          severity: rec.priority || "High",
        })),
    },
    consistencyAndHealthScoring: {
      brandConsistencyScore: scoring.brandConsistency || 0,
      visualConsistencyScore: scoring.visualConsistency || 0,
      messageClarityScore: scoring.messageClarity || 0,
      overallScore: scoring.overallScore || 0,
      scoreInsights: {
        brandConsistency: fallbackList(report.strategicAudit?.strengths),
        visualConsistency: fallbackList(report.visualStyle?.imagery?.subjects),
        messageClarity: fallbackList(report.strategicAudit?.weaknesses),
      },
      chartData: [
        { label: "Brand Consistency", value: scoring.brandConsistency || 0 },
        { label: "Visual Consistency", value: scoring.visualConsistency || 0 },
        { label: "Message Clarity", value: scoring.messageClarity || 0 },
      ],
    },
    recommendationsAndRoadmap: {
      quickWins: recommendations.filter((rec) => rec.priority === "high").map((rec) => rec.title),
      strategicInitiatives: recommendations.length
        ? [
          {
            phase: "Phase I",
            items: recommendations.slice(0, 3).map((rec) => rec.title),
          },
        ]
        : [],
      roadmapTimeline: recommendations.length
        ? [
          {
            phaseName: "Foundation",
            timeHorizon: "0–30 days",
            actions: recommendations.slice(0, 3).map((rec) => rec.description || rec.title),
          },
        ]
        : [],
      recommendationNarrative:
        report.strategicAudit?.summary ||
        "Madison Studio recommends aligning messaging, tightening visual governance, and documenting a living brand system.",
    },
    contentKnowledgeAssets: {
      documentsAnalyzed: [],
      contentGaps: fallbackList(report.vocabulary?.forbidden_inferred),
      essentialFiveStatus: "Pending",
      aiReadiness: "Pending",
      brandHealthStatus: scoring.overallScore ? (scoring.overallScore > 80 ? "Excellent" : "Developing") : "TBD",
    },
    footerMetadata: {
      preparedBy: "Madison Studio",
      pageNumber: "{{pageNumber}}",
      disclaimer: "Auto-generated from available brand data.",
      nextSteps: "Schedule a strategy session with Madison Studio.",
    },
  };
};

