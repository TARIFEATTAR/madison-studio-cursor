import type { EmailContent } from "./emailTemplates";

// Luxury minimal template with maximum white space and elegance
export function generateLuxuryTemplate(content: EmailContent): string {
  const buttonColor = content.buttonColor || content.brandColor;
  const buttonTextColor = content.buttonTextColor || '#ffffff';
  const textColor = content.textColor || '#333333';
  
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
    .luxury-footer {
      padding: 40px 60px 60px 60px;
      text-align: center;
      border-top: 1px solid #e8e8e8;
      background-color: #fafafa;
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
              <div style="white-space: pre-wrap; text-align: center;">${content.content}</div>
            </td>
          </tr>
          
          <!-- CTA Section -->
          ${content.ctaText && content.ctaUrl ? `
          <tr>
            <td class="luxury-cta">
              <a href="${content.ctaUrl}" class="luxury-button">${content.ctaText}</a>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td class="luxury-footer">
              <p style="color: #999999; font-size: 11px; letter-spacing: 0.5px; line-height: 1.6;">
                ${content.footerText || 'This email was sent to you because you subscribed to our communications.'}
              </p>
              <p style="color: #cccccc; font-size: 10px; margin: 15px 0 0 0;">
                <a href="#" style="color: #cccccc; text-decoration: none; letter-spacing: 1px;">UNSUBSCRIBE</a>
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
