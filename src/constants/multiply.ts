import {
    Mail, Instagram, Tag, Briefcase, Video, Share2,
    FileText, MessageSquare
} from "lucide-react";
import { DerivativeType } from "@/types/multiply";

export const TOP_DERIVATIVE_TYPES: DerivativeType[] = [
    {
        id: "email_3part",
        name: "3-Part Email Series",
        description: "Sequential email nurture campaign",
        icon: Mail,
        iconColor: "#8B7355",
        isSequence: true,
    },
    {
        id: "instagram",
        name: "Instagram",
        description: "Instagram posts and captions",
        icon: Instagram,
        iconColor: "#E4405F",
        charLimit: 2200,
    },
    {
        id: "product",
        name: "Product Description",
        description: "Product page descriptions",
        icon: Tag,
        iconColor: "#3A4A3D",
        charLimit: 500,
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        description: "Professional network posts",
        icon: Briefcase,
        iconColor: "#0A66C2",
        charLimit: 3000,
    },
    {
        id: "youtube",
        name: "YouTube",
        description: "Video descriptions & scripts",
        icon: Video,
        iconColor: "#FF0000",
        charLimit: 5000,
    },
    {
        id: "facebook",
        name: "Facebook",
        description: "Community engagement posts",
        icon: Share2,
        iconColor: "#1877F2",
        charLimit: 2000,
    },
];

export const ADDITIONAL_DERIVATIVE_TYPES: DerivativeType[] = [
    {
        id: "email",
        name: "Email",
        description: "Newsletter-style email",
        icon: Mail,
        iconColor: "#B8956A",
        charLimit: 2000,
    },
    {
        id: "pinterest",
        name: "Pinterest",
        description: "Pinterest pin descriptions",
        icon: FileText,
        iconColor: "#E60023",
        charLimit: 500,
    },
    {
        id: "sms",
        name: "SMS",
        description: "SMS marketing messages",
        icon: MessageSquare,
        iconColor: "#6B2C3E",
        charLimit: 160,
    },
    {
        id: "tiktok",
        name: "TikTok",
        description: "TikTok video scripts",
        icon: Video,
        iconColor: "#000000",
        charLimit: 300,
    },
    {
        id: "email_5part",
        name: "5-Part Email Series",
        description: "Extended email sequence",
        icon: Mail,
        iconColor: "#A0826D",
        isSequence: true,
    },
    {
        id: "email_7part",
        name: "7-Part Email Series",
        description: "Comprehensive email journey",
        icon: Mail,
        iconColor: "#6B5D52",
        isSequence: true,
    },
];

export const DERIVATIVE_TYPES = [...TOP_DERIVATIVE_TYPES, ...ADDITIONAL_DERIVATIVE_TYPES];
