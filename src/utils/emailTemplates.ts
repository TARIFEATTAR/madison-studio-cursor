// Professional email templates with full customization support

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: "newsletter" | "product" | "announcement" | "welcome" | "promo";
}

export interface EmailContent {
  template: string;
  title: string;
  subtitle?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  headerImage?: string;
  brandColor: string;
  fontFamily: string;
  footerText?: string;
  secondaryColor?: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "newsletter",
    name: "Editorial Newsletter",
    description: "Classic newsletter with header, content sections, and CTA",
    category: "newsletter",
  },
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Bold product announcement with large visuals and CTA",
    category: "product",
  },
  {
    id: "announcement",
    name: "Brand Announcement",
    description: "Clean announcement template with centered content",
    category: "announcement",
  },
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Warm welcome message for new subscribers",
    category: "welcome",
  },
  {
    id: "promo",
    name: "Promotional Campaign",
    description: "Eye-catching promo with discount/offer highlight",
    category: "promo",
  },
];

export const EMAIL_FONTS = [
  { value: "Georgia, serif", label: "Georgia (Serif)" },
  { value: "'Times New Roman', serif", label: "Times New Roman (Serif)" },
  { value: "Arial, sans-serif", label: "Arial (Sans-serif)" },
  { value: "'Helvetica Neue', Helvetica, sans-serif", label: "Helvetica (Sans-serif)" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS (Sans-serif)" },
  { value: "Verdana, sans-serif", label: "Verdana (Sans-serif)" },
  { value: "'Courier New', monospace", label: "Courier New (Monospace)" },
];

// Base email styles that work across all email clients
const getBaseStyles = (fontFamily: string, brandColor: string) => `
  body, table, td, a { 
    -webkit-text-size-adjust: 100%; 
    -ms-text-size-adjust: 100%; 
  }
  table, td { 
    mso-table-lspace: 0pt; 
    mso-table-rspace: 0pt; 
  }
  img { 
    -ms-interpolation-mode: bicubic; 
    border: 0; 
    height: auto; 
    line-height: 100%; 
    outline: none; 
    text-decoration: none; 
  }
  body { 
    margin: 0; 
    padding: 0; 
    width: 100% !important; 
    font-family: ${fontFamily};
    background-color: #f4f4f4;
  }
  .email-container { 
    max-width: 600px; 
    margin: 0 auto; 
  }
  .header { 
    background-color: ${brandColor}; 
    padding: 40px 30px; 
    text-align: center; 
  }
  .content { 
    background-color: #ffffff; 
    padding: 40px 30px; 
  }
  .cta-button { 
    background-color: ${brandColor}; 
    color: #ffffff; 
    padding: 14px 32px; 
    text-decoration: none; 
    border-radius: 4px; 
    display: inline-block; 
    font-weight: 600;
    margin: 20px 0;
  }
  .footer { 
    background-color: #333333; 
    color: #ffffff; 
    padding: 30px; 
    text-align: center; 
    font-size: 12px; 
  }
  h1 { 
    color: #ffffff; 
    font-size: 32px; 
    margin: 0 0 10px 0; 
    font-weight: 700; 
  }
  h2 { 
    color: #333333; 
    font-size: 24px; 
    margin: 0 0 20px 0; 
    font-weight: 600; 
  }
  p { 
    color: #555555; 
    font-size: 16px; 
    line-height: 1.6; 
    margin: 0 0 16px 0; 
  }
  @media only screen and (max-width: 600px) {
    .email-container { 
      width: 100% !important; 
    }
    .header, .content, .footer { 
      padding: 20px !important; 
    }
    h1 { 
      font-size: 24px !important; 
    }
    h2 { 
      font-size: 20px !important; 
    }
  }
`;

export function generateNewsletterTemplate(content: EmailContent): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${content.title}</title>
  <style>${getBaseStyles(content.fontFamily, content.brandColor)}</style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>${content.title}</h1>
              ${content.subtitle ? `<p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0;">${content.subtitle}</p>` : ''}
            </td>
          </tr>
          
          <!-- Header Image (if provided) -->
          ${content.headerImage ? `
          <tr>
            <td style="padding: 0;">
              <img src="${content.headerImage}" alt="${content.title}" style="width: 100%; max-width: 600px; height: auto; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td class="content">
              <div style="white-space: pre-wrap;">${content.content}</div>
              
              ${content.ctaText && content.ctaUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${content.ctaUrl}" class="cta-button">${content.ctaText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="color: #cccccc; margin: 0 0 10px 0;">
                ${content.footerText || 'You received this email because you subscribed to our newsletter.'}
              </p>
              <p style="color: #999999; margin: 0;">
                <a href="#" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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

export function generateProductLaunchTemplate(content: EmailContent): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${content.title}</title>
  <style>${getBaseStyles(content.fontFamily, content.brandColor)}</style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Large Header Image -->
          ${content.headerImage ? `
          <tr>
            <td style="padding: 0;">
              <img src="${content.headerImage}" alt="${content.title}" style="width: 100%; max-width: 600px; height: auto; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Bold Title Section -->
          <tr>
            <td style="background-color: #ffffff; padding: 50px 30px 20px 30px; text-align: center;">
              <h1 style="color: ${content.brandColor}; font-size: 36px; margin: 0 0 15px 0; font-weight: 700;">${content.title}</h1>
              ${content.subtitle ? `<p style="color: #666666; font-size: 20px; margin: 0; font-weight: 400;">${content.subtitle}</p>` : ''}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="text-align: center;">
              <div style="white-space: pre-wrap; text-align: left;">${content.content}</div>
              
              ${content.ctaText && content.ctaUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 40px auto;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${content.ctaUrl}" class="cta-button" style="font-size: 18px; padding: 18px 40px;">${content.ctaText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="color: #cccccc; margin: 0 0 10px 0;">
                ${content.footerText || 'You received this email because you subscribed to our newsletter.'}
              </p>
              <p style="color: #999999; margin: 0;">
                <a href="#" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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

export function generateAnnouncementTemplate(content: EmailContent): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${content.title}</title>
  <style>${getBaseStyles(content.fontFamily, content.brandColor)}</style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Centered Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 60px 30px 30px 30px; text-align: center;">
              <h1 style="color: ${content.brandColor}; font-size: 32px; margin: 0 0 10px 0; font-weight: 700;">${content.title}</h1>
              ${content.subtitle ? `<p style="color: #888888; font-size: 16px; margin: 0; font-style: italic;">${content.subtitle}</p>` : ''}
            </td>
          </tr>
          
          <!-- Header Image (if provided) -->
          ${content.headerImage ? `
          <tr>
            <td style="padding: 0;">
              <img src="${content.headerImage}" alt="${content.title}" style="width: 100%; max-width: 600px; height: auto; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td class="content" style="text-align: center;">
              <div style="white-space: pre-wrap; text-align: center; font-size: 17px; line-height: 1.7;">${content.content}</div>
              
              ${content.ctaText && content.ctaUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 35px auto;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${content.ctaUrl}" class="cta-button">${content.ctaText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="color: #cccccc; margin: 0 0 10px 0;">
                ${content.footerText || 'You received this email because you subscribed to our newsletter.'}
              </p>
              <p style="color: #999999; margin: 0;">
                <a href="#" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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

export function generateWelcomeTemplate(content: EmailContent): string {
  const secondaryColor = content.secondaryColor || '#f8f8f8';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${content.title}</title>
  <style>${getBaseStyles(content.fontFamily, content.brandColor)}</style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Welcome Header with Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, ${content.brandColor} 0%, ${secondaryColor} 100%); padding: 50px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 36px; margin: 0 0 10px 0; font-weight: 700;">🎉 ${content.title}</h1>
              ${content.subtitle ? `<p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">${content.subtitle}</p>` : ''}
            </td>
          </tr>
          
          <!-- Header Image (if provided) -->
          ${content.headerImage ? `
          <tr>
            <td style="padding: 0;">
              <img src="${content.headerImage}" alt="${content.title}" style="width: 100%; max-width: 600px; height: auto; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td class="content">
              <div style="white-space: pre-wrap; font-size: 17px; line-height: 1.7;">${content.content}</div>
              
              ${content.ctaText && content.ctaUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 35px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${content.ctaUrl}" class="cta-button" style="font-size: 16px;">${content.ctaText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="color: #cccccc; margin: 0 0 10px 0;">
                ${content.footerText || 'Welcome to our community! We\'re excited to have you here.'}
              </p>
              <p style="color: #999999; margin: 0;">
                <a href="#" style="color: #999999; text-decoration: underline;">Update preferences</a>
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

export function generatePromoTemplate(content: EmailContent): string {
  const secondaryColor = content.secondaryColor || '#FF6B6B';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${content.title}</title>
  <style>${getBaseStyles(content.fontFamily, content.brandColor)}</style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Eye-catching Promo Banner -->
          <tr>
            <td style="background-color: ${secondaryColor}; padding: 15px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; font-weight: 700; margin: 0; letter-spacing: 1px;">
                ${content.subtitle || '🔥 LIMITED TIME OFFER 🔥'}
              </p>
            </td>
          </tr>
          
          <!-- Main Header -->
          <tr>
            <td class="header">
              <h1 style="font-size: 40px; letter-spacing: -1px;">${content.title}</h1>
            </td>
          </tr>
          
          <!-- Header Image (if provided) -->
          ${content.headerImage ? `
          <tr>
            <td style="padding: 0;">
              <img src="${content.headerImage}" alt="${content.title}" style="width: 100%; max-width: 600px; height: auto; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td class="content" style="text-align: center;">
              <div style="white-space: pre-wrap; text-align: center; font-size: 18px; line-height: 1.6;">${content.content}</div>
              
              ${content.ctaText && content.ctaUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 40px auto;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${content.ctaUrl}" class="cta-button" style="font-size: 20px; padding: 20px 50px; background-color: ${secondaryColor};">${content.ctaText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <p style="color: #999999; font-size: 14px; margin-top: 30px;">
                Offer expires soon. Terms and conditions apply.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="color: #cccccc; margin: 0 0 10px 0;">
                ${content.footerText || 'Don\'t miss out on this exclusive offer!'}
              </p>
              <p style="color: #999999; margin: 0;">
                <a href="#" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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

export function generateEmailFromTemplate(templateId: string, content: EmailContent): string {
  switch (templateId) {
    case "newsletter":
      return generateNewsletterTemplate(content);
    case "product-launch":
      return generateProductLaunchTemplate(content);
    case "announcement":
      return generateAnnouncementTemplate(content);
    case "welcome":
      return generateWelcomeTemplate(content);
    case "promo":
      return generatePromoTemplate(content);
    default:
      return generateNewsletterTemplate(content);
  }
}
