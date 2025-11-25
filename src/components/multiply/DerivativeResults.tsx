import {
    ChevronDown, ChevronRight, CheckCircle2, XCircle,
    FileText, Copy, Edit, Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScheduleButton } from "@/components/forge/ScheduleButton";
import { DerivativeContent, DerivativeType, MasterContent } from "@/types/multiply";

interface DerivativeResultsProps {
    derivativesByType: Record<string, DerivativeContent[]>;
    derivativeTypes: DerivativeType[];
    expandedTypes: Set<string>;
    onToggleExpanded: (typeId: string) => void;
    onOpenModal: (derivative: DerivativeContent) => void;
    onCopyToClipboard: (content: string) => void;
    onOpenDirector: (derivative: DerivativeContent) => void;
    selectedMaster: MasterContent | null;
    onSaveDerivative: (derivative: DerivativeContent, title: string) => void;
}

export function DerivativeResults({
    derivativesByType,
    derivativeTypes,
    expandedTypes,
    onToggleExpanded,
    onOpenModal,
    onCopyToClipboard,
    onOpenDirector,
    selectedMaster,
    onSaveDerivative
}: DerivativeResultsProps) {
    if (Object.keys(derivativesByType).length === 0) return null;

    return (
        <div className="space-y-4 pt-6 border-t">
            <h3 className="font-serif text-xl">Generated Derivatives</h3>
            <div className="space-y-4">
                {Object.entries(derivativesByType).map(([typeId, derivs]) => {
                    const type = derivativeTypes.find(t => t.id === typeId);
                    if (!type) return null;

                    const Icon = type.icon;
                    const isExpanded = expandedTypes.has(typeId);

                    return (
                        <div key={typeId} className="border rounded-lg overflow-hidden">
                            <button
                                onClick={() => onToggleExpanded(typeId)}
                                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {Icon && (
                                        <Icon className="w-6 h-6" style={{ color: type.iconColor }} strokeWidth={1} />
                                    )}
                                    <div className="text-left">
                                        <h3 className="font-medium">{type.name}</h3>
                                        <p className="text-sm text-muted-foreground">{derivs.length} generated</p>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>

                            {isExpanded && (
                                <div className="p-4 space-y-3 bg-muted/20">
                                    {derivs.map((deriv) => (
                                        <Card key={deriv.id} className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={deriv.status === "approved" ? "default" : deriv.status === "rejected" ? "destructive" : "secondary"}>
                                                        {deriv.status === "approved" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                        {deriv.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                                        {deriv.status}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {deriv.charCount} chars
                                                        {type.charLimit && ` / ${type.charLimit}`}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onOpenModal(deriv)}
                                                        title="View full details"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => onCopyToClipboard(deriv.content)}>
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onOpenDirector(deriv)}
                                                        title="Open AI Director"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <ScheduleButton
                                                        contentTitle={type.name}
                                                        contentType={deriv.asset_type || type.id}
                                                        variant="ghost"
                                                        size="sm"
                                                        derivativeAsset={{
                                                            id: deriv.id,
                                                            master_content_id: selectedMaster?.id || '',
                                                            asset_type: deriv.asset_type || type.id,
                                                            generated_content: deriv.generated_content || deriv.content,
                                                            platform_specs: deriv.platformSpecs || {}
                                                        }}
                                                        masterContent={selectedMaster ? {
                                                            id: selectedMaster.id,
                                                            title: selectedMaster.title,
                                                            content_type: selectedMaster.contentType
                                                        } : undefined}
                                                    />
                                                    <Button variant="ghost" size="sm" onClick={() => onSaveDerivative(deriv, type.name)}>
                                                        <Archive className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {deriv.isSequence && deriv.sequenceEmails ? (
                                                <div className="space-y-2">
                                                    {deriv.sequenceEmails.map((email) => (
                                                        <div key={email.id} className="p-3 bg-background rounded border">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant="outline">Email {email.sequenceNumber}</Badge>
                                                                <span className="text-sm font-medium">{email.subject}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">{email.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap line-clamp-4">{deriv.content}</p>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
