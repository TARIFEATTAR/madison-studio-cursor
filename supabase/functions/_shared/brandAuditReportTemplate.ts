// deno-lint-ignore-file no-explicit-any

export interface BrandAuditReport {
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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderList = (items: string[], tag = "li"): string =>
  items.map((item) => `<${tag}>${escapeHtml(item)}</${tag}>`).join("");

const renderPills = (items: string[]): string =>
  items.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("");

const renderColorPalette = (colors: { label: string; hex: string }[]): string =>
  colors
    .map(
      (color) => `
      <div class="swatch-block">
        <div class="swatch" style="background:${escapeHtml(color.hex)};"></div>
        <div class="swatch-label">${escapeHtml(color.label)}</div>
        <div class="swatch-hex">${escapeHtml(color.hex)}</div>
      </div>
    `,
    )
    .join("");

const renderImages = (images: string[]): string =>
  images
    .map(
      (img) => `
      <div class="moodboard-item" style="background-image:url('${escapeHtml(img)}');"></div>
    `,
    )
    .join("");

const renderScreenshots = (images: string[]): string =>
  images
    .map(
      (img) => `
      <div class="screenshot" style="background-image:url('${escapeHtml(img)}');"></div>
    `,
    )
    .join("");

const renderIssues = (issues: { issue: string; severity: string }[]): string =>
  issues
    .map(
      (issue) => `
      <div class="issue-item">
        <div>${escapeHtml(issue.issue)}</div>
        <div class="severity-badge">${escapeHtml(issue.severity)}</div>
      </div>
    `,
    )
    .join("");

const renderScoreInsights = (insights: string[]): string => renderList(insights);

const renderBarChart = (data: { label: string; value: number }[]): string =>
  data
    .map(
      (item) => `
    <div class="bar-row">
      <div class="bar-label">${escapeHtml(item.label)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.min(Math.max(item.value, 0), 100)}%;"></div>
      </div>
      <div>${item.value}</div>
    </div>
  `,
    )
    .join("");

const renderStrategicInitiatives = (items: { phase: string; items: string[] }[]): string =>
  items
    .map(
      (entry) => `
      <div class="card">
        <div class="card-label">Phase</div>
        <div class="card-value">${escapeHtml(entry.phase)}</div>
        <ul>${renderList(entry.items)}</ul>
      </div>
    `,
    )
    .join("");

const renderTimeline = (
  items: { phaseName: string; timeHorizon: string; actions: string[] }[],
): string =>
  items
    .map(
      (entry) => `
      <div class="timeline-item">
        <div class="timeline-phase">${escapeHtml(entry.phaseName)}</div>
        <div class="timeline-time">${escapeHtml(entry.timeHorizon)}</div>
        <ul>${renderList(entry.actions)}</ul>
      </div>
    `,
    )
    .join("");

export const renderBrandAuditReport = (report: BrandAuditReport): string => {
  const {
    coreIdentifiers,
    executiveSummaryData,
    brandIdentityDetails,
    visualLanguage,
    websiteDigitalScan,
    consistencyAndHealthScoring,
    recommendationsAndRoadmap,
    contentKnowledgeAssets,
    footerMetadata,
  } = report;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Madison Studio – Brand Audit & Identity Analysis</title>
  <style>
    :root {
      --soft-white: #FAF9F7;
      --stone-beige: #E8E4DF;
      --umber-sand: #C9B8A7;
      --aged-brass: #C29B5C;
      --deep-charcoal: #1A1A1A;
    }
    * { box-sizing: border-box; }
    body {
      margin: 60px 45px;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      background: var(--soft-white);
      color: var(--deep-charcoal);
      font-size: 13px;
      line-height: 1.6;
    }
    h1, h2, h3, h4 {
      font-family: Georgia, "Times New Roman", serif;
      color: var(--deep-charcoal);
      margin: 0 0 12px 0;
    }
    h1 { font-size: 40px; }
    h2 { font-size: 28px; margin-top: 40px; }
    h3 { font-size: 20px; margin-top: 24px; }
    h4 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.14em; margin-top: 24px; }
    p { margin: 0 0 10px 0; }
    .section { margin-bottom: 64px; }
    .section-title {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 11px;
      color: #6a6a6a;
      margin-bottom: 6px;
    }
    .brass-rule { height: 1px; background: var(--aged-brass); margin: 16px 0 24px 0; }
    .tagline {
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 8px;
    }
    .hero-quote {
      font-family: Georgia, "Times New Roman", serif;
      font-style: italic;
      font-size: 18px;
      margin-top: 20px;
    }
    .meta-grid {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 40px;
      font-size: 12px;
    }
    .two-col {
      display: grid;
      grid-template-columns: 2fr 1.1fr;
      gap: 32px;
    }
    .pull-quote {
      font-family: Georgia, "Times New Roman", serif;
      font-style: italic;
      font-size: 18px;
      border-left: 2px solid var(--aged-brass);
      padding-left: 18px;
      margin-top: 8px;
    }
    ul { margin: 6px 0 12px 0; padding-left: 18px; }
    li { margin-bottom: 4px; }
    .pill-row { margin-top: 6px; }
    .pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--stone-beige);
      font-size: 11px;
      margin: 0 6px 6px 0;
    }
    .card-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 12px;
    }
    .card {
      padding: 14px 16px;
      border-radius: 6px;
      background: var(--stone-beige);
    }
    .card-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #555;
      margin-bottom: 4px;
    }
    .card-value { font-size: 13px; }
    .color-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 10px;
    }
    .swatch-block { width: 90px; font-size: 11px; }
    .swatch {
      width: 100%;
      height: 50px;
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.06);
      margin-bottom: 6px;
    }
    .moodboard-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .moodboard-item {
      width: 100%;
      height: 90px;
      border-radius: 6px;
      background-color: var(--stone-beige);
      background-size: cover;
      background-position: center;
    }
    .screenshot-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 10px;
      margin: 10px 0 16px 0;
    }
    .screenshot {
      width: 100%;
      height: 100px;
      border-radius: 6px;
      background-color: var(--stone-beige);
      background-size: cover;
      background-position: top center;
    }
    .issue-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      border-radius: 4px;
      background: #f0ece6;
      font-size: 12px;
      margin-bottom: 6px;
    }
    .severity-badge {
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      background: var(--deep-charcoal);
      color: #fff;
    }
    .score-cards {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .score-card {
      padding: 14px 16px;
      border-radius: 6px;
      background: var(--stone-beige);
    }
    .score-label {
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 4px;
    }
    .score-value {
      font-size: 22px;
      font-weight: 600;
      font-family: Georgia, "Times New Roman", serif;
    }
    .bar-chart { margin-top: 18px; }
    .bar-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 11px;
    }
    .bar-label {
      width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bar-track {
      flex: 1;
      height: 6px;
      border-radius: 999px;
      background: #ded9d0;
      margin: 0 8px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 999px;
      background: var(--aged-brass);
    }
    .timeline {
      margin-top: 10px;
      border-left: 1px solid var(--aged-brass);
      padding-left: 16px;
    }
    .timeline-item { margin-bottom: 14px; }
    .timeline-phase {
      font-weight: 600;
      font-size: 13px;
    }
    .timeline-time {
      font-size: 11px;
      color: #666;
      margin-bottom: 4px;
    }
    .small-label {
      font-size: 11px;
      color: #666;
    }
    footer {
      margin-top: 60px;
      padding-top: 12px;
      border-top: 1px solid var(--aged-brass);
      font-size: 11px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <section class="section">
    <div class="section-title">Brand Audit</div>
    <h1>Brand Audit &amp; Identity Analysis</h1>
    <div class="tagline">${escapeHtml(coreIdentifiers.tagline)}</div>
    <p>${escapeHtml(coreIdentifiers.brandDescription)}</p>
    <div class="hero-quote">“${escapeHtml(coreIdentifiers.heroQuote)}”</div>
    <div class="brass-rule"></div>
    <div class="meta-grid">
      <div>
        <span class="small-label">Client</span><br />
        ${escapeHtml(coreIdentifiers.clientName)}
      </div>
      <div>
        <span class="small-label">Brand</span><br />
        ${escapeHtml(coreIdentifiers.brandName)}
      </div>
      <div>
        <span class="small-label">Domain</span><br />
        ${escapeHtml(coreIdentifiers.domain)}
      </div>
      <div>
        <span class="small-label">Date Generated</span><br />
        ${escapeHtml(coreIdentifiers.dateGenerated)}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-title">Overview</div>
    <h2>Executive Summary</h2>
    <div class="two-col">
      <div>
        <p>${escapeHtml(executiveSummaryData.executiveSummary)}</p>
        <h3>Top Strengths</h3>
        <ul>${renderList(executiveSummaryData.topStrengths)}</ul>
        <h3>Top Risks</h3>
        <ul>${renderList(executiveSummaryData.topRisks)}</ul>
      </div>
      <div>
        <div class="pull-quote">“${escapeHtml(executiveSummaryData.pullQuote)}”</div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-title">Identity</div>
    <h2>Brand Identity</h2>
    <h3>Mission</h3>
    <p>${escapeHtml(brandIdentityDetails.mission)}</p>
    <h3>Vision</h3>
    <p>${escapeHtml(brandIdentityDetails.vision)}</p>
    <h3>Positioning Statement</h3>
    <p>${escapeHtml(brandIdentityDetails.positioningStatement)}</p>
    <div class="card-row">
      <div class="card">
        <div class="card-label">Brand Archetype</div>
        <div class="card-value">${escapeHtml(brandIdentityDetails.brandArchetype)}</div>
      </div>
      <div class="card">
        <div class="card-label">Primary Audience</div>
        <div class="card-value">${renderList(brandIdentityDetails.primaryAudience, "div")}</div>
      </div>
      <div class="card">
        <div class="card-label">Tone Traits</div>
        <div class="pill-row">${renderPills(brandIdentityDetails.toneTraits)}</div>
      </div>
    </div>
    <h3>Brand Values</h3>
    <div class="pill-row">${renderPills(brandIdentityDetails.brandValues)}</div>
    <h3>Voice &amp; Essence</h3>
    <p>${escapeHtml(brandIdentityDetails.voiceDescription)}</p>
  </section>

  <section class="section">
    <div class="section-title">Visual System</div>
    <h2>Visual Language</h2>
    <h3>Color Palette</h3>
    <div class="color-row">${renderColorPalette(visualLanguage.colorPalette)}</div>
    <h3>Typography</h3>
    <p><strong>Headline Font:</strong> ${escapeHtml(visualLanguage.typography.headlineFont)}</p>
    <p><strong>Body Font:</strong> ${escapeHtml(visualLanguage.typography.bodyFont)}</p>
    <p>${escapeHtml(visualLanguage.typography.usageNotes)}</p>
    <h3>Moodboard</h3>
    <div class="moodboard-grid">${renderImages(visualLanguage.moodboardImages)}</div>
    <h3>Iconography Style</h3>
    <p>${escapeHtml(visualLanguage.iconographyStyle)}</p>
  </section>

  <section class="section">
    <div class="section-title">Digital</div>
    <h2>Website &amp; Digital Presence</h2>
    <h3>Captured Screens</h3>
    <div class="screenshot-row">${renderScreenshots(websiteDigitalScan.websiteScreenshots)}</div>
    <h3>Findings</h3>
    <p>${escapeHtml(websiteDigitalScan.websiteFindings)}</p>
    <h3>Content Observations</h3>
    <ul>${renderList(websiteDigitalScan.contentObservations)}</ul>
    <h3>Priority Issues</h3>
    <div class="issue-row">${renderIssues(websiteDigitalScan.priorityIssues)}</div>
  </section>

  <section class="section">
    <div class="section-title">Scoring</div>
    <h2>Consistency &amp; Health</h2>
    <div class="score-cards">
      <div class="score-card">
        <div class="score-label">Brand Consistency</div>
        <div class="score-value">${consistencyAndHealthScoring.brandConsistencyScore}</div>
      </div>
      <div class="score-card">
        <div class="score-label">Visual Consistency</div>
        <div class="score-value">${consistencyAndHealthScoring.visualConsistencyScore}</div>
      </div>
      <div class="score-card">
        <div class="score-label">Message Clarity</div>
        <div class="score-value">${consistencyAndHealthScoring.messageClarityScore}</div>
      </div>
      <div class="score-card">
        <div class="score-label">Overall Score</div>
        <div class="score-value">${consistencyAndHealthScoring.overallScore}</div>
      </div>
    </div>
    <div class="bar-chart">${renderBarChart(consistencyAndHealthScoring.chartData)}</div>
    <h3>Score Insights</h3>
    <h4>Brand Consistency</h4>
    <ul>${renderScoreInsights(consistencyAndHealthScoring.scoreInsights.brandConsistency)}</ul>
    <h4>Visual Consistency</h4>
    <ul>${renderScoreInsights(consistencyAndHealthScoring.scoreInsights.visualConsistency)}</ul>
    <h4>Message Clarity</h4>
    <ul>${renderScoreInsights(consistencyAndHealthScoring.scoreInsights.messageClarity)}</ul>
  </section>

  <section class="section">
    <div class="section-title">Direction</div>
    <h2>Recommendations &amp; Roadmap</h2>
    <h3>Quick Wins</h3>
    <ol>${renderList(recommendationsAndRoadmap.quickWins, "li")}</ol>
    <h3>Strategic Initiatives</h3>
    <div class="card-row">${renderStrategicInitiatives(recommendationsAndRoadmap.strategicInitiatives)}</div>
    <h3>Roadmap Timeline</h3>
    <div class="timeline">${renderTimeline(recommendationsAndRoadmap.roadmapTimeline)}</div>
    <h3>Narrative</h3>
    <p>${escapeHtml(recommendationsAndRoadmap.recommendationNarrative)}</p>
  </section>

  <section class="section">
    <div class="section-title">Knowledge</div>
    <h2>Content &amp; Knowledge Assets</h2>
    <h3>Documents Analyzed</h3>
    <ul>${renderList(contentKnowledgeAssets.documentsAnalyzed)}</ul>
    <h3>Content Gaps</h3>
    <ul>${renderList(contentKnowledgeAssets.contentGaps)}</ul>
    <div class="card-row">
      <div class="card">
        <div class="card-label">Essential Five Status</div>
        <div class="card-value">${escapeHtml(contentKnowledgeAssets.essentialFiveStatus)}</div>
      </div>
      <div class="card">
        <div class="card-label">AI Readiness</div>
        <div class="card-value">${escapeHtml(contentKnowledgeAssets.aiReadiness)}</div>
      </div>
      <div class="card">
        <div class="card-label">Brand Health</div>
        <div class="card-value">${escapeHtml(contentKnowledgeAssets.brandHealthStatus)}</div>
      </div>
    </div>
  </section>

  <footer>
    <div>
      ${escapeHtml(footerMetadata.preparedBy)}<br />
      <span class="small-label">${escapeHtml(footerMetadata.disclaimer)}</span>
    </div>
    <div>
      <span class="small-label">${escapeHtml(footerMetadata.nextSteps)}</span><br />
      <span>${escapeHtml(footerMetadata.pageNumber)}</span>
    </div>
  </footer>
</body>
</html>
`;
};

