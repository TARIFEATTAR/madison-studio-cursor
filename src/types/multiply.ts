export interface MasterContent {
    id: string;
    title: string;
    contentType: string;
    collection?: string;
    content: string;
    wordCount: number;
    charCount: number;
}

import { LucideIcon } from "lucide-react";

export interface DerivativeType {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    iconColor: string;
    charLimit?: number;
    isSequence?: boolean;
    iconImage?: string;
}

export interface DerivativeContent {
    id: string;
    typeId: string;
    content: string;
    status: "pending" | "approved" | "rejected";
    charCount: number;
    isSequence?: boolean;
    master_content_id?: string;
    sequenceEmails?: {
        id: string;
        sequenceNumber: number;
        subject: string;
        preview: string;
        content: string;
        charCount: number;
    }[];
    platformSpecs?: Record<string, unknown>;
    asset_type?: string;
    generated_content?: string;
}

export interface RawEmailSpec {
    subject?: string;
    preview?: string;
    body?: string;
}

export interface RawDerivativeResponse {
    id: string;
    generated_content?: string;
    asset_type?: string;
    approval_status?: string;
    master_content_id?: string;
    platform_specs?: {
        emails?: RawEmailSpec[];
        [key: string]: unknown;
    };
}
