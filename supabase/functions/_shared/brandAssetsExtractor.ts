/**
 * Brand Assets Extractor
 * 
 * Extracts logos and brand assets from a domain using multiple strategies:
 * 1. Brandfetch API (primary) - comprehensive brand data
 * 2. Logo.dev API (alternative) - simple logo lookup
 * 3. HTML scraping (fallback) - extract from website HTML
 * 4. Google Favicon (last resort) - universal but low quality
 */

export interface BrandAssets {
  primaryLogoUrl?: string;
  alternativeLogos?: string[];
  faviconUrl?: string;
  ogImageUrl?: string;
  colors?: {
    primary?: string[];
    secondary?: string[];
    neutrals?: string[];
    accent?: string[];
  };
  confidenceScore: number; // 0-1, where 1 is highest confidence
  source: 'brandfetch' | 'logo.dev' | 'html_scraping' | 'favicon' | 'none';
}

/**
 * Extract brand assets from a domain
 * @param domain - Domain name (e.g., "example.com" or "www.example.com")
 * @returns BrandAssets object with logo URLs and metadata
 */
export async function extractBrandAssets(domain: string): Promise<BrandAssets> {
  // Normalize domain (remove www, protocol, etc.)
  const normalizedDomain = normalizeDomain(domain);
  
  console.log(`[brandAssets] Extracting assets for domain: ${normalizedDomain}`);

  // Strategy 1: Try Brandfetch API (most comprehensive)
  try {
    const brandfetchAssets = await tryBrandfetch(normalizedDomain);
    if (brandfetchAssets.primaryLogoUrl) {
      console.log(`[brandAssets] ✅ Found logo via Brandfetch`);
      return brandfetchAssets;
    }
  } catch (error) {
    console.log(`[brandAssets] Brandfetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Strategy 2: Try Logo.dev API (simple, reliable)
  try {
    const logoDevAssets = await tryLogoDev(normalizedDomain);
    if (logoDevAssets.primaryLogoUrl) {
      console.log(`[brandAssets] ✅ Found logo via Logo.dev`);
      return logoDevAssets;
    }
  } catch (error) {
    console.log(`[brandAssets] Logo.dev failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Strategy 3: Try HTML scraping (fallback)
  try {
    const htmlAssets = await tryHtmlScraping(normalizedDomain);
    if (htmlAssets.primaryLogoUrl || htmlAssets.faviconUrl || htmlAssets.ogImageUrl) {
      console.log(`[brandAssets] ✅ Found assets via HTML scraping`);
      return htmlAssets;
    }
  } catch (error) {
    console.log(`[brandAssets] HTML scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Strategy 4: Google Favicon (last resort)
  try {
    const faviconAssets = await tryGoogleFavicon(normalizedDomain);
    if (faviconAssets.faviconUrl) {
      console.log(`[brandAssets] ✅ Found favicon via Google`);
      return faviconAssets;
    }
  } catch (error) {
    console.log(`[brandAssets] Google Favicon failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // No assets found
  console.log(`[brandAssets] ❌ No assets found for ${normalizedDomain}`);
  return {
    confidenceScore: 0,
    source: 'none',
  };
}

/**
 * Normalize domain name
 */
function normalizeDomain(domain: string): string {
  // Remove protocol
  domain = domain.replace(/^https?:\/\//, '');
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

/**
 * Try Brandfetch API
 * Requires BRANDFETCH_API_KEY environment variable
 */
async function tryBrandfetch(domain: string): Promise<BrandAssets> {
  const apiKey = Deno.env.get('BRANDFETCH_API_KEY');
  if (!apiKey) {
    throw new Error('BRANDFETCH_API_KEY not configured');
  }

  try {
    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Brandfetch API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Brandfetch returns comprehensive brand data
    const logos: string[] = [];
    let primaryLogo: string | undefined;

    // Extract logos from various formats
    if (data.logos && Array.isArray(data.logos)) {
      for (const logo of data.logos) {
        if (logo.image && typeof logo.image === 'string') {
          logos.push(logo.image);
          if (!primaryLogo && logo.type === 'primary') {
            primaryLogo = logo.image;
          }
        }
      }
    }

    // If no primary logo found, use first logo
    if (!primaryLogo && logos.length > 0) {
      primaryLogo = logos[0];
    }

    // Extract favicon
    const favicon = data.favicon || data.icons?.find((icon: any) => icon.type === 'favicon')?.image;

    // Extract OG image
    const ogImage = data.images?.find((img: any) => img.type === 'og')?.image;

    // Extract colors from Brandfetch
    const colors: BrandAssets['colors'] = {};
    if (data.colors && Array.isArray(data.colors)) {
      const primaryColors: string[] = [];
      const secondaryColors: string[] = [];
      const neutralColors: string[] = [];
      const accentColors: string[] = [];

      for (const color of data.colors) {
        const hex = normalizeColorHex(color.hex || color.value || color);
        if (!hex) continue;

        if (color.type === 'primary' || color.usage === 'primary') {
          primaryColors.push(hex);
        } else if (color.type === 'secondary' || color.usage === 'secondary') {
          secondaryColors.push(hex);
        } else if (color.type === 'neutral' || color.usage === 'neutral' || color.usage === 'background') {
          neutralColors.push(hex);
        } else if (color.type === 'accent' || color.usage === 'accent') {
          accentColors.push(hex);
        } else {
          // Default categorization
          if (primaryColors.length < 3) {
            primaryColors.push(hex);
          } else {
            secondaryColors.push(hex);
          }
        }
      }

      if (primaryColors.length > 0) colors.primary = primaryColors.slice(0, 5);
      if (secondaryColors.length > 0) colors.secondary = secondaryColors.slice(0, 5);
      if (neutralColors.length > 0) colors.neutrals = neutralColors.slice(0, 5);
      if (accentColors.length > 0) colors.accent = accentColors.slice(0, 3);
    }

    return {
      primaryLogoUrl: primaryLogo,
      alternativeLogos: logos.length > 1 ? logos.slice(1) : undefined,
      faviconUrl: favicon,
      ogImageUrl: ogImage,
      colors: Object.keys(colors).length > 0 ? colors : undefined,
      confidenceScore: primaryLogo ? 0.95 : 0.7,
      source: 'brandfetch',
    };
  } catch (error) {
    throw new Error(`Brandfetch API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Try Logo.dev API (simple Clearbit-style replacement)
 */
async function tryLogoDev(domain: string): Promise<BrandAssets> {
  try {
    // Logo.dev API endpoint
    const logoUrl = `https://logo.dev/${domain}`;
    
    // Check if logo exists by making a HEAD request
    const response = await fetch(logoUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MadisonBot/1.0)',
      },
    });

    if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
      return {
        primaryLogoUrl: logoUrl,
        confidenceScore: 0.85,
        source: 'logo.dev',
      };
    }

    throw new Error('Logo.dev returned non-image response');
  } catch (error) {
    throw new Error(`Logo.dev API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Try HTML scraping to extract logos from website
 */
async function tryHtmlScraping(domain: string): Promise<BrandAssets> {
  const url = `https://${domain}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const baseUrl = new URL(url).origin;
    
    const assets: BrandAssets = {
      confidenceScore: 0.6,
      source: 'html_scraping',
    };

    // Extract favicon
    const faviconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i);
    if (faviconMatch) {
      assets.faviconUrl = resolveUrl(faviconMatch[1], baseUrl);
    }

    // Extract OG image
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImageMatch) {
      assets.ogImageUrl = resolveUrl(ogImageMatch[1], baseUrl);
    }

    // Try to find logo in common locations
    // Look for img tags with logo-related classes/ids
    const logoPatterns = [
      /<img[^>]+(?:class|id)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']+)["'][^>]+(?:class|id)=["'][^"']*logo[^"']*["']/i,
      /<img[^>]+(?:class|id)=["'][^"']*brand[^"']*["'][^>]+src=["']([^"']+)["']/i,
    ];

    for (const pattern of logoPatterns) {
      const match = html.match(pattern);
      if (match) {
        const logoUrl = resolveUrl(match[1], baseUrl);
        // Basic validation: check if it's likely an image URL
        if (logoUrl.match(/\.(png|jpg|jpeg|svg|webp|gif)/i)) {
          assets.primaryLogoUrl = logoUrl;
          assets.confidenceScore = 0.7;
          break;
        }
      }
    }

    // If we found OG image but no logo, use OG image as logo
    if (!assets.primaryLogoUrl && assets.ogImageUrl) {
      assets.primaryLogoUrl = assets.ogImageUrl;
      assets.confidenceScore = 0.65;
    }

    // If we found favicon but no logo, use favicon as logo (lower confidence)
    if (!assets.primaryLogoUrl && assets.faviconUrl) {
      assets.primaryLogoUrl = assets.faviconUrl;
      assets.confidenceScore = 0.5;
    }

    return assets;
  } catch (error) {
    throw new Error(`HTML scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Try Google Favicon service (last resort)
 */
async function tryGoogleFavicon(domain: string): Promise<BrandAssets> {
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
  
  try {
    // Verify the favicon exists
    const response = await fetch(faviconUrl, { method: 'HEAD' });
    if (response.ok) {
      return {
        faviconUrl: faviconUrl,
        primaryLogoUrl: faviconUrl, // Use favicon as logo
        confidenceScore: 0.4,
        source: 'favicon',
      };
    }
    throw new Error('Google Favicon not available');
  } catch (error) {
    throw new Error(`Google Favicon error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Resolve relative URL to absolute URL
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  return `${baseUrl}/${url}`;
}

/**
 * Normalize color to hex format (helper for Brandfetch colors)
 */
function normalizeColorHex(color: string | any): string | null {
  if (!color) return null;
  
  // If it's already a hex string
  if (typeof color === 'string') {
    const trimmed = color.trim().toLowerCase();
    if (/^#[0-9a-f]{3,6}$/.test(trimmed)) {
      // Expand 3-digit hex to 6-digit
      if (trimmed.length === 4) {
        return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
      }
      return trimmed;
    }
  }
  
  // If it's an object with hex property
  if (typeof color === 'object' && color.hex) {
    return normalizeColorHex(color.hex);
  }
  
  return null;
}

