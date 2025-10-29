import { useState, useEffect } from "react";
import { generateEmailFromTemplate } from "@/utils/emailTemplates";
import type { EmailContent } from "@/utils/emailTemplates";

export function useEmailComposer(initialContent?: Partial<EmailContent>) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("newsletter");
  const [title, setTitle] = useState(initialContent?.title || "");
  const [subtitle, setSubtitle] = useState(initialContent?.subtitle || "");
  const [content, setContent] = useState(initialContent?.content || "");
  const [ctaText, setCtaText] = useState(initialContent?.ctaText || "");
  const [ctaUrl, setCtaUrl] = useState(initialContent?.ctaUrl || "");
  const [headerImage, setHeaderImage] = useState(initialContent?.headerImage || "");
  const [brandColor, setBrandColor] = useState(initialContent?.brandColor || "#B8956A");
  const [secondaryColor, setSecondaryColor] = useState(initialContent?.secondaryColor || "#f8f8f8");
  const [fontFamily, setFontFamily] = useState(initialContent?.fontFamily || "Georgia, serif");
  const [footerText, setFooterText] = useState(initialContent?.footerText || "");
  const [buttonColor, setButtonColor] = useState(initialContent?.buttonColor || "");
  const [buttonTextColor, setButtonTextColor] = useState(initialContent?.buttonTextColor || "#ffffff");
  const [textColor, setTextColor] = useState(initialContent?.textColor || "#555555");
  
  // Footer customization
  const [footerBackgroundColor, setFooterBackgroundColor] = useState(initialContent?.footerBackgroundColor || "#F8F8F8");
  const [footerTextColor, setFooterTextColor] = useState(initialContent?.footerTextColor || "#666666");
  const [footerLinkColor, setFooterLinkColor] = useState(initialContent?.footerLinkColor || "#B8956A");
  
  // Footer content
  const [footerTagline, setFooterTagline] = useState(initialContent?.footerTagline || "");
  const [companyAddress, setCompanyAddress] = useState(initialContent?.companyAddress || "");
  const [instagramUrl, setInstagramUrl] = useState(initialContent?.instagramUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(initialContent?.facebookUrl || "");
  const [shopUrl, setShopUrl] = useState(initialContent?.shopUrl || "");
  const [aboutUrl, setAboutUrl] = useState(initialContent?.aboutUrl || "");
  const [contactUrl, setContactUrl] = useState(initialContent?.contactUrl || "");
  const [privacyUrl, setPrivacyUrl] = useState(initialContent?.privacyUrl || "");
  
  // CTA Button alignment
  const [ctaAlignment, setCtaAlignment] = useState<'left' | 'center' | 'right'>(initialContent?.ctaAlignment || 'center');
  const [expandButtonOnMobile, setExpandButtonOnMobile] = useState(initialContent?.expandButtonOnMobile || false);
  
  const [generatedHtml, setGeneratedHtml] = useState("");

  // Generate HTML whenever any content changes
  useEffect(() => {
    const emailContent: EmailContent = {
      template: selectedTemplate,
      title,
      subtitle,
      content,
      ctaText,
      ctaUrl,
      ctaAlignment,
      expandButtonOnMobile,
      headerImage,
      brandColor,
      secondaryColor,
      fontFamily,
      footerText,
      buttonColor,
      buttonTextColor,
      textColor,
      footerBackgroundColor,
      footerTextColor,
      footerLinkColor,
      footerTagline,
      companyAddress,
      instagramUrl,
      facebookUrl,
      shopUrl,
      aboutUrl,
      contactUrl,
      privacyUrl,
    };

    const html = generateEmailFromTemplate(selectedTemplate, emailContent);
    setGeneratedHtml(html);
  }, [
    selectedTemplate,
    title,
    subtitle,
    content,
    ctaText,
    ctaUrl,
    ctaAlignment,
    expandButtonOnMobile,
    headerImage,
    brandColor,
    secondaryColor,
    fontFamily,
    footerText,
    buttonColor,
    buttonTextColor,
    textColor,
    footerBackgroundColor,
    footerTextColor,
    footerLinkColor,
    footerTagline,
    companyAddress,
    instagramUrl,
    facebookUrl,
    shopUrl,
    aboutUrl,
    contactUrl,
    privacyUrl,
  ]);

  return {
    selectedTemplate,
    setSelectedTemplate,
    title,
    setTitle,
    subtitle,
    setSubtitle,
    content,
    setContent,
    ctaText,
    setCtaText,
    ctaUrl,
    setCtaUrl,
    headerImage,
    setHeaderImage,
    brandColor,
    setBrandColor,
    secondaryColor,
    setSecondaryColor,
    fontFamily,
    setFontFamily,
    footerText,
    setFooterText,
    buttonColor,
    setButtonColor,
    buttonTextColor,
    setButtonTextColor,
    textColor,
    setTextColor,
    footerBackgroundColor,
    setFooterBackgroundColor,
    footerTextColor,
    setFooterTextColor,
    footerLinkColor,
    setFooterLinkColor,
    footerTagline,
    setFooterTagline,
    companyAddress,
    setCompanyAddress,
    instagramUrl,
    setInstagramUrl,
    facebookUrl,
    setFacebookUrl,
    shopUrl,
    setShopUrl,
    aboutUrl,
    setAboutUrl,
    contactUrl,
    setContactUrl,
    privacyUrl,
    setPrivacyUrl,
    ctaAlignment,
    setCtaAlignment,
    expandButtonOnMobile,
    setExpandButtonOnMobile,
    generatedHtml,
  };
}
