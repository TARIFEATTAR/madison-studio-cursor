import { BrandReport } from "@/types/brandReport";
import { Tables } from "@/integrations/supabase/types";

type OrganizationRow = Tables<"organizations">;
type BrandKnowledgeRow = Tables<"brand_knowledge">;
type BrandDocumentRow = Tables<"brand_documents">;
type BrandHealthRow = Tables<"brand_health">;

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
  brandAssets: Array<{
    fileName: string;
    fileType: string;
    fileUrl?: string | null;
    uploadedAt?: string | null;
    contentPreview?: string | null;
  }>;
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

const toArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : typeof item === "object" && item?.name ? String(item.name).trim() : String(item ?? "").trim()))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,•]+/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0);
  }
  if (typeof value === "object") {
    if ("list" in value && Array.isArray(value.list)) {
      return toArray(value.list);
    }
    return Object.values(value)
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  return [];
};

const firstString = (...values: Array<any>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
};

const firstArray = (...values: Array<any>) => {
  for (const value of values) {
    const arr = toArray(value);
    if (arr.length > 0) return arr;
  }
  return [];
};

const calculateCoverageScore = (signals: boolean[]) => {
  if (!signals.length) return 0;
  const positive = signals.filter(Boolean).length;
  return Math.round((positive / signals.length) * 100);
};

const mapPriorityToPhase = (priority?: string) => {
  switch ((priority || "").toLowerCase()) {
    case "high":
      return "Phase I";
    case "medium":
      return "Phase II";
    case "low":
      return "Phase III";
    default:
      return "Future Backlog";
  }
};

