// Professional email templates with full customization support

import { generateLuxuryTemplate } from "./emailTemplates_luxury";

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
  buttonColor?: string;
  buttonTextColor?: string;
  textColor?: string;
  // Footer customization
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerLinkColor?: string;
  // Footer content
  footerTagline?: string;
  companyAddress?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  shopUrl?: string;
  aboutUrl?: string;
  contactUrl?: string;
  privacyUrl?: string;
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
  {
    id: "luxury",
    name: "Luxury Minimal",
    description: "Elegant minimal design with maximum white space",
    category: "announcement",
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
const getBaseStyles = (
  fontFamily: string, 
  brandColor: string, 
  buttonColor?: string, 
  buttonTextColor?: string, 
  textColor?: string,
  footerBackgroundColor?: string,
  footerTextColor?: string,
  footerLinkColor?: string
) => `
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
    background-color: ${buttonColor || brandColor}; 
    color: ${buttonTextColor || '#ffffff'}; 
    padding: 16px 40px; 
    text-decoration: none; 
    border-radius: 2px; 
    display: inline-block; 
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-size: 14px;
    margin: 30px 0;
    transition: all 0.3s ease;
  }
  .cta-button-outline {
    background-color: transparent;
    color: ${buttonColor || brandColor};
    border: 2px solid ${buttonColor || brandColor};
    padding: 14px 38px;
    text-decoration: none;
    border-radius: 2px;
    display: inline-block;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-size: 14px;
    margin: 30px 0;
    transition: all 0.3s ease;
  }
  .footer { 
    background-color: ${footerBackgroundColor || '#F8F8F8'}; 
    color: ${footerTextColor || '#666666'}; 
    padding: 50px 30px 40px 30px; 
    text-align: center; 
  }
  .footer a {
    color: ${footerLinkColor || brandColor};
    text-decoration: none;
  }
  .footer a:hover {
    text-decoration: underline;
  }
  .footer-legal {
    color: ${footerTextColor ? `${footerTextColor}99` : '#999999'};
    font-size: 11px;
    line-height: 1.6;
    margin: 0 0 15px 0;
  }
  .footer-divider {
    border-top: 1px solid ${footerTextColor ? `${footerTextColor}33` : '#DDDDDD'};
    margin: 30px auto;
    width: 60px;
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
    color: ${textColor || '#555555'}; 
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
  <style>${getBaseStyles(content.fontFamily, content.brandColor, content.buttonColor, content.buttonTextColor, content.textColor, content.footerBackgroundColor, content.footerTextColor, content.footerLinkColor)}</style>
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
              ${content.footerTagline ? `
              <p style="color: ${content.footerTextColor || '#666666'}; font-size: 14px; margin: 0 0 25px 0; letter-spacing: 0.5px;">
                ${content.footerTagline}
              </p>
              ` : ''}
              
              ${content.instagramUrl || content.facebookUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.instagramUrl ? `<td style="padding: 0 10px;"><a href="${content.instagramUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">INSTAGRAM</a></td>` : ''}
                  ${content.facebookUrl ? `<td style="padding: 0 10px;"><a href="${content.facebookUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">FACEBOOK</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              ${content.shopUrl || content.aboutUrl || content.contactUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.shopUrl ? `<td style="padding: 0 15px; ${content.aboutUrl || content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.shopUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">SHOP</a></td>` : ''}
                  ${content.aboutUrl ? `<td style="padding: 0 15px; ${content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.aboutUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">ABOUT</a></td>` : ''}
                  ${content.contactUrl ? `<td style="padding: 0 15px;"><a href="${content.contactUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">CONTACT</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto; width: 60px;">
                <tr><td class="footer-divider"></td></tr>
              </table>
              
              <p class="footer-legal">
                ${content.footerText || 'You received this email because you subscribed to our newsletter.'}
              </p>
              
              ${content.companyAddress ? `
              <p class="footer-legal" style="font-size: 10px;">
                ${content.companyAddress}
              </p>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="#" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">UNSUBSCRIBE</a>
                  </td>
                  ${content.privacyUrl ? `
                  <td style="padding: 0 10px; color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#CCCCCC'};">|</td>
                  <td style="padding: 0 10px;">
                    <a href="${content.privacyUrl}" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">PRIVACY POLICY</a>
                  </td>
                  ` : ''}
                </tr>
              </table>
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
  <style>${getBaseStyles(content.fontFamily, content.brandColor, content.buttonColor, content.buttonTextColor, content.textColor, content.footerBackgroundColor, content.footerTextColor, content.footerLinkColor)}</style>
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
              ${content.footerTagline ? `
              <p style="color: ${content.footerTextColor || '#666666'}; font-size: 14px; margin: 0 0 25px 0; letter-spacing: 0.5px;">
                ${content.footerTagline}
              </p>
              ` : ''}
              
              ${content.instagramUrl || content.facebookUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.instagramUrl ? `<td style="padding: 0 10px;"><a href="${content.instagramUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">INSTAGRAM</a></td>` : ''}
                  ${content.facebookUrl ? `<td style="padding: 0 10px;"><a href="${content.facebookUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">FACEBOOK</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              ${content.shopUrl || content.aboutUrl || content.contactUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.shopUrl ? `<td style="padding: 0 15px; ${content.aboutUrl || content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.shopUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">SHOP</a></td>` : ''}
                  ${content.aboutUrl ? `<td style="padding: 0 15px; ${content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.aboutUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">ABOUT</a></td>` : ''}
                  ${content.contactUrl ? `<td style="padding: 0 15px;"><a href="${content.contactUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">CONTACT</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto; width: 60px;">
                <tr><td class="footer-divider"></td></tr>
              </table>
              
              <p class="footer-legal">
                ${content.footerText || 'You received this email because you subscribed to our newsletter.'}
              </p>
              
              ${content.companyAddress ? `
              <p class="footer-legal" style="font-size: 10px;">
                ${content.companyAddress}
              </p>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="#" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">UNSUBSCRIBE</a>
                  </td>
                  ${content.privacyUrl ? `
                  <td style="padding: 0 10px; color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#CCCCCC'};">|</td>
                  <td style="padding: 0 10px;">
                    <a href="${content.privacyUrl}" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">PRIVACY POLICY</a>
                  </td>
                  ` : ''}
                </tr>
              </table>
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
  <style>${getBaseStyles(content.fontFamily, content.brandColor, content.buttonColor, content.buttonTextColor, content.textColor, content.footerBackgroundColor, content.footerTextColor, content.footerLinkColor)}</style>
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
              ${content.footerTagline ? `
              <p style="color: ${content.footerTextColor || '#666666'}; font-size: 14px; margin: 0 0 25px 0; letter-spacing: 0.5px;">
                ${content.footerTagline}
              </p>
              ` : ''}
              
              ${content.instagramUrl || content.facebookUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.instagramUrl ? `<td style="padding: 0 10px;"><a href="${content.instagramUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">INSTAGRAM</a></td>` : ''}
                  ${content.facebookUrl ? `<td style="padding: 0 10px;"><a href="${content.facebookUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">FACEBOOK</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              ${content.shopUrl || content.aboutUrl || content.contactUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.shopUrl ? `<td style="padding: 0 15px; ${content.aboutUrl || content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.shopUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">SHOP</a></td>` : ''}
                  ${content.aboutUrl ? `<td style="padding: 0 15px; ${content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.aboutUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">ABOUT</a></td>` : ''}
                  ${content.contactUrl ? `<td style="padding: 0 15px;"><a href="${content.contactUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">CONTACT</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto; width: 60px;">
                <tr><td class="footer-divider"></td></tr>
              </table>
              
              <p class="footer-legal">
                ${content.footerText || 'You received this email because you subscribed to our newsletter.'}
              </p>
              
              ${content.companyAddress ? `
              <p class="footer-legal" style="font-size: 10px;">
                ${content.companyAddress}
              </p>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="#" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">UNSUBSCRIBE</a>
                  </td>
                  ${content.privacyUrl ? `
                  <td style="padding: 0 10px; color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#CCCCCC'};">|</td>
                  <td style="padding: 0 10px;">
                    <a href="${content.privacyUrl}" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">PRIVACY POLICY</a>
                  </td>
                  ` : ''}
                </tr>
              </table>
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
  <style>${getBaseStyles(content.fontFamily, content.brandColor, content.buttonColor, content.buttonTextColor, content.textColor, content.footerBackgroundColor, content.footerTextColor, content.footerLinkColor)}</style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Welcome Header with Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, ${content.brandColor} 0%, ${secondaryColor} 100%); padding: 50px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 36px; margin: 0 0 10px 0; font-weight: 700;">${content.title}</h1>
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
              ${content.footerTagline ? `
              <p style="color: ${content.footerTextColor || '#666666'}; font-size: 14px; margin: 0 0 25px 0; letter-spacing: 0.5px;">
                ${content.footerTagline}
              </p>
              ` : ''}
              
              ${content.instagramUrl || content.facebookUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.instagramUrl ? `<td style="padding: 0 10px;"><a href="${content.instagramUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">INSTAGRAM</a></td>` : ''}
                  ${content.facebookUrl ? `<td style="padding: 0 10px;"><a href="${content.facebookUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">FACEBOOK</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              ${content.shopUrl || content.aboutUrl || content.contactUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.shopUrl ? `<td style="padding: 0 15px; ${content.aboutUrl || content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.shopUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">SHOP</a></td>` : ''}
                  ${content.aboutUrl ? `<td style="padding: 0 15px; ${content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.aboutUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">ABOUT</a></td>` : ''}
                  ${content.contactUrl ? `<td style="padding: 0 15px;"><a href="${content.contactUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">CONTACT</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto; width: 60px;">
                <tr><td class="footer-divider"></td></tr>
              </table>
              
              <p class="footer-legal">
                ${content.footerText || 'Welcome to our community! We\'re excited to have you here.'}
              </p>
              
              ${content.companyAddress ? `
              <p class="footer-legal" style="font-size: 10px;">
                ${content.companyAddress}
              </p>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="#" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">UNSUBSCRIBE</a>
                  </td>
                  ${content.privacyUrl ? `
                  <td style="padding: 0 10px; color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#CCCCCC'};">|</td>
                  <td style="padding: 0 10px;">
                    <a href="${content.privacyUrl}" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">PRIVACY POLICY</a>
                  </td>
                  ` : ''}
                </tr>
              </table>
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
  <style>${getBaseStyles(content.fontFamily, content.brandColor, content.buttonColor, content.buttonTextColor, content.textColor, content.footerBackgroundColor, content.footerTextColor, content.footerLinkColor)}</style>
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
              ${content.footerTagline ? `
              <p style="color: ${content.footerTextColor || '#666666'}; font-size: 14px; margin: 0 0 25px 0; letter-spacing: 0.5px;">
                ${content.footerTagline}
              </p>
              ` : ''}
              
              ${content.instagramUrl || content.facebookUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.instagramUrl ? `<td style="padding: 0 10px;"><a href="${content.instagramUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">INSTAGRAM</a></td>` : ''}
                  ${content.facebookUrl ? `<td style="padding: 0 10px;"><a href="${content.facebookUrl}" style="color: ${content.footerTextColor || '#666666'}; font-size: 12px; letter-spacing: 0.5px;">FACEBOOK</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              ${content.shopUrl || content.aboutUrl || content.contactUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.shopUrl ? `<td style="padding: 0 15px; ${content.aboutUrl || content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.shopUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">SHOP</a></td>` : ''}
                  ${content.aboutUrl ? `<td style="padding: 0 15px; ${content.contactUrl ? `border-right: 1px solid ${content.footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.aboutUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">ABOUT</a></td>` : ''}
                  ${content.contactUrl ? `<td style="padding: 0 15px;"><a href="${content.contactUrl}" style="color: ${content.footerLinkColor || content.brandColor}; font-size: 12px; letter-spacing: 0.5px;">CONTACT</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto; width: 60px;">
                <tr><td class="footer-divider"></td></tr>
              </table>
              
              <p class="footer-legal">
                ${content.footerText || 'Don\'t miss out on this exclusive offer!'}
              </p>
              
              ${content.companyAddress ? `
              <p class="footer-legal" style="font-size: 10px;">
                ${content.companyAddress}
              </p>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="#" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">UNSUBSCRIBE</a>
                  </td>
                  ${content.privacyUrl ? `
                  <td style="padding: 0 10px; color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#CCCCCC'};">|</td>
                  <td style="padding: 0 10px;">
                    <a href="${content.privacyUrl}" style="color: ${content.footerTextColor ? `${content.footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px;">PRIVACY POLICY</a>
                  </td>
                  ` : ''}
                </tr>
              </table>
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
    case "luxury":
      return generateLuxuryTemplate(content);
    default:
      return generateNewsletterTemplate(content);
  }
}
