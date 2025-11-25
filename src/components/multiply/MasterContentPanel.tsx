import { Archive, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MasterContent } from "@/types/multiply";

interface MasterContentPanelProps {
    selectedMaster: MasterContent | null;
    isSavingMaster: boolean;
    onSaveToLibrary: () => void;
}

export function MasterContentPanel({
    selectedMaster,
    isSavingMaster,
    onSaveToLibrary
}: MasterContentPanelProps) {
    return (
        <div className="h-full p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                    <h2 className="font-serif text-2xl">Master Content</h2>
                    {selectedMaster && (
                        <Badge variant="secondary" className="text-xs">
                            Using: {selectedMaster.title}
                        </Badge>
                    )}
                </div>
                {selectedMaster && (
                    <Button onClick={onSaveToLibrary} disabled={isSavingMaster} size="sm" variant="outline" className="gap-2">
                        <Archive className="w-4 h-4" />
                        {isSavingMaster ? "Saving..." : "Save"}
                    </Button>
                )}
            </div>

            {selectedMaster ? (
                <Card className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 border-b space-y-2">
                        <h3 className="font-semibold text-lg">{selectedMaster.title}</h3>
                        <div className="flex gap-2">
                            {selectedMaster.contentType && (
                                <Badge variant="secondary">{selectedMaster.contentType}</Badge>
                            )}
                            {selectedMaster.collection && (
                                <Badge variant="outline">{selectedMaster.collection}</Badge>
                            )}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{selectedMaster.wordCount} words</span>
                            <span>{selectedMaster.charCount} characters</span>
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-4">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedMaster.content}</p>
                        </div>
                    </ScrollArea>
                </Card>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Select master content from dropdown above</p>
                    </div>
                </div>
            )}
        </div>
    );
}
