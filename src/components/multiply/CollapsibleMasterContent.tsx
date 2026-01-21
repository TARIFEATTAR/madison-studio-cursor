/**
 * CollapsibleMasterContent
 *
 * Phase 1 component for the Multiply page UX redesign.
 * Reduces cognitive load by showing master content collapsed by default,
 * with title, type, word count, and timestamp visible.
 *
 * Users can expand to see full content if needed.
 */

import { useState, useEffect } from "react";
import { FileText, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MasterContent {
    id: string;
    title: string;
    contentType: string;
    collection?: string;
    content: string;
    wordCount: number;
    charCount: number;
    createdAt?: string;
}

interface CollapsibleMasterContentProps {
    content: MasterContent;
    defaultExpanded?: boolean;
    className?: string;
}

const STORAGE_KEY = "multiply_master_expanded";

export function CollapsibleMasterContent({
    content,
    defaultExpanded = false,
    className,
}: CollapsibleMasterContentProps) {
    // Persist user preference
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === "undefined") return defaultExpanded;
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? stored === "true" : defaultExpanded;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, String(isOpen));
    }, [isOpen]);

    // Format relative time
    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
            <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:border-aged-brass/50 transition-all group">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-aged-brass/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-aged-brass" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-serif text-lg font-medium truncate">
                                    {content.title || "Untitled Content"}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary" className="text-xs">
                                        {content.contentType || "Content"}
                                    </Badge>
                                    <span>•</span>
                                    <span>{content.wordCount.toLocaleString()} words</span>
                                    <span>•</span>
                                    <span>{formatRelativeTime(content.createdAt)}</span>
                                </p>
                            </div>
                        </div>
                        <ChevronDown
                            className={cn(
                                "h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-4",
                                isOpen && "rotate-180"
                            )}
                        />
                    </CardContent>
                </Card>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <Card className="mt-1 border-t-0 rounded-t-none overflow-hidden">
                    <ScrollArea className="max-h-[300px]">
                        <CardContent className="p-4">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                                    {content.content}
                                </p>
                            </div>
                        </CardContent>
                    </ScrollArea>
                    {content.collection && (
                        <div className="px-4 pb-3 border-t pt-3">
                            <Badge variant="outline" className="text-xs">
                                Collection: {content.collection}
                            </Badge>
                        </div>
                    )}
                </Card>
            </CollapsibleContent>
        </Collapsible>
    );
}
