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
      headerImage,
      brandColor,
      secondaryColor,
      fontFamily,
      footerText,
      buttonColor,
      buttonTextColor,
      textColor,
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
    headerImage,
    brandColor,
    secondaryColor,
    fontFamily,
    footerText,
    buttonColor,
    buttonTextColor,
    textColor,
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
    generatedHtml,
  };
}
