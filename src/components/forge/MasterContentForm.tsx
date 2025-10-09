import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BLOG_REPURPOSE_TARGETS } from "@/config/blogPostGuidelines";
import { useCollections } from "@/hooks/useCollections";
import { useWeekNames } from "@/hooks/useWeekNames";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";

interface MasterContentFormProps {
  title: string;
  contentType: string;
  dipWeek: string;
  collection: string;
  pillar: string;
  masterContent: string;
  selectedDerivatives: string[];
  onTitleChange: (value: string) => void;
  onContentTypeChange: (value: string) => void;
  onDipWeekChange: (value: string) => void;
  onCollectionChange: (value: string) => void;
  onPillarChange: (value: string) => void;
  onMasterContentChange: (value: string) => void;
  onDerivativesChange: (derivatives: string[]) => void;
}

export function MasterContentForm({
  title,
  contentType,
  dipWeek,
  collection,
  pillar,
  masterContent,
  selectedDerivatives,
  onTitleChange,
  onContentTypeChange,
  onDipWeekChange,
  onCollectionChange,
  onPillarChange,
  onMasterContentChange,
  onDerivativesChange,
}: MasterContentFormProps) {
  const { collections } = useCollections();
  const { getWeekName } = useWeekNames();
  
  const toggleDerivative = (type: string) => {
    if (selectedDerivatives.includes(type)) {
      onDerivativesChange(selectedDerivatives.filter(t => t !== type));
    } else {
      onDerivativesChange([...selectedDerivatives, type]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="masterTitle">Title *</Label>
        <Input
          id="masterTitle"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., 'The Quiet Rebellion'"
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="masterContentType">Primary Content Type *</Label>
        <Select value={contentType} onValueChange={onContentTypeChange}>
          <SelectTrigger id="masterContentType" className="bg-background/50">
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blog_post">Blog Post (1000-2000 words)</SelectItem>
            <SelectItem value="email_newsletter">Email Newsletter (500-800 words)</SelectItem>
            <SelectItem value="brand_announcement">Brand Announcement</SelectItem>
            <SelectItem value="educational_guide">Educational Guide</SelectItem>
            <SelectItem value="product_story">Product Story</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="dipWeek">DIP Week</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>DIP (Deep Immersion Period) weeks help structure your content calendar. Customize these names in Settings.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select value={dipWeek} onValueChange={onDipWeekChange}>
          <SelectTrigger id="dipWeek" className="bg-background/50">
            <SelectValue placeholder="Select week..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Week 1: {getWeekName(1)}</SelectItem>
            <SelectItem value="2">Week 2: {getWeekName(2)}</SelectItem>
            <SelectItem value="3">Week 3: {getWeekName(3)}</SelectItem>
            <SelectItem value="4">Week 4: {getWeekName(4)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="collection">Collection (Optional)</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Collections help organize your brand's product lines or themes. They provide context to AI for more aligned content.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select value={collection} onValueChange={onCollectionChange}>
          <SelectTrigger id="collection" className="bg-background/50">
            <SelectValue placeholder="Select collection..." />
          </SelectTrigger>
          <SelectContent>
            {collections.length === 0 ? (
              <SelectItem value="_none" disabled>No collections yet - create one first</SelectItem>
            ) : (
              collections.map((col) => (
                <SelectItem key={col.id} value={col.name}>{col.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {collections.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Don't see your collections?{" "}
            <Link to="/settings" className="text-primary hover:underline">
              Create them in Settings
            </Link>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pillarMaster">Pillar Focus (Optional)</Label>
        <Select value={pillar} onValueChange={onPillarChange}>
          <SelectTrigger id="pillarMaster" className="bg-background/50">
            <SelectValue placeholder="Select pillar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Identity">Identity / The Anchor</SelectItem>
            <SelectItem value="Memory">Memory / The Journey</SelectItem>
            <SelectItem value="Remembrance">Remembrance / The Craft</SelectItem>
            <SelectItem value="Cadence">Cadence / The Practice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="masterContentText">Master Content *</Label>
        <Textarea
          id="masterContentText"
          value={masterContent}
          onChange={(e) => onMasterContentChange(e.target.value)}
          placeholder="Paste or write your master content here..."
          className="bg-background/50 min-h-[400px] font-serif text-base leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">
          Word count: {masterContent.trim().split(/\s+/).filter(w => w).length}
        </p>
      </div>

      <div className="space-y-3 border-t border-border/40 pt-6">
        <Label className="text-base">Select Derivative Asset Types</Label>
        <p className="text-sm text-muted-foreground">
          Choose which formats to automatically multiply this content into
        </p>
        <div className="grid grid-cols-1 gap-3">
          {BLOG_REPURPOSE_TARGETS.map((target) => (
            <div key={target.value} className="flex items-start space-x-3 p-3 rounded-md border border-border/40 bg-background/30">
              <Checkbox
                id={target.value}
                checked={selectedDerivatives.includes(target.value)}
                onCheckedChange={() => toggleDerivative(target.value)}
              />
              <div className="flex-1">
                <label
                  htmlFor={target.value}
                  className="text-sm font-medium cursor-pointer"
                >
                  {target.label}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {target.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}