export const buildBrandAuditReport = (
  report: BrandReport,
  options: {
    clientName: string;
    domain: string;
    organization?: OrganizationRow | null;
    knowledge?: BrandKnowledgeRow[];
    documents?: BrandDocumentRow[];
    brandHealth?: BrandHealthRow | null;
  },
): BrandAuditReportPayload => {
  const knowledgeMap: Record<string, any> = {};
  options.knowledge?.forEach((entry) => {
    knowledgeMap[entry.knowledge_type] = entry.content || {};
  });

  const brandConfig = (options.organization?.brand_config || {}) as Record<string, any>;
  const brandSettings = (options.organization?.settings || {}) as Record<string, any>;
  const brandName = firstString(brandConfig.brandName, report.brandProfile.brandName, options.domain) || options.domain;
  const tagline =
    firstString(brandConfig.tagline, report.brandProfile.tagline, knowledgeMap.brand_dna_scan?.brandEssence) ||
    "Crafted for consistency.";
  const heroQuote =
    firstString(
      knowledgeMap.brand_dna_scan?.brandEssence,
      knowledgeMap.brand_voice?.signature_phrase,
      report.brandProfile.essence,
      report.brandProfile.positioning,
    ) || "Translating heritage into modern luxury.";
  const description =
    firstString(
      brandConfig.description,
      knowledgeMap.brand_dna_scan?.brandMission,
      knowledgeMap.core_identity?.description,
      report.brandProfile.positioning,
    ) || "A Madison Studio brand partner undergoing a comprehensive audit.";

  const colors = uniqueColors(report.colors.primary, report.colors.secondary, report.colors.neutrals);
  const colorPaletteFromScan = colors.map((hex, index) => ({
    label: `Color ${index + 1}`,
    hex,
  }));

  const knowledgeColorPalette = Array.isArray(knowledgeMap.visual_standards?.colors)
    ? knowledgeMap.visual_standards.colors
        .map((color: any, index: number) => ({
          label: color.name || color.usage || `Color ${index + 1}`,
          hex: color.hex || color.value || color.color || "",
        }))
        .filter((color: { label: string; hex: string }) => !!color.hex)
    : Array.isArray(knowledgeMap.brand_dna_scan?.colorPalette)
      ? knowledgeMap.brand_dna_scan.colorPalette
          .map((color: any, index: number) => ({
            label: color.name || color.usage || `Color ${index + 1}`,
            hex: color.hex || "",
          }))
          .filter((color: { label: string; hex: string }) => !!color.hex)
      : [];

  const finalColorPalette = knowledgeColorPalette.length ? knowledgeColorPalette : colorPaletteFromScan;

  const typography = {
    headlineFont:
      firstString(
        knowledgeMap.visual_standards?.typography?.headline?.name,
        knowledgeMap.visual_standards?.typography?.headline,
        knowledgeMap.brand_dna_scan?.fonts?.headline,
        report.typography?.headlineFont,
        report.typography?.primaryFont,
      ) || "Playfair Display",
    bodyFont:
      firstString(
        knowledgeMap.visual_standards?.typography?.body?.name,
        knowledgeMap.visual_standards?.typography?.body,
        knowledgeMap.brand_dna_scan?.fonts?.body,
        report.typography?.bodyFont,
        report.typography?.secondaryFont,
      ) || "Inter",
    usageNotes:
      firstString(
        knowledgeMap.visual_standards?.typography?.usage_notes,
        report.typography?.usageNotes,
        "Headlines use the primary serif. Body copy leverages the sans-serif system font for clarity.",
      ) || "Headlines use the primary serif. Body copy leverages the sans-serif system font for clarity.",
  };

  const mission = firstString(
    knowledgeMap.core_identity?.mission,
    knowledgeMap.brand_dna_scan?.brandMission,
    brandConfig.mission,
    report.brandProfile.mission,
  ) || "Mission statement not yet defined.";

  const vision = firstString(
    knowledgeMap.core_identity?.vision,
    brandConfig.vision,
    knowledgeMap.brand_dna_scan?.brandVision,
    report.brandProfile?.positioning,
  ) || "Vision statement coming soon.";

  const brandValues = firstArray(
    knowledgeMap.core_identity?.values,
    knowledgeMap.brand_dna_scan?.brandEssence,
    brandConfig.values,
    report.brandProfile.values,
  );

  const primaryAudience = firstArray(
    knowledgeMap.target_audience?.segments,
    knowledgeMap.brand_voice?.target_audience,
    brandSettings?.target_audience,
    report.brandProfile.primaryAudience,
  );

  const toneTraits = firstArray(
    knowledgeMap.brand_voice?.toneAttributes,
    knowledgeMap.voice_tone?.tone_spectrum,
    knowledgeMap.brand_dna_scan?.brandEssence,
    report.brandProfile.toneTraits,
  );

  const voiceDescription = firstString(
    knowledgeMap.brand_voice?.voice_guidelines,
    knowledgeMap.voice_tone?.voice_guidelines,
    report.brandVoice?.style,
    report.brandVoice?.perspective,
  ) || "Voice attributes pending. Consider codifying brand narrative pillars.";

  const websiteScreenshots = [
    ...(report.site.screenshotUrl ? [report.site.screenshotUrl] : []),
    ...(options.documents
      ?.filter((doc) => doc.file_url && doc.file_type?.startsWith("image/"))
      .slice(0, 4)
      .map((doc) => doc.file_url as string) || []),
  ];

  const scoring = report.scoring || {};

  const recommendations = options.brandHealth?.recommendations || report.recommendations || [];

  const brandHealthQuickWins = (options.brandHealth?.gap_analysis as Record<string, any> | null)?.quick_wins || [];

  const brandHealthMissing = (options.brandHealth?.gap_analysis as Record<string, any> | null)?.missing_components || [];

  const brandHealthIncomplete = (options.brandHealth?.gap_analysis as Record<string, any> | null)?.incomplete_areas || [];

  const brandHealthStrengths = (options.brandHealth?.gap_analysis as Record<string, any> | null)?.strengths || [];

  const documentSummaries =
    options.documents?.map((doc) => `${doc.file_name} (${doc.file_type.toUpperCase()})`) || [];

  const brandAssets = (options.documents || []).slice(0, 8).map((doc) => ({
    fileName: doc.file_name,
    fileType: doc.file_type,
    fileUrl: doc.file_url,
    uploadedAt: doc.created_at,
    contentPreview: doc.content_preview,
  }));

  const knowledgeCount = options.knowledge?.length || 0;
  const essentialFiveStatus =
    knowledgeCount >= 5
      ? "Core Foundation Completed"
      : knowledgeCount >= 3
        ? "In Progress"
        : "Needs Manual Inputs";
  const aiReadiness = knowledgeCount >= 8 ? "High" : knowledgeCount >= 4 ? "Moderate" : "Low";

  const brandHealthStatus = options.brandHealth?.completeness_score
    ? `${options.brandHealth.completeness_score}%`
    : scoring.overallScore
      ? `${scoring.overallScore}%`
      : "Pending";

  const brandConsistencySignals = [
    !!mission && mission !== "Mission statement not yet defined.",
    brandValues.length > 0,
    primaryAudience.length > 0,
    toneTraits.length > 0,
  ];

  const visualConsistencySignals = [
    finalColorPalette.length >= 3,
    !!typography.headlineFont,
    !!typography.bodyFont,
    !!report.site.logoUrl || !!knowledgeMap.visual_standards?.logo,
  ];

  const messageClaritySignals = [
    voiceDescription !== "Voice attributes pending. Consider codifying brand narrative pillars.",
    brandHealthStrengths.length > 0 || fallbackList(report.strategicAudit?.strengths).length > 0,
    brandHealthIncomplete.length > 0 || brandHealthMissing.length > 0 || fallbackList(report.strategicAudit?.weaknesses).length > 0,
    toneTraits.length > 0,
  ];

  const derivedBrandConsistencyScore = calculateCoverageScore(brandConsistencySignals);
  const derivedVisualConsistencyScore = calculateCoverageScore(visualConsistencySignals);
  const derivedMessageClarityScore = calculateCoverageScore(messageClaritySignals);

  const overallScore =
    options.brandHealth?.completeness_score ??
    scoring.overallScore ??
    Math.round((derivedBrandConsistencyScore + derivedVisualConsistencyScore + derivedMessageClarityScore) / 3);

  const summaryText =
    options.brandHealth?.gap_analysis?.narrative ||
    report.strategicAudit?.summary ||
    "This report surfaces key opportunities to refine messaging, unify visuals, and strengthen strategic clarity.";
  const summaryStrengths =
    brandHealthStrengths.length > 0 ? brandHealthStrengths : fallbackList(report.strategicAudit?.strengths);
  const summaryRisks =
    brandHealthIncomplete.length > 0 ? brandHealthIncomplete : fallbackList(report.strategicAudit?.weaknesses);
  const websiteFindings =
    firstString(
      (options.brandHealth?.gap_analysis as Record<string, any>)?.findings,
      report.strategicAudit?.opportunities?.join(" "),
    ) || "Website maintains aesthetic coherence but needs clearer narrative flow and stronger CTAs.";
  const contentObservations = firstArray(
    knowledgeMap.brand_voice?.vocabulary?.keywords,
    knowledgeMap.brand_voice?.approved_terms,
    report.brandVoice?.vocabulary?.keywords,
  );
  const priorityIssues = [...brandHealthMissing, ...brandHealthIncomplete].map((issue) => ({
    issue,
    severity: "High",
  }));
  const quickWins =
    brandHealthQuickWins.length > 0
      ? brandHealthQuickWins
      : recommendations
          .filter((rec: any) => rec.priority === "high")
          .map((rec: any) => rec.title || rec.description || "High priority initiative");

  const groupedInitiatives: Record<string, string[]> = {};
  (recommendations as any[]).forEach((rec) => {
    const phase = mapPriorityToPhase(rec?.priority);
    if (!groupedInitiatives[phase]) groupedInitiatives[phase] = [];
    groupedInitiatives[phase].push(rec.title || rec.description || "Strategic initiative");
  });
  const strategicInitiatives = Object.entries(groupedInitiatives).map(([phase, items]) => ({ phase, items }));

  const roadmapTimeline =
    (recommendations as any[]).length > 0
      ? (recommendations as any[]).slice(0, 5).map((rec, index) => ({
          phaseName: rec.category ? rec.category.replace(/_/g, " ") : `Recommendation ${index + 1}`,
          timeHorizon:
            rec.priority === "high" ? "0–30 days" : rec.priority === "medium" ? "30–60 days" : "60–90 days",
          actions: [rec.description || rec.title || "Implement recommendation"],
        }))
      : [];

  const recommendationNarrative =
    firstString(
      (options.brandHealth?.gap_analysis as Record<string, any>)?.narrative,
      report.strategicAudit?.summary,
      "Madison Studio recommends aligning messaging, tightening visual governance, and documenting a living brand system.",
    ) || "Madison Studio recommends aligning messaging, tightening visual governance, and documenting a living brand system.";

  const scoreInsights = {
    brandConsistency: summaryStrengths.length > 0 ? summaryStrengths : ["Core identity documentation pending"],
    visualConsistency:
      finalColorPalette.length > 0
        ? finalColorPalette.map((palette) => `${palette.label}: ${palette.hex}`)
        : ["Color palette extraction pending"],
    messageClarity:
      summaryRisks.length > 0
        ? summaryRisks
        : brandHealthMissing.length > 0
          ? brandHealthMissing
          : ["Messaging refinement opportunities pending analysis"],
  };

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
      executiveSummary: summaryText,
      topStrengths: summaryStrengths,
      topRisks: summaryRisks,
      pullQuote: heroQuote,
    },
    brandIdentityDetails: {
      brandValues: brandValues.length ? brandValues : ["Not yet captured"],
      mission,
      vision,
      positioningStatement:
        firstString(
          brandConfig.positioning,
          knowledgeMap.brand_dna_scan?.brandEssence,
          report.brandProfile.positioning,
        ) || "Positioning statement in development. Madison Studio recommends defining a concise articulation of value.",
      brandArchetype:
        firstString(knowledgeMap.core_identity?.archetype, knowledgeMap.brand_dna_scan?.archetype, report.brandProfile.archetype) ||
        "Unspecified",
      primaryAudience: primaryAudience.length ? primaryAudience : ["Audience definition pending"],
      toneTraits: toneTraits.length ? toneTraits : ["Tone traits pending definition"],
      voiceDescription,
    },
    visualLanguage: {
      colorPalette:
        finalColorPalette.length > 0
          ? finalColorPalette
          : [
              { label: "Soft White", hex: "#FAF9F7" },
              { label: "Stone Beige", hex: "#E8E4DF" },
              { label: "Umber Sand", hex: "#C9B8A7" },
              { label: "Aged Brass", hex: "#C29B5C" },
              { label: "Deep Charcoal", hex: "#1A1A1A" },
            ],
      typography,
      logoVariations: report.site.altLogos || [],
      moodboardImages: firstArray(knowledgeMap.visual_standards?.imagery?.subjects, report.visualStyle?.imagery?.subjects),
      iconographyStyle:
        firstString(
          knowledgeMap.visual_standards?.iconography,
          knowledgeMap.visual_standards?.logo_guidelines,
          report.visualStyle?.imagery?.style,
        ) || "Minimalist line-based symbols.",
    },
    websiteDigitalScan: {
      websiteScreenshots,
      websiteFindings,
      contentObservations: contentObservations.length ? contentObservations : fallbackList(report.brandVoice?.vocabulary?.phrases),
      priorityIssues: priorityIssues.length
        ? priorityIssues
        : (report.recommendations || [])
            .filter((rec) => rec.priority === "high")
            .map((rec) => ({
              issue: rec.title,
              severity: rec.priority || "High",
            })),
    },
    consistencyAndHealthScoring: {
      brandConsistencyScore: scoring.brandConsistency || derivedBrandConsistencyScore,
      visualConsistencyScore: scoring.visualConsistency || derivedVisualConsistencyScore,
      messageClarityScore: scoring.messageClarity || derivedMessageClarityScore,
      overallScore,
      scoreInsights,
      chartData: [
        { label: "Brand Consistency", value: scoring.brandConsistency || derivedBrandConsistencyScore },
        { label: "Visual Consistency", value: scoring.visualConsistency || derivedVisualConsistencyScore },
        { label: "Message Clarity", value: scoring.messageClarity || derivedMessageClarityScore },
      ],
    },
    recommendationsAndRoadmap: {
      quickWins: quickWins.length ? quickWins : ["Run brand health analysis to unlock quick wins."],
      strategicInitiatives: strategicInitiatives.length
        ? strategicInitiatives
        : [
            {
              phase: "Phase I",
              items: recommendations.slice(0, 3).map((rec: any) => rec.title || rec.description || "Document gaps"),
            },
          ],
      roadmapTimeline,
      recommendationNarrative,
    },
    contentKnowledgeAssets: {
      documentsAnalyzed: documentSummaries.length ? documentSummaries : ["No documents uploaded yet."],
      contentGaps:
        brandHealthMissing.length > 0
          ? brandHealthMissing
          : fallbackList(report.vocabulary?.forbidden_inferred) || ["Document core positioning, voice, and products."],
      essentialFiveStatus,
      aiReadiness,
      brandHealthStatus,
    },
    brandAssets,
    footerMetadata: {
      preparedBy: "Madison Studio",
      pageNumber: "{{pageNumber}}",
      disclaimer: "Auto-generated from available brand data.",
      nextSteps: "Schedule a strategy session with Madison Studio.",
    },
  };
};

