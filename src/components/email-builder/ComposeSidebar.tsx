import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, AlignLeft, Image, Type, MousePointer, Minus, Space } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmailBlock, BlockType } from "@/types/emailBlocks";
import { ContentPicker } from "@/components/email-composer/ContentPicker";
import { MadisonSuggestions } from "@/components/email-composer/MadisonSuggestions";
import { useState } from "react";

interface ComposeSidebarProps {
  onAddBlock: (type: BlockType) => void;
  currentBlocks: EmailBlock[];
}

export function ComposeSidebar({ onAddBlock, currentBlocks }: ComposeSidebarProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const blockTypes = [
    { type: 'headline' as BlockType, icon: Type, label: 'Headline' },
    { type: 'image' as BlockType, icon: Image, label: 'Image' },
    { type: 'text' as BlockType, icon: AlignLeft, label: 'Text' },
    { type: 'button' as BlockType, icon: MousePointer, label: 'Button' },
    { type: 'divider' as BlockType, icon: Minus, label: 'Divider' },
    { type: 'spacer' as BlockType, icon: Space, label: 'Spacer' },
  ];

  const handleAddBlock = (type: BlockType) => {
    onAddBlock(type);
    if (isMobile) {
      setOpen(false);
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="blocks" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
          <TabsTrigger value="madison">Madison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blocks" className="flex-1 mt-4">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Add content blocks to build your email
              </p>
              {blockTypes.map((block) => (
                <Button
                  key={block.type}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => handleAddBlock(block.type)}
                >
                  <block.icon className="w-4 h-4" />
                  {block.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="archive" className="flex-1 mt-4">
          <ScrollArea className="h-full pr-4">
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>Select from your content library</p>
              <p className="text-xs mt-2">Archive integration coming soon</p>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="madison" className="flex-1 mt-4">
          <ScrollArea className="h-full pr-4">
            <MadisonSuggestions
              onSelectHeadline={(headline) => {
                onAddBlock('headline');
                if (isMobile) setOpen(false);
              }}
              onSelectCTA={(cta) => {
                onAddBlock('button');
                if (isMobile) setOpen(false);
              }}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Add Content</SheetTitle>
            </SheetHeader>
            <div className="mt-4 h-[calc(80vh-80px)]">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-background p-6 h-full">
      {sidebarContent}
    </div>
  );
}
