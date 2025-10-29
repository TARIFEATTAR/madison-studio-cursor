import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, ArrowLeft, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { convertToEmailHtml } from "@/utils/emailHtmlConverter";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KlaviyoList {
  id: string;
  name: string;
  profile_count: number;
}

interface KlaviyoSegment {
  id: string;
  name: string;
  profile_count: number;
}

type AudienceType = "list" | "segment";

export default function PublishEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const contentId = searchParams.get("contentId") || "";
  const sourceTable = searchParams.get("sourceTable") as "master_content" | "derivative_assets" | "outputs" | "generated_images" || "master_content";
  const contentTitle = searchParams.get("title") || "Untitled";

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [klaviyoConnected, setKlaviyoConnected] = useState(false);

  const [audienceType, setAudienceType] = useState<AudienceType>("list");
  const [lists, setLists] = useState<KlaviyoList[]>([]);
  const [segments, setSegments] = useState<KlaviyoSegment[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string>("");

  const [campaignName, setCampaignName] = useState(contentTitle);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [emailTitle, setEmailTitle] = useState(contentTitle);
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [emailHtml, setEmailHtml] = useState("");

  // Load organization and check Klaviyo connection
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .single();

        if (!orgMember) {
          toast({
            title: "Error",
            description: "No organization found",
            variant: "destructive",
          });
          navigate("/library");
          return;
        }

        setOrganizationId(orgMember.organization_id);

        // Check if Klaviyo is connected
        const { data: connection } = await supabase
          .from("klaviyo_connections")
          .select("id")
          .eq("organization_id", orgMember.organization_id)
          .maybeSingle();

        setKlaviyoConnected(!!connection);

        if (connection) {
          // Load lists and segments
          await Promise.all([loadLists(orgMember.organization_id), loadSegments(orgMember.organization_id)]);
        }
      } catch (error) {
        console.error("Error loading organization:", error);
        toast({
          title: "Error",
          description: "Failed to load organization data",
          variant: "destructive",
        });
      }
    };

    loadOrganization();
  }, [navigate, toast]);

  // Load content
  useEffect(() => {
    const loadContent = async () => {
      if (!contentId || !sourceTable) return;

      try {
        const { data, error } = await supabase
          .from(sourceTable)
          .select("*")
          .eq("id", contentId)
          .single();

        if (error) throw error;

        let text = "";
        if (sourceTable === "master_content") {
          text = (data as any).content || "";
        } else if (sourceTable === "derivative_assets") {
          text = (data as any).content || "";
        } else if (sourceTable === "outputs") {
          text = (data as any).output_text || "";
        } else if (sourceTable === "generated_images") {
          text = (data as any).prompt || "";
        }

        setContent(text);
        setLoading(false);
      } catch (error) {
        console.error("Error loading content:", error);
        toast({
          title: "Error",
          description: "Failed to load content",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadContent();
  }, [contentId, sourceTable, toast]);

  // Update preview when content or settings change
  useEffect(() => {
    if (content) {
      const html = convertToEmailHtml({
        content,
        title: emailTitle,
        imageUrl: headerImageUrl,
      });
      setEmailHtml(html);
    }
  }, [content, emailTitle, headerImageUrl]);

  const loadLists = async (orgId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-klaviyo-lists", {
        body: { organization_id: orgId },
      });

      if (error) throw error;
      setLists(data?.lists || []);
    } catch (error) {
      console.error("Error loading Klaviyo lists:", error);
    }
  };

  const loadSegments = async (orgId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-klaviyo-segments", {
        body: { organization_id: orgId },
      });

      if (error) throw error;
      setSegments(data?.segments || []);
    } catch (error) {
      console.error("Error loading Klaviyo segments:", error);
    }
  };

  const handleCreateDraft = async () => {
    if (!selectedAudience) {
      toast({
        title: "Select Audience",
        description: "Please select a list or segment to send to",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter an email subject",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("publish-to-klaviyo", {
        body: {
          organization_id: organizationId,
          audience_type: audienceType,
          audience_id: selectedAudience,
          campaign_name: campaignName || contentTitle,
          subject: subject.trim(),
          preview_text: previewText || subject.trim(),
          content_html: emailHtml,
          content_id: contentId,
          content_title: contentTitle,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to create Klaviyo draft");
      }

      toast({
        title: "Draft Created!",
        description: "Your email campaign has been created in Klaviyo",
        action: data?.campaign_url ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(data.campaign_url, "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View in Klaviyo
          </Button>
        ) : undefined,
      });

      // Navigate back to library after a short delay
      setTimeout(() => navigate("/library"), 1500);
    } catch (error: any) {
      console.error("Error creating Klaviyo draft:", error);
      toast({
        title: "Failed to Create Draft",
        description: error.message || "Please check your Klaviyo connection and try again",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!klaviyoConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Klaviyo Not Connected</h2>
          <p className="text-muted-foreground max-w-md">
            You need to connect your Klaviyo account before creating email campaigns.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/library")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
          <Button onClick={() => navigate("/settings?tab=integrations")}>
            Connect Klaviyo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/library")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">Create Email Campaign</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {contentTitle}
              </p>
            </div>
          </div>
          <Button onClick={handleCreateDraft} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Draft in Klaviyo
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <Alert className="mb-6">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Campaigns are created as <strong>Drafts</strong> in Klaviyo. You can review and send them from Klaviyo → Campaigns.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Internal campaign name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Audience Type</Label>
                  <Tabs value={audienceType} onValueChange={(v) => setAudienceType(v as AudienceType)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="list">List</TabsTrigger>
                      <TabsTrigger value="segment">Segment</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label>Select {audienceType === "list" ? "List" : "Segment"}</Label>
                  {audienceType === "list" ? (
                    <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a list..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name} ({list.profile_count} contacts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a segment..." />
                      </SelectTrigger>
                      <SelectContent>
                        {segments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            {segment.name} ({segment.profile_count} contacts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Subject Line *</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Your email subject"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preview Text</Label>
                  <Input
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Optional preview text"
                  />
                  <p className="text-xs text-muted-foreground">
                    Defaults to subject if left empty
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Email Title (Optional)</Label>
                  <Input
                    value={emailTitle}
                    onChange={(e) => setEmailTitle(e.target.value)}
                    placeholder="Title shown in email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Header Image URL (Optional)</Label>
                  <Input
                    value={headerImageUrl}
                    onChange={(e) => setHeaderImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="border rounded-lg p-4 bg-muted/20">
              <iframe
                srcDoc={emailHtml}
                className="w-full h-[600px] border-0 bg-white rounded"
                title="Email Preview"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
