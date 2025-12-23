/**
 * Image Download Utility
 *
 * Properly handles downloading images from various sources:
 * - Base64 data URLs (from background removal, etc.)
 * - Regular HTTP/HTTPS URLs
 * - Validates Content-Type to ensure we're downloading actual images
 */

/**
 * Converts a base64 data URL to a Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * Downloads an image from a URL (supports both data URLs and regular URLs)
 *
 * @param imageUrl - The image URL (can be data URL or regular URL)
 * @param filename - The filename for the download
 * @returns Promise that resolves when download is initiated
 */
export async function downloadImage(
  imageUrl: string,
  filename: string = `madison-image-${Date.now()}.png`
): Promise<void> {
  try {
    let blob: Blob;
    let shouldRevoke = false;

    // Handle base64 data URLs
    if (imageUrl.startsWith('data:')) {
      blob = dataURLtoBlob(imageUrl);
    } else {
      // For regular URLs, fetch the image
      const response = await fetch(imageUrl, { mode: 'cors' });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText} (${response.status})`);
      }

      // Validate Content-Type to ensure we're downloading an image, not HTML
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        // Try to read a bit of the response to see if it's HTML
        const text = await response.text();
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error('Received HTML instead of image. The image URL may be invalid or require authentication.');
        }
        throw new Error(`Invalid content type: ${contentType}. Expected an image.`);
      }

      // Get the blob
      blob = await response.blob();

      // Ensure blob has correct MIME type
      if (!blob.type || !blob.type.startsWith('image/')) {
        // If blob doesn't have correct type, recreate it with proper type
        const mimeType = contentType || 'image/png';
        blob = new Blob([blob], { type: mimeType });
      }
    }

    // Validate blob is not empty
    if (blob.size === 0) {
      throw new Error('Downloaded image is empty');
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    shouldRevoke = true;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL after a delay to allow download to start
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Image download error:', error);
    throw error;
  }
}

