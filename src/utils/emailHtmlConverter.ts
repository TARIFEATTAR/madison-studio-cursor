/**
 * Converts content to email-safe HTML with inline styles
 * Email clients don't support external CSS, so all styles must be inline
 */

interface EmailOptions {
  content: string;
  title?: string;
  imageUrl?: string;
  brandColor?: string;
  accentColor?: string;
}

export function convertToEmailHtml(options: EmailOptions): string {
  const {
    content,
    title,
    imageUrl,
    brandColor = "#d4af37", // Madison gold
    accentColor = "#1a1a1a"
  } = options;

  // Convert line breaks to paragraphs
  const paragraphs = content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #333333;">${p.trim()}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title || 'Email from Madison'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <!-- Wrapper table for email client compatibility -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main content table -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">
          ${imageUrl ? `
          <!-- Header Image -->
          <tr>
            <td style="padding: 0;">
              <img src="${imageUrl}" alt="Header" style="display: block; width: 100%; height: auto; max-width: 600px;" />
            </td>
          </tr>
          ` : ''}
          
          ${title ? `
          <!-- Title -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: ${accentColor}; line-height: 1.3;">
                ${title}
              </h1>
            </td>
          </tr>
          ` : ''}
          
          <!-- Body Content -->
          <tr>
            <td style="padding: ${title ? '20px' : '40px'} 40px 40px 40px;">
              ${paragraphs}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #666666; text-align: center;">
                Sent with Madison Editorial Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function previewEmailHtml(html: string): string {
  // Wrap in iframe-safe preview
  return html;
}
