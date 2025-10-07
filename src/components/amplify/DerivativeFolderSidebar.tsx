import { Mail, Instagram, Twitter, Package, MessageSquare, Linkedin, Layers, ChevronRight } from "lucide-react";
import { DerivativeTypeFolder } from "./DerivativeTypeFolder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DerivativeFolderSidebarProps {
  selectedFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  folderCounts: Record<string, number>;
  selectedMasterTitle: string | null;
  onOpenMasterSwitcher: () => void;
}

const FOLDER_CONFIG = [
  { 
    id: 'email', 
    label: 'Email', 
    icon: Mail, 
    colorClass: 'bg-[hsl(217,91%,60%)]/10 text-[hsl(217,91%,60%)]' 
  },
  { 
    id: 'instagram', 
    label: 'Instagram', 
    icon: Instagram, 
    colorClass: 'bg-[hsl(291,64%,42%)]/10 text-[hsl(291,64%,42%)]' 
  },
  { 
    id: 'twitter', 
    label: 'Twitter', 
    icon: Twitter, 
    colorClass: 'bg-[hsl(199,89%,48%)]/10 text-[hsl(199,89%,48%)]' 
  },
  { 
    id: 'product', 
    label: 'Product', 
    icon: Package, 
    colorClass: 'bg-[hsl(25,95%,53%)]/10 text-[hsl(25,95%,53%)]' 
  },
  { 
    id: 'sms', 
    label: 'SMS', 
    icon: MessageSquare, 
    colorClass: 'bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,45%)]' 
  },
  { 
    id: 'linkedin', 
    label: 'LinkedIn', 
    icon: Linkedin, 
    colorClass: 'bg-[hsl(221,83%,53%)]/10 text-[hsl(221,83%,53%)]' 
  },
];

export function DerivativeFolderSidebar({
  selectedFolder,
  onSelectFolder,
  folderCounts,
  selectedMasterTitle,
  onOpenMasterSwitcher,
}: DerivativeFolderSidebarProps) {
  const totalCount = Object.values(folderCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="h-full flex flex-col bg-background/50 border-r border-border/20">
      {/* Selected Master Content Display */}
      <div className="p-4 border-b border-border/20 space-y-3">
        <div>
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-medium">
            Current Content
          </h2>
          {selectedMasterTitle ? (
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                  {selectedMasterTitle}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No content selected</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={onOpenMasterSwitcher}
        >
          Switch Content
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Derivative Type Filters */}
      <div className="p-4 border-b border-border/20">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium">
          Filter by Type
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {/* All Derivatives Option */}
          <DerivativeTypeFolder
            icon={Layers}
            label="All Derivatives"
            count={totalCount}
            isActive={selectedFolder === null}
            onClick={() => onSelectFolder(null)}
            colorClass="bg-primary/10 text-primary"
          />

          <div className="h-px bg-border/20 my-3" />

          {/* Individual Type Folders */}
          {FOLDER_CONFIG.map((folder) => (
            <DerivativeTypeFolder
              key={folder.id}
              icon={folder.icon}
              label={folder.label}
              count={folderCounts[folder.id] || 0}
              isActive={selectedFolder === folder.id}
              onClick={() => onSelectFolder(folder.id)}
              colorClass={folder.colorClass}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
