import type { EmailContent } from "./emailTemplates";

// Luxury minimal template with maximum white space and elegance
export function generateLuxuryTemplate(content: EmailContent): string {
  const buttonColor = content.buttonColor || content.brandColor;
  const buttonTextColor = content.buttonTextColor || '#ffffff';
  const textColor = content.textColor || '#333333';
  const footerBackgroundColor = content.footerBackgroundColor || '#FAFAFA';
  const footerTextColor = content.footerTextColor || '#666666';
  const footerLinkColor = content.footerLinkColor || content.brandColor;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${content.title}</title>
  <style>
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
      font-family: ${content.fontFamily};
      background-color: #ffffff;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
    }
    .luxury-header {
      padding: 80px 60px 40px 60px;
      text-align: center;
      border-bottom: 1px solid #e8e8e8;
    }
    .luxury-content {
      padding: 60px 60px;
      background-color: #ffffff;
    }
    .luxury-cta {
      text-align: center;
      padding: 40px 60px;
    }
    .luxury-button {
      background-color: transparent;
      color: ${buttonColor};
      border: 1.5px solid ${buttonColor};
      padding: 14px 50px;
      text-decoration: none;
      border-radius: 0;
      display: inline-block;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      font-size: 11px;
      transition: all 0.3s ease;
    }
    .luxury-button:hover {
      background-color: ${buttonColor};
      color: ${buttonTextColor};
    }
    /* Optional full-width CTA on mobile */
    .luxury-button--full-mobile {
      /* becomes full-width on mobile */
    }
    @media only screen and (max-width: 600px) {
      .luxury-button--full-mobile {
        width: 100% !important;
        display: block !important;
        box-sizing: border-box;
        text-align: center !important;
      }
    }
    .luxury-footer {
      padding: 50px 60px 40px 60px;
      text-align: center;
      border-top: 1px solid #e8e8e8;
      background-color: ${footerBackgroundColor};
    }
    .footer-divider {
      border-top: 1px solid ${footerTextColor ? `${footerTextColor}33` : '#DDDDDD'};
      margin: 30px auto;
      width: 60px;
    }
    .footer-legal {
      color: ${footerTextColor ? `${footerTextColor}99` : '#999999'};
      font-size: 11px;
      line-height: 1.6;
      margin: 0 0 15px 0;
    }
    h1 {
      color: ${textColor};
      font-size: 28px;
      margin: 0 0 20px 0;
      font-weight: 400;
      letter-spacing: 0.5px;
      line-height: 1.4;
    }
    h2 {
      color: ${textColor};
      font-size: 16px;
      margin: 0 0 30px 0;
      font-weight: 300;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    p {
      color: ${textColor};
      font-size: 15px;
      line-height: 1.8;
      margin: 0 0 20px 0;
      font-weight: 300;
    }
    .subtitle {
      color: #888888;
      font-size: 13px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 0;
    }
    @media only screen and (max-width: 600px) {
      .luxury-header, .luxury-content, .luxury-cta, .luxury-footer {
        padding-left: 30px !important;
        padding-right: 30px !important;
      }
      h1 {
        font-size: 24px !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Luxury Header -->
          <tr>
            <td class="luxury-header">
              ${content.subtitle ? `<h2 class="subtitle">${content.subtitle}</h2>` : ''}
              <h1>${content.title}</h1>
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
            <td class="luxury-content">
              ${content.bodyHeader ? `<h2 style=\"text-align: ${content.contentAlignment || 'left'};\">${content.bodyHeader}</h2>` : ''}

              <!-- Body copy with robust alignment (supports Outlook) -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="${content.contentAlignment || 'left'}" style="text-align: ${content.contentAlignment || 'left'};">
                    <div style="white-space: pre-wrap; text-align: ${content.contentAlignment || 'left'};">${content.content}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Section -->
          ${content.ctaText && content.ctaUrl ? `
          <tr>
            <td class="luxury-cta" align="${content.ctaAlignment || 'center'}" style="text-align: ${content.ctaAlignment || 'center'};">
              <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"${content.ctaAlignment || 'center'}\" style=\"margin: 0 ${content.ctaAlignment === 'center' ? 'auto' : '0'};\">
                <tr>
                  <td>
                    <a href=\"${content.ctaUrl}\" class=\"luxury-button ${content.expandButtonOnMobile ? 'luxury-button--full-mobile' : ''}\">${content.ctaText}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td class="luxury-footer">
              ${content.footerTagline ? `
              <p style="color: ${footerTextColor}; font-size: 14px; margin: 0 0 25px 0; letter-spacing: 0.5px;">
                ${content.footerTagline}
              </p>
              ` : ''}
              
              ${content.instagramUrl || content.facebookUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.instagramUrl ? `<td style="padding: 0 10px;"><a href="${content.instagramUrl}" style="color: ${footerTextColor}; font-size: 12px; letter-spacing: 0.5px; text-decoration: none;">INSTAGRAM</a></td>` : ''}
                  ${content.facebookUrl ? `<td style="padding: 0 10px;"><a href="${content.facebookUrl}" style="color: ${footerTextColor}; font-size: 12px; letter-spacing: 0.5px; text-decoration: none;">FACEBOOK</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              ${content.shopUrl || content.aboutUrl || content.contactUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                  ${content.shopUrl ? `<td style="padding: 0 15px; ${content.aboutUrl || content.contactUrl ? `border-right: 1px solid ${footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.shopUrl}" style="color: ${footerLinkColor}; font-size: 12px; letter-spacing: 0.5px; text-decoration: none;">SHOP</a></td>` : ''}
                  ${content.aboutUrl ? `<td style="padding: 0 15px; ${content.contactUrl ? `border-right: 1px solid ${footerTextColor || '#CCCCCC'};` : ''}"><a href="${content.aboutUrl}" style="color: ${footerLinkColor}; font-size: 12px; letter-spacing: 0.5px; text-decoration: none;">ABOUT</a></td>` : ''}
                  ${content.contactUrl ? `<td style="padding: 0 15px;"><a href="${content.contactUrl}" style="color: ${footerLinkColor}; font-size: 12px; letter-spacing: 0.5px; text-decoration: none;">CONTACT</a></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto; width: 60px;">
                <tr><td class="footer-divider"></td></tr>
              </table>
              
              <p class="footer-legal">
                ${content.footerText || 'This email was sent to you because you subscribed to our communications.'}
              </p>
              
              ${content.companyAddress ? `
              <p class="footer-legal" style="font-size: 10px;">
                ${content.companyAddress}
              </p>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="#" style="color: ${footerTextColor ? `${footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px; text-decoration: none;">UNSUBSCRIBE</a>
                  </td>
                  ${content.privacyUrl ? `
                  <td style="padding: 0 10px; color: ${footerTextColor ? `${footerTextColor}99` : '#CCCCCC'};">|</td>
                  <td style="padding: 0 10px;">
                    <a href="${content.privacyUrl}" style="color: ${footerTextColor ? `${footerTextColor}99` : '#999999'}; font-size: 10px; letter-spacing: 0.5px; text-decoration: none;">PRIVACY POLICY</a>
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
