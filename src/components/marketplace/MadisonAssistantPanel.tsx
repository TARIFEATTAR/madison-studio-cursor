import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Tag, FileText, Send } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MadisonAssistantPanelProps {
  platform: string;
  formData: any;
  onUpdateField: (updates: any) => void;
}

export function MadisonAssistantPanel({ platform, formData, onUpdateField }: MadisonAssistantPanelProps) {
  const [message, setMessage] = useState("");

  const handleQuickAction = (action: string) => {
    // TODO: Implement AI generation
    console.log("Quick action:", action);
  };

  return (
    <Card className="border-aged-brass/20 sticky top-6 h-[calc(100vh-8rem)]">
      <CardHeader className="border-b border-aged-brass/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-aged-brass flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-black">Madison</h3>
            <p className="text-xs text-charcoal/60">Your Editorial Assistant</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
        {/* Quick Actions */}
        <div className="p-4 border-b border-aged-brass/10">
          <p className="text-xs font-medium text-charcoal/70 mb-3 uppercase tracking-wide">Quick Actions</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-aged-brass border-aged-brass/30 hover:bg-aged-brass/10"
              onClick={() => handleQuickAction("description")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Description
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleQuickAction("tags")}
            >
              <Tag className="w-4 h-4 mr-2" />
              Suggest Tags
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleQuickAction("title")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Optimize Title
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="bg-aged-brass/5 rounded-lg p-4 border border-aged-brass/10">
              <p className="text-sm text-ink-black leading-relaxed">
                <span className="font-semibold">Hello! I'm Madison, your editorial assistant.</span> I can help you create an 
                Etsy-optimized listing that maintains your brand voice while maximizing discoverability.
              </p>
              <p className="text-sm text-charcoal/80 mt-3 leading-relaxed">
                I see you're creating a listing for <span className="font-medium">
                  {formData.productId ? "a product from your catalog" : "a new product"}
                </span>. 
                I can help you craft compelling copy that tells your product's story.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-aged-brass/10">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Madison for help..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // TODO: Handle message send
                  setMessage("");
                }
              }}
            />
            <Button 
              size="icon"
              className="bg-aged-brass hover:bg-aged-brass/90 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
