// 6 luxury email templates for MadisonSuite
// 4 high-end luxury ecommerce + 2 minimalist founder templates

export interface LuxuryTemplate {
  id: string;
  name: string;
  description: string;
  category: 'luxury-ecommerce' | 'founder-minimalist';
  preview: string;
  previewImage?: string;
}

export const LUXURY_TEMPLATES: LuxuryTemplate[] = [
  // Luxury Ecommerce Templates
  {
    id: 'luxury-collection',
    name: 'Luxury Collection',
    description: 'Elegant product showcase with refined typography',
    category: 'luxury-ecommerce',
    preview: '🎨 Refined product presentation with hero image and elegant CTA',
    previewImage: 'data:image/svg+xml,%3Csvg width="600" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="400" fill="%23f8f8f8"/%3E%3Crect y="80" width="600" height="240" fill="%23fff"/%3E%3Ctext x="300" y="50" font-family="serif" font-size="20" text-anchor="middle" fill="%231a1a1a"%3ELUXURY COLLECTION%3C/text%3E%3Crect x="50" y="320" width="500" height="40" rx="4" fill="%23d4af37"/%3E%3C/svg%3E'
  },
  {
    id: 'premium-launch',
    name: 'Premium Launch',
    description: 'Bold announcement with sophisticated styling',
    category: 'luxury-ecommerce',
    preview: '✨ High-impact launch template with centered content',
    previewImage: 'data:image/svg+xml,%3Csvg width="600" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="400" fill="%23000"/%3E%3Ctext x="300" y="180" font-family="sans-serif" font-size="32" font-weight="700" text-anchor="middle" fill="%23fff"%3ENEW LAUNCH%3C/text%3E%3Crect x="200" y="220" width="200" height="50" fill="%23d4af37"/%3E%3C/svg%3E'
  },
  {
    id: 'boutique-promo',
    name: 'Boutique Promo',
    description: 'Understated luxury with focus on craftsmanship',
    category: 'luxury-ecommerce',
    preview: '🛍️ Minimal design emphasizing exclusivity',
    previewImage: 'data:image/svg+xml,%3Csvg width="600" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="400" fill="%23f9f7f4"/%3E%3Ctext x="300" y="100" font-family="serif" font-size="28" text-anchor="middle" fill="%232a2a2a"%3EBOUTIQUE%3C/text%3E%3Ccircle cx="300" cy="220" r="80" fill="none" stroke="%23d4af37" stroke-width="2"/%3E%3Crect x="220" y="320" width="160" height="40" rx="20" fill="none" stroke="%23d4af37" stroke-width="2"/%3E%3C/svg%3E'
  },
  {
    id: 'editorial-commerce',
    name: 'Editorial Commerce',
    description: 'Magazine-style layout for storytelling',
    category: 'luxury-ecommerce',
    preview: '📰 Story-driven design with rich imagery',
    previewImage: 'data:image/svg+xml,%3Csvg width="600" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="400" fill="%23fff"/%3E%3Crect y="0" width="600" height="200" fill="%23e8e8e8"/%3E%3Ctext x="50" y="240" font-family="serif" font-size="24" fill="%231a1a1a"%3EEDITORIAL%3C/text%3E%3Cline x1="50" y1="260" x2="110" y2="260" stroke="%23d4af37" stroke-width="2"/%3E%3C/svg%3E'
  },
  // Founder Minimalist Templates
  {
    id: 'founder-note',
    name: 'Founder Note',
    description: 'Personal message with minimal distractions',
    category: 'founder-minimalist',
    preview: '✍️ Clean, personal correspondence style',
    previewImage: 'data:image/svg+xml,%3Csvg width="600" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="400" fill="%23fafafa"/%3E%3Ctext x="100" y="120" font-family="serif" font-size="18" fill="%232a2a2a"%3EA personal note%3C/text%3E%3Cline x1="100" y1="150" x2="500" y2="150" stroke="%23e0e0e0" stroke-width="1"/%3E%3Cline x1="100" y1="180" x2="450" y2="180" stroke="%23e0e0e0" stroke-width="1"/%3E%3Cline x1="100" y1="210" x2="480" y2="210" stroke="%23e0e0e0" stroke-width="1"/%3E%3C/svg%3E'
  },
  {
    id: 'minimal-update',
    name: 'Minimal Update',
    description: 'Ultra-clean update template with maximum whitespace',
    category: 'founder-minimalist',
    preview: '📝 Pure text-focused design with subtle accents',
    previewImage: 'data:image/svg+xml,%3Csvg width="600" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="400" fill="%23fff"/%3E%3Ctext x="120" y="140" font-family="sans-serif" font-size="20" font-weight="600" fill="%231a1a1a"%3EUpdate%3C/text%3E%3Cline x1="120" y1="170" x2="480" y2="170" stroke="%23e8e8e8" stroke-width="1"/%3E%3Cline x1="120" y1="200" x2="450" y2="200" stroke="%23e8e8e8" stroke-width="1"/%3E%3C/svg%3E'
  },
];

