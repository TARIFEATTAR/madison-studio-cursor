import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface KlaviyoList {
  id: string;
  name: string;
  profile_count: number;
}

interface KlaviyoSegment {
  id: string;
  name: string;
  profile_count: number;
  is_active: boolean;
}

interface KlaviyoCampaign {
  id: string;
  name: string;
  status: string;
  channel: string;
}

type AudienceType = "list" | "segment" | "campaign";

interface AudienceSelectionSectionProps {
  audienceType: AudienceType;
  setAudienceType: (type: AudienceType) => void;
  selectedList: string;
  setSelectedList: (id: string) => void;
  lists: KlaviyoList[];
  segments: KlaviyoSegment[];
  campaigns: KlaviyoCampaign[];
  loadingAudiences: boolean;
  apiError: string;
}

export function AudienceSelectionSection({
  audienceType,
  setAudienceType,
  selectedList,
  setSelectedList,
  lists,
  segments,
  campaigns,
  loadingAudiences,
  apiError,
}: AudienceSelectionSectionProps) {
  if (loadingAudiences) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading audiences...
        </span>
      </div>
    );
  }

  return (
    <>
      {apiError && (
        <div className="p-3 text-sm bg-amber-500/10 text-amber-600 rounded-md mb-4">
          {apiError}
        </div>
      )}
      <Tabs value={audienceType} onValueChange={(v) => setAudienceType(v as AudienceType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lists</TabsTrigger>
          <TabsTrigger value="segment">Segments</TabsTrigger>
          <TabsTrigger value="campaign">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-2">
          <Label htmlFor="list-select">
            Select List <span className="text-destructive">*</span>
          </Label>
          <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger id="list-select">
              <SelectValue placeholder="Choose a list" />
            </SelectTrigger>
            <SelectContent>
              {lists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name} ({list.profile_count} subscribers)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>

        <TabsContent value="segment" className="space-y-2">
          <Label htmlFor="segment-select">
            Select Segment <span className="text-destructive">*</span>
          </Label>
          <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger id="segment-select">
              <SelectValue placeholder="Choose a segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map((segment) => (
                <SelectItem key={segment.id} value={segment.id}>
                  {segment.name} ({segment.profile_count} profiles)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>

        <TabsContent value="campaign" className="space-y-2">
          <Label htmlFor="campaign-select">
            Select Campaign <span className="text-destructive">*</span>
          </Label>
          <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger id="campaign-select">
              <SelectValue placeholder="Choose a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name} ({campaign.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
      </Tabs>
    </>
  );
}
