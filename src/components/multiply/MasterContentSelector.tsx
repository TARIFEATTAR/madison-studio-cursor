import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MasterContent } from "@/types/multiply";

interface MasterContentSelectorProps {
    loadingContent: boolean;
    selectedMaster: MasterContent | null;
    masterContentList: MasterContent[];
    onSelectMaster: (content: MasterContent) => void;
}

export function MasterContentSelector({
    loadingContent,
    selectedMaster,
    masterContentList,
    onSelectMaster
}: MasterContentSelectorProps) {
    return (
        <Card className="p-4 mb-6" data-tooltip-target="master-content-selector">
            <div className="flex items-center gap-4">
                <Label className="text-sm font-medium whitespace-nowrap">Master Content:</Label>
                {loadingContent ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Select
                        value={selectedMaster?.id || ""}
                        onValueChange={(id) => {
                            const content = masterContentList.find(c => c.id === id);
                            if (content) onSelectMaster(content);
                        }}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select master content..." />
                        </SelectTrigger>
                        <SelectContent>
                            {masterContentList.map((content) => (
                                <SelectItem key={content.id} value={content.id}>
                                    {content.title} ({content.wordCount} words)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </Card>
    );
}
