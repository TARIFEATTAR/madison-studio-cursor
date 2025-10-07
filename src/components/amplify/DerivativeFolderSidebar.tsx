import { Mail, Instagram, Twitter, Package, MessageSquare, Linkedin, Layers } from "lucide-react";
import { DerivativeTypeFolder } from "./DerivativeTypeFolder";
import { MasterContentLibrarySection } from "./MasterContentLibrarySection";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MasterContent {
  id: string;
  title: string;
  content_type: string;
  full_content: string;
  word_count: number;
  collection: string | null;
  dip_week: number | null;
  pillar_focus: string | null;
  created_at: string;
}

interface DerivativeFolderSidebarProps {
  selectedFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  folderCounts: Record<string, number>;
  masterContents: MasterContent[];
  selectedMasterId: string | null;
  onSelectMaster: (master: MasterContent) => void;
  onArchiveMaster: (id: string) => void;
  onDeleteMaster: (id: string) => void;
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
  masterContents,
  selectedMasterId,
  onSelectMaster,
  onArchiveMaster,
  onDeleteMaster,
}: DerivativeFolderSidebarProps) {
  const totalCount = Object.values(folderCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="h-full flex flex-col bg-background/50 border-r border-border/20">
      <div className="p-4 border-b border-border/20">
        <h2 className="text-lg font-serif font-semibold text-foreground mb-1">
          Derivative Types
        </h2>
        <p className="text-xs text-muted-foreground">
          Filter by content type
        </p>
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

        {/* Master Content Library Section */}
        <div className="px-4 pb-4">
          <MasterContentLibrarySection
            masterContents={masterContents}
            selectedMasterId={selectedMasterId}
            onSelectMaster={onSelectMaster}
            onArchive={onArchiveMaster}
            onDelete={onDeleteMaster}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
