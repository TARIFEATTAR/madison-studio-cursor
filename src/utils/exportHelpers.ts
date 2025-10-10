import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { stripMarkdown } from './forgeHelpers';

interface ExportMetadata {
  title: string;
  contentType?: string;
  collection?: string;
  dipWeek?: number | null;
  createdAt: string;
  wordCount?: number;
  organizationName?: string;
  brandColor?: string;
  logoBase64?: string;
}

export const generateFilename = (contentType: string, title: string, date: string, extension: string): string => {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  const cleanDate = new Date(date).toISOString().split('T')[0];
  return `scriptora-${contentType}-${cleanTitle}-${cleanDate}.${extension}`;
};

export const exportAsText = (content: string, metadata: ExportMetadata): void => {
  const cleanContent = stripMarkdown(content);
  const textContent = `${metadata.title}\n${'='.repeat(metadata.title.length)}\n\n${cleanContent}`;
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = generateFilename(metadata.contentType || 'content', metadata.title, metadata.createdAt, 'txt');
  link.click();
  URL.revokeObjectURL(url);
};

export const exportAsPDF = (content: string, metadata: ExportMetadata): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = margin;

  // Brand color (default to brass if not provided)
  const brandHex = metadata.brandColor || '#B8956A';
  const brandRgb = hexToRgb(brandHex);

  // Add logo if provided
  if (metadata.logoBase64) {
    try {
      doc.addImage(metadata.logoBase64, 'PNG', margin, yPosition, 40, 10);
      yPosition += 15;
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  // Organization name (if provided)
  if (metadata.organizationName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
    doc.text(metadata.organizationName, margin, yPosition);
    yPosition += 8;
  }

  // Decorative line in brand color
  doc.setDrawColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  const titleLines = doc.splitTextToSize(metadata.title, contentWidth);
  doc.text(titleLines, margin, yPosition);
  yPosition += (titleLines.length * 10) + 8;

  // Metadata badges
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const badges: string[] = [];
  if (metadata.contentType) badges.push(`Type: ${metadata.contentType}`);
  if (metadata.collection) badges.push(`Collection: ${metadata.collection}`);
  if (metadata.dipWeek) badges.push(`DIP Week: ${metadata.dipWeek}`);
  if (metadata.createdAt) badges.push(`Created: ${new Date(metadata.createdAt).toLocaleDateString()}`);
  if (metadata.wordCount) badges.push(`Words: ${metadata.wordCount}`);
  
  // Draw metadata badges with subtle background
  let xOffset = margin;
  badges.forEach((badge, index) => {
    const textWidth = doc.getTextWidth(badge);
    const badgePadding = 3;
    const badgeWidth = textWidth + (badgePadding * 2);
    
    // Draw badge background
    doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b, 0.1);
    doc.roundedRect(xOffset, yPosition - 4, badgeWidth, 6, 1, 1, 'F');
    
    // Draw badge text
    doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
    doc.text(badge, xOffset + badgePadding, yPosition);
    
    xOffset += badgeWidth + 4;
    
    // Wrap to next line if needed
    if (xOffset > pageWidth - margin - 40 && index < badges.length - 1) {
      xOffset = margin;
      yPosition += 8;
    }
  });
  
  yPosition += 10;

  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Content
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const cleanContent = stripMarkdown(content);
  const contentLines = doc.splitTextToSize(cleanContent, contentWidth);
  
  contentLines.forEach((line: string) => {
    if (yPosition > pageHeight - margin - 15) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  // Footer with branding on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    
    // Left: Organization name
    if (metadata.organizationName) {
      doc.text(metadata.organizationName, margin, pageHeight - 10);
    }
    
    // Center: "Created with Scriptora"
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Created with Scriptora',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Right: Page numbers
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  doc.save(generateFilename(metadata.contentType || 'content', metadata.title, metadata.createdAt, 'pdf'));
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  
  return { r: 184, g: 149, b: 106 };
}

export const exportAsDocx = async (content: string, metadata: ExportMetadata): Promise<void> => {
  const cleanContent = stripMarkdown(content);
  
  const children: Paragraph[] = [];

  // Organization name header if provided
  if (metadata.organizationName) {
    children.push(
      new Paragraph({
        text: metadata.organizationName,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: metadata.organizationName,
            size: 20,
            color: metadata.brandColor?.replace('#', '') || 'B8956A',
            bold: true,
          }),
        ],
      })
    );
  }

  // Title
  children.push(
    new Paragraph({
      text: metadata.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );
  
  // Metadata
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: [
            metadata.contentType && `Type: ${metadata.contentType}`,
            metadata.collection && `Collection: ${metadata.collection}`,
            metadata.dipWeek && `DIP Week: ${metadata.dipWeek}`,
            metadata.createdAt && `Created: ${new Date(metadata.createdAt).toLocaleDateString()}`,
            metadata.wordCount && `Words: ${metadata.wordCount}`,
          ].filter(Boolean).join(' • '),
          size: 18,
          color: '666666',
        }),
      ],
      spacing: { after: 300 },
    })
  );
  
  // Content paragraphs
  cleanContent.split('\n\n').forEach(para => {
    children.push(
      new Paragraph({
        text: para,
        spacing: { after: 200 },
      })
    );
  });
  
  // Footer
  children.push(
    new Paragraph({
      text: 'Created with Scriptora',
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: `Created with Scriptora${metadata.organizationName ? ' • ' + metadata.organizationName : ''}`,
          size: 16,
          color: '999999',
          italics: true,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = generateFilename(metadata.contentType || 'content', metadata.title, metadata.createdAt, 'docx');
  link.click();
  URL.revokeObjectURL(url);
};
