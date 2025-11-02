import { EmailBlock, EmailComposition } from "@/types/emailBlocks";

function formatText(text: string): string {
  // Convert markdown-style formatting to HTML
  let formatted = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/\*(.+?)\*/g, '<em>$1</em>') // *italic*
    .replace(/^- (.+)$/gm, '<li>$1</li>') // - bullet list
    .replace(/^• (.+)$/gm, '<li>$1</li>'); // • bullet list

  // Wrap consecutive <li> in <ul>
  formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  
  // Convert line breaks to <br>
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
}

function getButtonStyle(style: 'square' | 'rounded' | 'pill'): string {
  switch (style) {
    case 'square': return 'border-radius: 0px;';
    case 'rounded': return 'border-radius: 4px;';
    case 'pill': return 'border-radius: 50px;';
    default: return 'border-radius: 4px;';
  }
}

function blockToHtml(block: EmailBlock, brandColor: string): string {
  const bgStyle = block.backgroundColor ? `background-color: ${block.backgroundColor};` : '';
  const padding = bgStyle ? 'padding: 30px;' : '';

  switch (block.type) {
    case 'headline': {
      const sizes = {
        small: '24px',
        medium: '32px',
        large: '42px'
      };
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${bgStyle}">
          <tr>
            <td style="text-align: ${block.alignment}; ${padding}">
              <h1 style="font-size: ${sizes[block.size]}; margin: 0; font-weight: 600; color: #1A1A1A;">
                ${block.text}
              </h1>
            </td>
          </tr>
        </table>
      `;
    }

    case 'image': {
      const alignStyle = block.alignment === 'center' ? 'margin: 0 auto;' : 
                        block.alignment === 'right' ? 'margin-left: auto;' : '';
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${bgStyle}">
          <tr>
            <td style="text-align: ${block.alignment}; ${padding}">
              <img src="${block.url}" alt="${block.alt}" style="max-width: 100%; height: auto; display: block; ${alignStyle}" />
            </td>
          </tr>
        </table>
      `;
    }

    case 'text': {
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${bgStyle}">
          <tr>
            <td style="text-align: ${block.alignment}; ${padding}">
              <div style="font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                ${formatText(block.content)}
              </div>
            </td>
          </tr>
        </table>
      `;
    }

    case 'button': {
      const buttonStyle = getButtonStyle(block.style);
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${bgStyle}">
          <tr>
            <td style="text-align: ${block.alignment}; ${padding} padding-top: 20px; padding-bottom: 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 ${block.alignment === 'center' ? 'auto' : block.alignment === 'right' ? '0 0 auto' : '0 auto 0 0'};">
                <tr>
                  <td>
                    <a href="${block.url}" style="display: inline-block; padding: 14px 32px; background-color: ${brandColor}; color: #FFFFFF; text-decoration: none; font-weight: 600; ${buttonStyle}">${block.text}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    case 'divider': {
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 20px 0;">
              <div style="border-top: ${block.thickness || 1}px solid ${block.color || '#DDDDDD'}; width: 100%;"></div>
            </td>
          </tr>
        </table>
      `;
    }

    case 'spacer': {
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="height: ${block.height}px; line-height: ${block.height}px;">&nbsp;</td>
          </tr>
        </table>
      `;
    }

    default:
      return '';
  }
}

export function compositionToHtml(composition: EmailComposition): string {
  const { globalStyles, blocks } = composition;
  
  const blocksHtml = blocks.map(block => blockToHtml(block, globalStyles.brandColor)).join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${globalStyles.fontFamily}; background-color: ${globalStyles.backgroundColor}; }
    table { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    .email-container { max-width: 600px; margin: 0 auto; }
    ul { margin: 0; padding-left: 20px; }
    ul li { margin-bottom: 8px; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      table[class="email-container"] { width: 100% !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: ${globalStyles.padding}px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="background-color: #FFFFFF;">
          <tr>
            <td>
              ${blocksHtml}
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

export function compositionToPlainText(composition: EmailComposition): string {
  return composition.blocks.map(block => {
    switch (block.type) {
      case 'headline':
        return `\n${block.text.toUpperCase()}\n${'='.repeat(block.text.length)}\n`;
      case 'text':
        return `\n${block.content.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/\*/g, '')}\n`;
      case 'button':
        return `\n[${block.text}]\n${block.url}\n`;
      case 'divider':
        return `\n${'─'.repeat(50)}\n`;
      case 'spacer':
        return '\n\n';
      case 'image':
        return `\n[Image: ${block.alt}]\n`;
      default:
        return '';
    }
  }).join('');
}
