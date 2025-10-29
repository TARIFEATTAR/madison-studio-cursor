import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Mail, Eye } from "lucide-react";
import { convertToEmailHtml } from "@/utils/emailHtmlConverter";

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

type AudienceType = "list" | "segment";

interface KlaviyoEmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId?: string;
  initialContent?: string;
  initialTitle?: string;
  initialHtml?: string;
}

export function KlaviyoEmailComposer({
  open,
  onOpenChange,
  contentId,
  initialContent = "",
  initialTitle = "",
  initialHtml,
}: KlaviyoEmailComposerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<KlaviyoList[]>([]);
  const [segments, setSegments] = useState<KlaviyoSegment[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [audienceType, setAudienceType] = useState<AudienceType>("list");

  const [campaignName, setCampaignName] = useState(initialTitle);
  const [subject, setSubject] = useState(initialTitle);
  const [previewText, setPreviewText] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [emailHtml, setEmailHtml] = useState(initialHtml || "");

  useEffect(() => {
    if (open) {
      loadOrganizationAndLists();
      // If initialHtml is provided, use it directly
      if (initialHtml) {
        setEmailHtml(initialHtml);
      }
    }
  }, [open, initialHtml]);

  const loadOrganizationAndLists = async () => {
    if (!user) return;

    try {
      // Get organization
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership) {
        toast.error("Organization not found");
        return;
      }

      setOrganizationId(membership.organization_id);

      // Check if Klaviyo is connected
      const { data: connection } = await supabase
        .from("klaviyo_connections")
        .select("id")
        .eq("organization_id", membership.organization_id)
        .maybeSingle();

      if (!connection) {
        toast.error("Please connect Klaviyo in Settings first");
        onOpenChange(false);
        return;
      }

      // Fetch both lists and segments in parallel
      setLoadingAudiences(true);
      const [listsResult, segmentsResult] = await Promise.all([
        supabase.functions.invoke("fetch-klaviyo-lists", {
          body: { organization_id: membership.organization_id },
        }),
        supabase.functions.invoke("fetch-klaviyo-segments", {
          body: { organization_id: membership.organization_id },
        }),
      ]);

      if (listsResult.error) throw listsResult.error;
      if (segmentsResult.error) throw segmentsResult.error;

      if (listsResult.data?.lists) {
        setLists(listsResult.data.lists);
      }
      
      if (segmentsResult.data?.segments) {
        setSegments(segmentsResult.data.segments.filter((s: KlaviyoSegment) => s.is_active));
      }
    } catch (error: any) {
      console.error("Error loading Klaviyo data:", error);
      toast.error("Failed to load Klaviyo audiences");
    } finally {
      setLoadingAudiences(false);
    }
  };


  const handleSend = async () => {
    if (!selectedList) {
      toast.error("Please select a Klaviyo list or segment");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    if (!emailHtml || emailHtml.trim() === "") {
      toast.error("Email content is missing");
      return;
    }

    if (!organizationId) {
      toast.error("Organization not found");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("publish-to-klaviyo", {
        body: {
          organization_id: organizationId,
          audience_type: audienceType,
          audience_id: selectedList,
          campaign_name: campaignName.trim() || subject.trim(),
          subject: subject.trim(),
          preview_text: previewText.trim() || subject.trim(),
          content_html: emailHtml,
          content_id: contentId,
          content_title: subject,
        },
      });

      if (error) throw error;

      toast.success("Draft campaign created in Klaviyo!", {
        description: "Review and send from your Klaviyo dashboard.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending to Klaviyo:", error);
      toast.error(error.message || "Failed to send email to Klaviyo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="klaviyo-composer-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Klaviyo Email Campaign
          </DialogTitle>
          <DialogDescription>
            Create a draft campaign in Klaviyo. Choose your audience, preview the email, then create the draft to review/send in Klaviyo.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="compose" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="flex-1 overflow-y-auto space-y-4 mt-4">
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign Name</Label>
              <Input
                id="campaign"
                placeholder="Internal campaign name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            {/* Audience Type Selection */}
            <div className="space-y-2">
              <Label>Audience Type</Label>
              <Tabs value={audienceType} onValueChange={(v) => setAudienceType(v as AudienceType)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">Lists</TabsTrigger>
                  <TabsTrigger value="segment">Segments</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Audience Selection */}
            <div className="space-y-2">
              <Label htmlFor="audience">
                {audienceType === "list" ? "Select List" : "Select Segment"}
              </Label>
              {loadingAudiences ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading audiences...
                </div>
              ) : (
                <Select value={selectedList} onValueChange={setSelectedList}>
                  <SelectTrigger className="z-[1201]">
                    <SelectValue placeholder={`Select a Klaviyo ${audienceType}`} />
                  </SelectTrigger>
                  <SelectContent className="z-[1200] bg-popover text-popover-foreground border shadow-md">
                    {audienceType === "list" ? (
                      lists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name} ({list.profile_count.toLocaleString()} subscribers)
                        </SelectItem>
                      ))
                    ) : (
                      segments.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id}>
                          {segment.name} ({segment.profile_count.toLocaleString()} profiles)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter email subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Preview Text */}
            <div className="space-y-2">
              <Label htmlFor="preview">Preview Text (Optional)</Label>
              <Input
                id="preview"
                placeholder="Text shown in inbox preview"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Defaults to subject if left empty
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <div className="border rounded-lg h-full overflow-auto bg-muted/20">
              <iframe
                srcDoc={emailHtml}
                className="w-full h-full min-h-[500px] bg-background"
                title="Email Preview"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading} aria-label="Create Draft in Klaviyo">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Draft in Klaviyo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
