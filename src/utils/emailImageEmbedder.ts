/**
 * Embeds external images as base64 data URIs in HTML
 * This makes downloaded HTML files self-contained with embedded images
 */

interface ImageEmbedResult {
  success: boolean;
  html: string;
  failedImages: string[];
}

/**
 * Fetches an image URL and converts it to a base64 data URI
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    // Set timeout for image fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Failed to fetch image: ${url} (${response.status})`);
      return null;
    }

    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Error fetching image ${url}:`, error);
    return null;
  }
}

/**
 * Embeds all images in HTML as base64 data URIs
 * @param html - The HTML string containing image URLs
 * @returns Promise resolving to result object with embedded HTML
 */
export async function embedImagesInHtml(html: string): Promise<ImageEmbedResult> {
  const failedImages: string[] = [];
  
  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find all img tags
  const images = doc.querySelectorAll('img');
  
  if (images.length === 0) {
    return {
      success: true,
      html,
      failedImages: [],
    };
  }

  // Process all images in parallel
  const imagePromises = Array.from(images).map(async (img) => {
    const src = img.getAttribute('src');
    
    if (!src) return;
    
    // Skip if already a data URI
    if (src.startsWith('data:')) return;
    
    // Skip relative URLs (they won't work anyway)
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      failedImages.push(src);
      return;
    }

    try {
      const base64 = await fetchImageAsBase64(src);
      
      if (base64) {
        img.setAttribute('src', base64);
      } else {
        failedImages.push(src);
      }
    } catch (error) {
      console.error(`Failed to embed image: ${src}`, error);
      failedImages.push(src);
    }
  });

  await Promise.all(imagePromises);

  // Serialize back to HTML string
  const embeddedHtml = doc.documentElement.outerHTML;

  return {
    success: failedImages.length === 0,
    html: embeddedHtml,
    failedImages,
  };
}
