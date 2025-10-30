import { useState, useEffect, useMemo } from "react";
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
import { deserializeEmailState } from "@/utils/emailStateSerializer";
import DOMPurify from "dompurify";

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

interface KlaviyoEmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId?: string;
  sourceTable?: "master_content" | "derivative_assets" | "outputs";
  initialContent?: string;
  initialTitle?: string;
  initialHtml?: string;
  onSendSuccess?: () => void | Promise<void>;
}

export function KlaviyoEmailComposer({
  open,
  onOpenChange,
  contentId,
  sourceTable,
  initialContent = "",
  initialTitle = "",
  initialHtml,
  onSendSuccess,
}: KlaviyoEmailComposerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<KlaviyoList[]>([]);
  const [segments, setSegments] = useState<KlaviyoSegment[]>([]);
  const [campaigns, setCampaigns] = useState<KlaviyoCampaign[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [audienceType, setAudienceType] = useState<AudienceType>("list");
  const [apiError, setApiError] = useState<string>("");

  const [campaignName, setCampaignName] = useState(initialTitle);
  const [subject, setSubject] = useState(initialTitle);
  const [previewText, setPreviewText] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [fromEmail, setFromEmail] = useState("hello@messages.tarifeattar.com");
  const [fromName, setFromName] = useState("TARIFE ATTAR LLC");
  const [emailHtml, setEmailHtml] = useState(initialHtml || "");

  // Sanitize HTML more permissively for email templates (keeping design intact)
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(emailHtml, {
      // Allow full email document head so embedded styles are preserved
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ['html','head','meta','title','style','link'],
      ADD_ATTR: [
        // keep inline email design intact
        'style','class','id','href','src','width','height',
        'align','valign','border','cellpadding','cellspacing',
        'bgcolor','background','color','face','size','target','rel','type',
        'role','http-equiv','content','name','media'
      ],
      ALLOW_UNKNOWN_PROTOCOLS: false,
      FORBID_TAGS: ['script','iframe','object','embed','form','input','button'],
      FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onmouseout','onfocus','onblur']
    });
  }, [emailHtml]);

  useEffect(() => {
    console.log("[KlaviyoEmailComposer] useEffect triggered", { open, hasInitialHtml: !!initialHtml, contentId, sourceTable });
    if (open) {
      loadOrganizationAndLists();
      
      // If initialHtml is provided, use it directly
      if (initialHtml) {
        console.log("[KlaviyoEmailComposer] Setting email HTML from initialHtml");
        setEmailHtml(initialHtml);
      }
      // If contentId and sourceTable are provided, fetch content from database
      else if (contentId && sourceTable) {
        console.log("[KlaviyoEmailComposer] Fetching content from database", { contentId, sourceTable });
        loadContentFromDatabase(contentId, sourceTable);
      }
    }
  }, [open, initialHtml, contentId, sourceTable]);

  const loadContentFromDatabase = async (id: string, table: string) => {
    try {
      console.log("[KlaviyoEmailComposer] Loading content from", table, id);
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        console.log("[KlaviyoEmailComposer] Content loaded successfully");
        
        // Set campaign name from title
        if ('title' in data && data.title) {
          setCampaignName(data.title as string);
          setSubject(data.title as string);
        }

        // Try to extract HTML from various possible fields
        let htmlContent = "";
        
        if ('full_content' in data && data.full_content) {
          try {
            // Try to deserialize email state
            const emailState = deserializeEmailState(data.full_content as string);
            if (emailState.generatedHtml) {
              htmlContent = emailState.generatedHtml;
            } else {
              htmlContent = data.full_content as string;
            }
          } catch {
            // Not serialized, use as is
            htmlContent = data.full_content as string;
          }
        } else if ('generated_content' in data && data.generated_content) {
          htmlContent = convertToEmailHtml({ content: data.generated_content as string });
        } else if ('content' in data && data.content) {
          htmlContent = convertToEmailHtml({ content: data.content as string });
        }

        console.log("[KlaviyoEmailComposer] Setting email HTML from database content");
        setEmailHtml(htmlContent);
      }
    } catch (error: any) {
      console.error("[KlaviyoEmailComposer] Error loading content:", error);
      toast.error(`Failed to load content: ${error.message}`);
    }
  };

  const loadOrganizationAndLists = async () => {
    console.log("[KlaviyoEmailComposer] loadOrganizationAndLists starting", { user: !!user });
    if (!user) {
      console.error("[KlaviyoEmailComposer] No user found");
      return;
    }

    try {
      // Get organization
      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("[KlaviyoEmailComposer] Membership query result:", { membership, membershipError });

      if (membershipError) throw membershipError;

      if (!membership) {
        console.error("[KlaviyoEmailComposer] No organization membership found");
        toast.error("Organization not found");
        return;
      }

      setOrganizationId(membership.organization_id);

      // Check if Klaviyo is connected
      const { data: connection, error: connectionError } = await supabase
        .from("klaviyo_connections")
        .select("id")
        .eq("organization_id", membership.organization_id)
        .maybeSingle();

      console.log("[KlaviyoEmailComposer] Klaviyo connection query result:", { connection, connectionError });

      if (connectionError) throw connectionError;

      if (!connection) {
        console.error("[KlaviyoEmailComposer] No Klaviyo connection found");
        toast.error("Please connect Klaviyo in Settings first");
        onOpenChange(false);
        return;
      }

      // Fetch lists, segments, and campaigns in parallel
      setLoadingAudiences(true);
      setApiError("");
      console.log("[KlaviyoEmailComposer] Fetching lists, segments, campaigns");
      
      const [listsResult, segmentsResult, campaignsResult] = await Promise.all([
        supabase.functions.invoke("fetch-klaviyo-lists", {
          body: { organization_id: membership.organization_id },
        }),
        supabase.functions.invoke("fetch-klaviyo-segments", {
          body: { organization_id: membership.organization_id },
        }),
        supabase.functions.invoke("fetch-klaviyo-campaigns", {
          body: { organization_id: membership.organization_id },
        }),
      ]);

      console.log("[KlaviyoEmailComposer] Lists result:", listsResult);
      console.log("[KlaviyoEmailComposer] Segments result:", segmentsResult);
      console.log("[KlaviyoEmailComposer] Campaigns result:", campaignsResult);

      // Collect all errors to show user
      const errors: string[] = [];

      if (listsResult.error) {
        console.error("[KlaviyoEmailComposer] Lists fetch error:", listsResult.error);
        errors.push(`Lists: ${listsResult.error.message || 'Failed to fetch'}`);
      } else if (listsResult.data?.lists) {
        console.log("[KlaviyoEmailComposer] Setting lists:", listsResult.data.lists.length);
        setLists(listsResult.data.lists);
      }

      if (segmentsResult.error) {
        console.error("[KlaviyoEmailComposer] Segments fetch error:", segmentsResult.error);
        errors.push(`Segments: ${segmentsResult.error.message || 'Failed to fetch'}`);
      } else if (segmentsResult.data?.segments) {
        const activeSegments = segmentsResult.data.segments.filter((s: KlaviyoSegment) => s.is_active);
        console.log("[KlaviyoEmailComposer] Setting segments:", activeSegments.length);
        setSegments(activeSegments);
      }

      if (campaignsResult.error) {
        console.error("[KlaviyoEmailComposer] Campaigns fetch error:", campaignsResult.error);
        errors.push(`Campaigns: ${campaignsResult.error.message || 'Failed to fetch'}`);
      } else if (campaignsResult.data?.campaigns) {
        console.log("[KlaviyoEmailComposer] Setting campaigns:", campaignsResult.data.campaigns.length);
        setCampaigns(campaignsResult.data.campaigns);
      }

      if (errors.length > 0) {
        const errorMsg = errors.join('; ');
        setApiError(errorMsg);
        toast.error("Some Klaviyo data failed to load", {
          description: errorMsg,
        });
      }
    } catch (error: any) {
      console.error("[KlaviyoEmailComposer] Error in loadOrganizationAndLists:", error);
      toast.error(`Failed to load Klaviyo audiences: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingAudiences(false);
    }
  };


  const handleSend = async () => {
    console.log("[KlaviyoEmailComposer] handleSend called", {
      selectedList,
      subject: subject.trim(),
      hasEmailHtml: !!emailHtml && emailHtml.trim() !== "",
      organizationId
    });

    if (!selectedList) {
      console.error("[KlaviyoEmailComposer] No list/segment selected");
      toast.error("Please select a Klaviyo list or segment");
      return;
    }

    if (!fromEmail.trim() || !fromName.trim()) {
      console.error("[KlaviyoEmailComposer] Missing from email or name");
      toast.error("Please enter both from email and from name");
      return;
    }

    if (!subject.trim()) {
      console.error("[KlaviyoEmailComposer] No subject");
      toast.error("Please enter an email subject");
      return;
    }

    if (!emailHtml || emailHtml.trim() === "") {
      console.error("[KlaviyoEmailComposer] No email HTML");
      toast.error("Email content is missing");
      return;
    }

    if (!organizationId) {
      console.error("[KlaviyoEmailComposer] No organization ID");
      toast.error("Organization not found");
      return;
    }

    setLoading(true);
    console.log("[KlaviyoEmailComposer] Invoking publish-to-klaviyo");

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
          from_email: fromEmail.trim(),
          from_name: fromName.trim(),
        },
      });

      console.log("[KlaviyoEmailComposer] publish-to-klaviyo result:", { data, error });

      if (error) {
        console.error("[KlaviyoEmailComposer] Klaviyo publish error:", error);
        // Surface the actual error message from the function
        const errorMessage = error.message || 'Unknown error occurred';
        toast.error(`Failed to create Klaviyo campaign: ${errorMessage}`);
        return;
      }

      // Call success callback to update database
      if (onSendSuccess) {
        console.log("[KlaviyoEmailComposer] Calling onSendSuccess");
        await onSendSuccess();
      }

      toast.success("Draft campaign created in Klaviyo!", {
        description: "Review and send from your Klaviyo dashboard.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("[KlaviyoEmailComposer] Error in handleSend:", error);
      const errorMessage = error?.message || 'Unknown error';
      toast.error(`Klaviyo error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      console.log("[KlaviyoEmailComposer] Dialog onOpenChange:", newOpen);
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="klaviyo-composer-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Klaviyo Email Campaign
          </DialogTitle>
          <DialogDescription id="klaviyo-composer-description">
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

            {/* API Error Display */}
            {apiError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                <p className="font-semibold">Klaviyo API Errors:</p>
                <p className="text-xs mt-1">{apiError}</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Check that your API key has required scopes: Lists:Read, Segments:Read, Campaigns:Read, Campaigns:Write
                </p>
              </div>
            )}

            {/* From Email */}
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email *</Label>
              <Input
                id="from-email"
                type="email"
                placeholder="hello@messages.tarifeattar.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Must be a verified email in your Klaviyo account
              </p>
            </div>

            {/* From Name */}
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name *</Label>
              <Input
                id="from-name"
                placeholder="TARIFE ATTAR LLC"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>

            {/* Audience Type Selection */}
            <div className="space-y-2">
              <Label>Audience Type</Label>
              <Tabs value={audienceType} onValueChange={(v) => setAudienceType(v as AudienceType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="list">Lists</TabsTrigger>
                  <TabsTrigger value="segment">Segments</TabsTrigger>
                  <TabsTrigger value="campaign">Campaigns</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Audience Selection */}
            <div className="space-y-2">
              <Label htmlFor="audience">
                {audienceType === "list" ? "Select List" : audienceType === "segment" ? "Select Segment" : "Select Campaign"}
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
                    {audienceType === "list" && lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.profile_count.toLocaleString()} subscribers)
                      </SelectItem>
                    ))}
                    {audienceType === "segment" && segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.profile_count.toLocaleString()} profiles)
                      </SelectItem>
                    ))}
                    {audienceType === "campaign" && campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.status})
                      </SelectItem>
                    ))}
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
                srcDoc={sanitizedHtml}
                className="w-full h-full min-h-[500px] bg-background"
                title="Email Preview"
                sandbox="allow-same-origin allow-popups"
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
