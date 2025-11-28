/**
 * Site Copy Extractor
 * 
 * Extracts visible text content from website pages for LLM analysis.
 * Crawls homepage, About page, and main product/service pages.
 */

export interface SiteCopy {
  homepage: {
    text: string;
    headings: string[];
    metaDescription?: string;
    title?: string;
  };
  aboutPage?: {
    text: string;
    headings: string[];
    url: string;
  };
  productPage?: {
    text: string;
    headings: string[];
    url: string;
  };
  allText: string; // Combined text for LLM analysis
  totalLength: number;
}

/**
 * Extract site copy from a URL
 * @param url - Website URL to extract from
 * @returns SiteCopy object with extracted text
 */
export async function fetchSiteCopy(url: string): Promise<SiteCopy> {
  const normalizedUrl = normalizeUrl(url);
  const baseUrl = new URL(normalizedUrl).origin;
  
  console.log(`[siteCopy] Extracting copy from: ${normalizedUrl}`);
  
  const result: SiteCopy = {
    homepage: {
      text: '',
      headings: [],
    },
    allText: '',
    totalLength: 0,
  };
  
  try {
    // 1. Fetch homepage
    const homepageContent = await fetchPageContent(normalizedUrl);
    result.homepage = {
      text: homepageContent.text,
      headings: homepageContent.headings,
      metaDescription: homepageContent.metaDescription,
      title: homepageContent.title,
      html: homepageContent.html, // Include HTML for CSS parsing
    };
    result.allText = homepageContent.text;
    
    // 2. Find and fetch About page
    try {
      const aboutUrl = await findAboutPage(normalizedUrl, homepageContent.html);
      if (aboutUrl) {
        const aboutContent = await fetchPageContent(aboutUrl);
        result.aboutPage = {
          text: aboutContent.text,
          headings: aboutContent.headings,
          url: aboutUrl,
        };
        result.allText += '\n\n--- ABOUT PAGE ---\n\n' + aboutContent.text;
      }
    } catch (error) {
      console.warn('[siteCopy] Failed to fetch About page:', error);
    }
    
    // 3. Find and fetch a product/service page
    try {
      const productUrl = await findProductPage(normalizedUrl, homepageContent.html);
      if (productUrl) {
        const productContent = await fetchPageContent(productUrl);
        result.productPage = {
          text: productContent.text,
          headings: productContent.headings,
          url: productUrl,
        };
        result.allText += '\n\n--- PRODUCT/SERVICE PAGE ---\n\n' + productContent.text;
      }
    } catch (error) {
      console.warn('[siteCopy] Failed to fetch product page:', error);
    }
    
    // Limit total text length (for LLM processing)
    const maxLength = 15000;
    if (result.allText.length > maxLength) {
      result.allText = result.allText.substring(0, maxLength) + '...';
    }
    
    result.totalLength = result.allText.length;
    console.log(`[siteCopy] Extracted ${result.totalLength} characters of text`);
    
    return result;
  } catch (error) {
    console.error('[siteCopy] Error extracting site copy:', error);
    throw new Error(`Failed to extract site copy: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Normalize URL
 */
function normalizeUrl(url: string): string {
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

/**
 * Fetch page content and extract text
 */
async function fetchPageContent(url: string): Promise<{
  text: string;
  headings: string[];
  html: string;
  metaDescription?: string;
  title?: string;
}> {
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const html = await response.text();
  
  // Extract text content
  const text = extractTextFromHtml(html);
  
  // Extract headings
  const headings = extractHeadings(html);
  
  // Extract meta description
  const metaDescriptionMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const metaDescription = metaDescriptionMatch ? metaDescriptionMatch[1] : undefined;
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;
  
  return {
    text,
    headings,
    html,
    metaDescription,
    title,
  };
}

/**
 * Extract visible text from HTML
 */
function extractTextFromHtml(html: string): string {
  // Remove scripts and styles
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  
  // Extract text from common content containers
  const contentSelectors = [
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<section[^>]*>([\s\S]*?)<\/section>/gi,
    /<div[^>]*class=["'][^"']*(?:content|main|body|text)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
  ];
  
  let extractedText = '';
  for (const selector of contentSelectors) {
    let match;
    while ((match = selector.exec(text)) !== null) {
      extractedText += match[1] + '\n\n';
    }
  }
  
  // If no content found, extract from body
  if (!extractedText) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      extractedText = bodyMatch[1];
    } else {
      extractedText = html;
    }
  }
  
  // Remove HTML tags
  extractedText = extractedText.replace(/<[^>]+>/g, ' ');
  
  // Clean up whitespace
  extractedText = extractedText
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
  
  // Limit length
  return extractedText.substring(0, 10000);
}

/**
 * Extract headings from HTML
 */
function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const headingRegex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi;
  let match;
  
  while ((match = headingRegex.exec(html)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 0) {
      headings.push(text);
    }
  }
  
  return headings.slice(0, 20); // Limit to 20 headings
}

/**
 * Find About page URL
 */
async function findAboutPage(baseUrl: string, html: string): Promise<string | null> {
  const aboutPatterns = [
    /href=["']([^"']*\/about[^"']*)["']/gi,
    /href=["']([^"']*\/about-us[^"']*)["']/gi,
    /href=["']([^"']*\/company[^"']*)["']/gi,
    /href=["']([^"']*\/our-story[^"']*)["']/gi,
    /href=["']([^"']*\/who-we-are[^"']*)["']/gi,
  ];
  
  for (const pattern of aboutPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      
      // Resolve relative URLs
      if (url.startsWith('/')) {
        url = new URL(baseUrl).origin + url;
      } else if (!url.startsWith('http')) {
        url = new URL(url, baseUrl).href;
      }
      
      // Only return if it's from the same domain
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        if (urlObj.hostname === baseObj.hostname || urlObj.hostname.replace('www.', '') === baseObj.hostname.replace('www.', '')) {
          return url;
        }
      } catch {
        continue;
      }
    }
  }
  
  return null;
}

/**
 * Find product/service page URL
 */
async function findProductPage(baseUrl: string, html: string): Promise<string | null> {
  const productPatterns = [
    /href=["']([^"']*\/products?[^"']*)["']/gi,
    /href=["']([^"']*\/shop[^"']*)["']/gi,
    /href=["']([^"']*\/services?[^"']*)["']/gi,
    /href=["']([^"']*\/collection[^"']*)["']/gi,
  ];
  
  for (const pattern of productPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      
      // Resolve relative URLs
      if (url.startsWith('/')) {
        url = new URL(baseUrl).origin + url;
      } else if (!url.startsWith('http')) {
        url = new URL(url, baseUrl).href;
      }
      
      // Only return if it's from the same domain
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        if (urlObj.hostname === baseObj.hostname || urlObj.hostname.replace('www.', '') === baseObj.hostname.replace('www.', '')) {
          return url;
        }
      } catch {
        continue;
      }
    }
  }
  
  return null;
}

