import type { EmailContent } from "./emailTemplates";

export interface SerializedEmailState {
  // Content
  title: string;
  subtitle: string;
  bodyHeader: string;
  content: string;
  
  // CTA
  ctaText: string;
  ctaUrl: string;
  ctaAlignment: 'left' | 'center' | 'right';
  expandButtonOnMobile: boolean;
  
  // Images
  headerImage: string;
  
  // Styling
  brandColor: string;
  secondaryColor: string;
  fontFamily: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  contentAlignment: 'left' | 'center' | 'right';
  
  // Footer
  footerText: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  footerLinkColor: string;
  footerTagline: string;
  companyAddress: string;
  instagramUrl: string;
  facebookUrl: string;
  shopUrl: string;
  aboutUrl: string;
  contactUrl: string;
  privacyUrl: string;
  
  // Template
  selectedTemplate: string;
  
  // Generated HTML (critical for sending!)
  generatedHtml: string;
}

export function serializeEmailState(composerState: EmailContent & { generatedHtml: string }): string {
  const state: SerializedEmailState = {
    title: composerState.title || '',
    subtitle: composerState.subtitle || '',
    bodyHeader: composerState.bodyHeader || '',
    content: composerState.content || '',
    ctaText: composerState.ctaText || '',
    ctaUrl: composerState.ctaUrl || '',
    ctaAlignment: composerState.ctaAlignment || 'center',
    expandButtonOnMobile: composerState.expandButtonOnMobile || false,
    headerImage: composerState.headerImage || '',
    brandColor: composerState.brandColor || '#B8956A',
    secondaryColor: composerState.secondaryColor || '#f8f8f8',
    fontFamily: composerState.fontFamily || 'Georgia, serif',
    buttonColor: composerState.buttonColor || '',
    buttonTextColor: composerState.buttonTextColor || '#ffffff',
    textColor: composerState.textColor || '#555555',
    contentAlignment: composerState.contentAlignment || 'left',
    footerText: composerState.footerText || '',
    footerBackgroundColor: composerState.footerBackgroundColor || '#F8F8F8',
    footerTextColor: composerState.footerTextColor || '#666666',
    footerLinkColor: composerState.footerLinkColor || '#B8956A',
    footerTagline: composerState.footerTagline || '',
    companyAddress: composerState.companyAddress || '',
    instagramUrl: composerState.instagramUrl || '',
    facebookUrl: composerState.facebookUrl || '',
    shopUrl: composerState.shopUrl || '',
    aboutUrl: composerState.aboutUrl || '',
    contactUrl: composerState.contactUrl || '',
    privacyUrl: composerState.privacyUrl || '',
    selectedTemplate: composerState.template || 'newsletter',
    generatedHtml: composerState.generatedHtml || ''
  };
  
  return JSON.stringify(state);
}

export function deserializeEmailState(jsonString: string): Partial<EmailContent> & { generatedHtml?: string } {
  try {
    const state: SerializedEmailState = JSON.parse(jsonString);
    return {
      title: state.title,
      subtitle: state.subtitle,
      bodyHeader: state.bodyHeader,
      content: state.content,
      ctaText: state.ctaText,
      ctaUrl: state.ctaUrl,
      ctaAlignment: state.ctaAlignment,
      expandButtonOnMobile: state.expandButtonOnMobile,
      headerImage: state.headerImage,
      brandColor: state.brandColor,
      secondaryColor: state.secondaryColor,
      fontFamily: state.fontFamily,
      buttonColor: state.buttonColor,
      buttonTextColor: state.buttonTextColor,
      textColor: state.textColor,
      contentAlignment: state.contentAlignment,
      footerText: state.footerText,
      footerBackgroundColor: state.footerBackgroundColor,
      footerTextColor: state.footerTextColor,
      footerLinkColor: state.footerLinkColor,
      footerTagline: state.footerTagline,
      companyAddress: state.companyAddress,
      instagramUrl: state.instagramUrl,
      facebookUrl: state.facebookUrl,
      shopUrl: state.shopUrl,
      aboutUrl: state.aboutUrl,
      contactUrl: state.contactUrl,
      privacyUrl: state.privacyUrl,
      template: state.selectedTemplate,
      generatedHtml: state.generatedHtml
    };
  } catch (error) {
    console.error('Failed to deserialize email state:', error);
    return {};
  }
}