interface EmailContent {
  headline: string;
  imageUrl?: string;
  body: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  buttonStyle?: 'square' | 'rounded' | 'pill';
  brandColor: string;
  fontFamily: string;
}

const getButtonStyle = (style: 'square' | 'rounded' | 'pill') => {
  switch (style) {
    case 'square': return 'border-radius: 0px;';
    case 'rounded': return 'border-radius: 4px;';
    case 'pill': return 'border-radius: 50px;';
    default: return 'border-radius: 4px;';
  }
};

export function generateLuxuryCollection(content: EmailContent): string {
  const bgColor = content.backgroundColor || '#FFFFFF';
  const buttonStyle = getButtonStyle(content.buttonStyle || 'rounded');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.headline}</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${content.fontFamily}; background: #F8F8F8; }
    .container { max-width: 600px; margin: 40px auto; background: ${bgColor}; }
    .header { padding: 60px 40px 40px; text-align: center; }
    .headline { font-size: 32px; font-weight: 300; letter-spacing: 2px; margin: 0; color: #1A1A1A; }
    .image { width: 100%; display: block; }
    .content { padding: 50px 40px; color: #4A4A4A; font-size: 16px; line-height: 1.8; }
    .cta { text-align: center; padding: 0 40px 60px; }
    .button { display: inline-block; padding: 16px 48px; background: ${content.brandColor}; color: #FFFFFF; text-decoration: none; font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; ${buttonStyle} }
    .footer { padding: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #E8E8E8; }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; }
      .header { padding: 40px 20px 20px; }
      .headline { font-size: 24px; }
      .content { padding: 30px 20px; }
      .cta { padding: 0 20px 40px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="headline">${content.headline}</h1>
    </div>
    ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.headline}" class="image" />` : ''}
    <div class="content">
      ${content.body.replace(/\n/g, '<br>')}
    </div>
    ${content.ctaText && content.ctaLink ? `
    <div class="cta">
      <a href="${content.ctaLink}" class="button">${content.ctaText}</a>
    </div>
    ` : ''}
    <div class="footer">
      © ${new Date().getFullYear()} All Rights Reserved
    </div>
  </div>
</body>
</html>`;
}

export function generatePremiumLaunch(content: EmailContent): string {
  const bgColor = content.backgroundColor || '#000000';
  const buttonStyle = getButtonStyle(content.buttonStyle || 'square');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.headline}</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${content.fontFamily}; background: ${bgColor}; }
    .container { max-width: 600px; margin: 0 auto; }
    ${content.imageUrl ? `.hero { width: 100%; display: block; }` : ''}
    .content { padding: 80px 50px; text-align: center; color: #FFFFFF; }
    .headline { font-size: 42px; font-weight: 700; letter-spacing: -1px; margin: 0 0 30px 0; }
    .body { font-size: 18px; line-height: 1.7; margin: 0 0 50px 0; color: #CCCCCC; }
    .button { display: inline-block; padding: 20px 60px; background: ${content.brandColor}; color: #000000; text-decoration: none; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; ${buttonStyle} }
    @media only screen and (max-width: 600px) {
      .content { padding: 50px 30px; }
      .headline { font-size: 32px; }
      .body { font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.headline}" class="hero" />` : ''}
    <div class="content">
      <h1 class="headline">${content.headline}</h1>
      <p class="body">${content.body.replace(/\n/g, '<br>')}</p>
      ${content.ctaText && content.ctaLink ? `
      <a href="${content.ctaLink}" class="button">${content.ctaText}</a>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
}

export function generateBoutiquePromo(content: EmailContent): string {
  const bgColor = content.backgroundColor || '#F9F7F4';
  const buttonStyle = getButtonStyle(content.buttonStyle || 'pill');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.headline}</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${content.fontFamily}; background: ${bgColor}; }
    .container { max-width: 560px; margin: 60px auto; padding: 0 20px; }
    .content { text-align: center; }
    .label { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: ${content.brandColor}; margin-bottom: 20px; }
    .headline { font-size: 36px; font-weight: 400; margin: 0 0 40px 0; color: #2A2A2A; }
    ${content.imageUrl ? `.image-wrapper { margin: 40px 0; } .image { width: 100%; max-width: 400px; display: block; margin: 0 auto; }` : ''}
    .body { font-size: 16px; line-height: 1.9; color: #5A5A5A; margin: 0 0 50px 0; max-width: 440px; margin-left: auto; margin-right: auto; }
    .button { display: inline-block; padding: 14px 40px; border: 2px solid ${content.brandColor}; color: ${content.brandColor}; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; ${buttonStyle} transition: all 0.3s; }
    @media only screen and (max-width: 600px) {
      .container { margin: 40px auto; }
      .headline { font-size: 28px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="label">New Arrival</div>
      <h1 class="headline">${content.headline}</h1>
      ${content.imageUrl ? `
      <div class="image-wrapper">
        <img src="${content.imageUrl}" alt="${content.headline}" class="image" />
      </div>
      ` : ''}
      <p class="body">${content.body.replace(/\n/g, '<br>')}</p>
      ${content.ctaText && content.ctaLink ? `
      <a href="${content.ctaLink}" class="button">${content.ctaText}</a>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
}

export function generateEditorialCommerce(content: EmailContent): string {
  const bgColor = content.backgroundColor || '#FFFFFF';
  const buttonStyle = getButtonStyle(content.buttonStyle || 'rounded');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.headline}</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${content.fontFamily}; background: ${bgColor}; }
    .container { max-width: 600px; margin: 0 auto; }
    ${content.imageUrl ? `.featured-image { width: 100%; display: block; }` : ''}
    .article { padding: 60px 50px; }
    .category { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: ${content.brandColor}; margin-bottom: 15px; font-weight: 600; }
    .headline { font-size: 38px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #1A1A1A; }
    .body { font-size: 17px; line-height: 1.8; color: #4A4A4A; margin: 0 0 40px 0; }
    .divider { width: 60px; height: 2px; background: ${content.brandColor}; margin: 40px 0; }
    .button { display: inline-block; padding: 16px 44px; background: #1A1A1A; color: #FFFFFF; text-decoration: none; font-size: 13px; letter-spacing: 1px; ${buttonStyle} }
    @media only screen and (max-width: 600px) {
      .article { padding: 40px 30px; }
      .headline { font-size: 30px; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.headline}" class="featured-image" />` : ''}
    <div class="article">
      <div class="category">Featured</div>
      <h1 class="headline">${content.headline}</h1>
      <div class="divider"></div>
      <p class="body">${content.body.replace(/\n/g, '<br>')}</p>
      ${content.ctaText && content.ctaLink ? `
      <a href="${content.ctaLink}" class="button">${content.ctaText}</a>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
}

export function generateFounderNote(content: EmailContent): string {
  const bgColor = content.backgroundColor || '#FAFAFA';
  const buttonStyle = getButtonStyle(content.buttonStyle || 'pill');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.headline}</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${content.fontFamily}; background: ${bgColor}; }
    .container { max-width: 540px; margin: 80px auto; padding: 0 20px; }
    .headline { font-size: 24px; font-weight: 500; margin: 0 0 30px 0; color: #2A2A2A; }
    .body { font-size: 16px; line-height: 1.8; color: #4A4A4A; margin: 0 0 30px 0; }
    .signature { margin-top: 50px; font-size: 14px; color: #6A6A6A; }
    .cta { margin-top: 40px; }
    .link { color: ${content.brandColor}; text-decoration: none; font-weight: 500; }
    @media only screen and (max-width: 600px) {
      .container { margin: 50px auto; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="headline">${content.headline}</h1>
    <div class="body">${content.body.replace(/\n/g, '<br>')}</div>
    ${content.ctaText && content.ctaLink ? `
    <div class="cta">
      <a href="${content.ctaLink}" class="link">${content.ctaText} →</a>
    </div>
    ` : ''}
    <div class="signature">
      Best regards,<br>
      <strong>Your Name</strong>
    </div>
  </div>
</body>
</html>`;
}

export function generateMinimalUpdate(content: EmailContent): string {
  const bgColor = content.backgroundColor || '#FFFFFF';
  const buttonStyle = getButtonStyle(content.buttonStyle || 'square');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.headline}</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${content.fontFamily}; background: ${bgColor}; }
    .container { max-width: 480px; margin: 100px auto; padding: 0 20px; }
    .date { font-size: 12px; color: #999999; margin-bottom: 20px; letter-spacing: 1px; }
    .headline { font-size: 28px; font-weight: 600; margin: 0 0 35px 0; color: #1A1A1A; line-height: 1.3; }
    .body { font-size: 16px; line-height: 1.9; color: #4A4A4A; margin: 0; }
    .body p { margin: 0 0 20px 0; }
    ${content.ctaText && content.ctaLink ? `
    .cta-section { margin-top: 50px; padding-top: 50px; border-top: 1px solid #E8E8E8; }
    .button { display: inline-block; padding: 14px 36px; background: ${content.brandColor}; color: #FFFFFF; text-decoration: none; font-size: 13px; letter-spacing: 1px; ${buttonStyle} }
    ` : ''}
    @media only screen and (max-width: 600px) {
      .container { margin: 60px auto; }
      .headline { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    <h1 class="headline">${content.headline}</h1>
    <div class="body">${content.body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</div>
    ${content.ctaText && content.ctaLink ? `
    <div class="cta-section">
      <a href="${content.ctaLink}" class="button">${content.ctaText}</a>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
}

// Template generator function
export function generateLuxuryEmail(templateId: string, content: EmailContent): string {
  switch (templateId) {
    case 'luxury-collection':
      return generateLuxuryCollection(content);
    case 'premium-launch':
      return generatePremiumLaunch(content);
    case 'boutique-promo':
      return generateBoutiquePromo(content);
    case 'editorial-commerce':
      return generateEditorialCommerce(content);
    case 'founder-note':
      return generateFounderNote(content);
    case 'minimal-update':
      return generateMinimalUpdate(content);
    default:
      return generateLuxuryCollection(content);
  }
}
