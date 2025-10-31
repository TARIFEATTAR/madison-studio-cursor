import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEmailComposer } from "@/hooks/useEmailComposer";
import { useBrandColor } from "@/hooks/useBrandColor";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye } from "lucide-react";
import { EmailPreview } from "@/components/email-composer/EmailPreview";
import { CampaignDetailsSection } from "@/components/klaviyo/CampaignDetailsSection";
import { AudienceSelectionSection } from "@/components/klaviyo/AudienceSelectionSection";
import { EmailDesignSection } from "@/components/klaviyo/EmailDesignSection";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const klaviyoEmailSchema = z.object({
  campaignName: z.string().min(1, "Campaign name is required").max(100, "Campaign name too long"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  fromEmail: z.string().email("Invalid email address"),
  fromName: z.string().min(1, "From name is required").max(100, "From name too long"),
  previewText: z.string().max(150, "Preview text too long").optional(),
  audienceId: z.string().min(1, "Please select an audience"),
});

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
  organizationId?: string;
}

export function KlaviyoEmailComposer({ organizationId: propOrgId }: KlaviyoEmailComposerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { brandColor: defaultBrandColor } = useBrandColor();
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<KlaviyoList[]>([]);
  const [segments, setSegments] = useState<KlaviyoSegment[]>([]);
  const [campaigns, setCampaigns] = useState<KlaviyoCampaign[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(propOrgId || null);
  const [audienceType, setAudienceType] = useState<AudienceType>("list");
  const [apiError, setApiError] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Campaign Details
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [fromEmail, setFromEmail] = useState("hello@messages.tarifeattar.com");
  const [fromName, setFromName] = useState("TARIFE ATTAR LLC");
  const [replyToEmail, setReplyToEmail] = useState("");

  // Email composer hook
  const composer = useEmailComposer({
    brandColor: defaultBrandColor,
  });

  useEffect(() => {
    loadOrganizationAndLists();
  }, [user]);

  const loadOrganizationAndLists = async () => {
    logger.debug("[KlaviyoEmailComposer] loadOrganizationAndLists starting", { user: !!user });
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
        navigate("/settings");
        return;
      }

      // Fetch lists, segments, and campaigns in parallel
      setLoadingAudiences(true);
      setApiError("");
      console.log("[KlaviyoEmailComposer] Fetching lists, segments, campaigns");
      
      const [listsResult, segmentsResult, campaignsResult] = await Promise.all([
        supabase.functions.invoke("fetch-klaviyo-lists", {
          body: { organization_id: membership.organization_id },
        }).catch(err => {
          console.error("[KlaviyoEmailComposer] Lists fetch exception:", err);
          return { data: null, error: err };
        }),
        supabase.functions.invoke("fetch-klaviyo-segments", {
          body: { organization_id: membership.organization_id },
        }).catch(err => {
          console.error("[KlaviyoEmailComposer] Segments fetch exception:", err);
          return { data: null, error: err };
        }),
        supabase.functions.invoke("fetch-klaviyo-campaigns", {
          body: { organization_id: membership.organization_id },
        }).catch(err => {
          console.error("[KlaviyoEmailComposer] Campaigns fetch exception:", err);
          return { data: null, error: err };
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
      } else if (listsResult.data?.error) {
        console.error("[KlaviyoEmailComposer] Lists API error:", listsResult.data.error);
        errors.push(`Lists: ${listsResult.data.error}`);
      } else if (listsResult.data?.lists) {
        console.log("[KlaviyoEmailComposer] Setting lists:", listsResult.data.lists.length);
        setLists(listsResult.data.lists);
      }

      if (segmentsResult.error) {
        console.error("[KlaviyoEmailComposer] Segments fetch error:", segmentsResult.error);
        errors.push(`Segments: ${segmentsResult.error.message || 'Failed to fetch'}`);
      } else if (segmentsResult.data?.error) {
        console.error("[KlaviyoEmailComposer] Segments API error:", segmentsResult.data.error);
        errors.push(`Segments: ${segmentsResult.data.error}`);
      } else if (segmentsResult.data?.segments) {
        const activeSegments = segmentsResult.data.segments.filter((s: KlaviyoSegment) => s.is_active);
        console.log("[KlaviyoEmailComposer] Setting segments:", activeSegments.length);
        setSegments(activeSegments);
      }

      if (campaignsResult.error) {
        console.error("[KlaviyoEmailComposer] Campaigns fetch error:", campaignsResult.error);
        errors.push(`Campaigns: ${campaignsResult.error.message || 'Failed to fetch'}`);
      } else if (campaignsResult.data?.error) {
        console.error("[KlaviyoEmailComposer] Campaigns API error:", campaignsResult.data.error);
        errors.push(`Campaigns: ${campaignsResult.data.error}`);
      } else if (campaignsResult.data?.campaigns) {
        console.log("[KlaviyoEmailComposer] Setting campaigns:", campaignsResult.data.campaigns.length);
        setCampaigns(campaignsResult.data.campaigns);
      }

      if (errors.length > 0) {
        const errorMsg = errors.join('; ');
        setApiError(errorMsg);
        toast.warning("Some Klaviyo data failed to load", {
          description: `${errors.length} of 3 audience types unavailable. You can still use what loaded.`,
          duration: 6000,
        });
      }
    } catch (error: any) {
      console.error("[KlaviyoEmailComposer] Error in loadOrganizationAndLists:", error);
      toast.error(`Failed to load Klaviyo audiences: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingAudiences(false);
    }
  };

  const handleCreateDraft = async () => {
    if (loading) {
      console.log("[KlaviyoEmailComposer] Already processing, ignoring duplicate call");
      return;
    }

    console.log("[KlaviyoEmailComposer] handleCreateDraft called", {
      hasOrganizationId: !!organizationId,
      audienceType,
      selectedList,
      campaignName: campaignName.trim(),
      subject: subject.trim(),
      hasEmailHtml: !!composer.generatedHtml,
      emailHtmlLength: composer.generatedHtml?.length || 0
    });

    // Validate input
    const validation = klaviyoEmailSchema.safeParse({
      campaignName: campaignName.trim(),
      subject: subject.trim(),
      fromEmail: fromEmail.trim(),
      fromName: fromName.trim(),
      previewText: previewText.trim() || undefined,
      audienceId: selectedList || "",
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      console.error("[KlaviyoEmailComposer] Validation failed:", validation.error.errors);
      toast.error(firstError.message);
      return;
    }

    if (!organizationId) {
      console.error("[KlaviyoEmailComposer] No organization ID");
      toast.error("Organization not found");
      return;
    }

    if (!composer.generatedHtml || composer.generatedHtml.trim().length === 0) {
      console.error("[KlaviyoEmailComposer] No email HTML content");
      toast.error("Please create email content first using the template and editor below");
      return;
    }

    // Validate audience has members
    if (audienceType === "list") {
      const selectedListData = lists.find(l => l.id === selectedList);
      if (selectedListData && selectedListData.profile_count === 0) {
        toast.error("Cannot create campaign", {
          description: `The list "${selectedListData.name}" has 0 subscribers. Please select a list with subscribers.`,
          duration: 6000,
        });
        return;
      }
    } else if (audienceType === "segment") {
      const selectedSegmentData = segments.find(s => s.id === selectedList);
      if (selectedSegmentData && selectedSegmentData.profile_count === 0) {
        toast.error("Cannot create campaign", {
          description: `The segment "${selectedSegmentData.name}" has 0 profiles. Please select a segment with profiles.`,
          duration: 6000,
        });
        return;
      }
    }

    setLoading(true);
    console.log("[KlaviyoEmailComposer] Sending to Klaviyo...");

    try {
      const { data, error } = await supabase.functions.invoke("publish-to-klaviyo", {
        body: {
          organization_id: organizationId,
          audience_type: audienceType,
          audience_id: selectedList,
          campaign_name: campaignName.trim(),
          subject: subject.trim(),
          preview_text: previewText.trim() || subject.trim(),
          content_html: composer.generatedHtml,
          content_id: crypto.randomUUID(),
          content_title: subject.trim(),
          from_email: fromEmail.trim(),
          from_name: fromName.trim(),
          reply_to_email: replyToEmail.trim() || fromEmail.trim(),
        },
      });

      console.log("[KlaviyoEmailComposer] Klaviyo response:", { data, error });

      if (error) {
        console.error("[KlaviyoEmailComposer] Error from publish-to-klaviyo:", error);
        throw new Error(error.message || "Failed to create Klaviyo campaign");
      }

      if (data?.error) {
        console.error("[KlaviyoEmailComposer] Error in response data:", data.error);
        throw new Error(data.error);
      }

      console.log("[KlaviyoEmailComposer] Successfully created campaign:", data);
      toast.success("Draft Campaign Created!", {
        description: `Your campaign "${campaignName}" has been created in Klaviyo as a draft.`,
        duration: 8000,
      });

      // Navigate back to library
      setTimeout(() => navigate("/library"), 1500);
    } catch (error: any) {
      console.error("[KlaviyoEmailComposer] Error creating campaign:", error);
      toast.error("Failed to create campaign", {
        description: error.message || "Please check your settings and try again",
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-background ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/library")}
            className="gap-2 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isMobile && "Back"}
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-xl font-semibold text-foreground truncate">Create Campaign</h1>
            {!isMobile && (
              <p className="text-sm text-muted-foreground">
                Design your email and send to Klaviyo
              </p>
            )}
          </div>
        </div>
        {!isMobile && (
          <GoldButton
            onClick={handleCreateDraft}
            disabled={loading || !organizationId}
            className="gap-2 px-6"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Draft in Klaviyo
          </GoldButton>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile Layout with Accordion
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Accordion type="multiple" defaultValue={["campaign", "audience", "content"]} className="space-y-3">
                {/* Mobile Section 1: Campaign Details */}
                <AccordionItem value="campaign">
                  <Card>
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <CardTitle className="text-base">Campaign Details</CardTitle>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="space-y-3 pt-0">
                        <CampaignDetailsSection
                          campaignName={campaignName}
                          setCampaignName={setCampaignName}
                          subject={subject}
                          setSubject={setSubject}
                          previewText={previewText}
                          setPreviewText={setPreviewText}
                          fromEmail={fromEmail}
                          setFromEmail={setFromEmail}
                          fromName={fromName}
                          setFromName={setFromName}
                          replyToEmail={replyToEmail}
                          setReplyToEmail={setReplyToEmail}
                        />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>

                {/* Mobile Section 2: Audience Selection */}
                <AccordionItem value="audience">
                  <Card>
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <CardTitle className="text-base">Audience</CardTitle>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="space-y-3 pt-0">
                        <AudienceSelectionSection
                          audienceType={audienceType}
                          setAudienceType={setAudienceType}
                          selectedList={selectedList}
                          setSelectedList={setSelectedList}
                          lists={lists}
                          segments={segments}
                          campaigns={campaigns}
                          loadingAudiences={loadingAudiences}
                          apiError={apiError}
                        />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>

                {/* Mobile Section 3: Email Content Editor */}
                <AccordionItem value="content">
                  <Card>
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <CardTitle className="text-base">Email Design</CardTitle>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="space-y-4 pt-0">
                        <EmailDesignSection
                          selectedTemplate={composer.selectedTemplate}
                          setSelectedTemplate={composer.setSelectedTemplate}
                          title={composer.title}
                          setTitle={composer.setTitle}
                          subtitle={composer.subtitle}
                          setSubtitle={composer.setSubtitle}
                          content={composer.content}
                          setContent={composer.setContent}
                          headerImage={composer.headerImage}
                          setHeaderImage={composer.setHeaderImage}
                          brandColor={composer.brandColor}
                          setBrandColor={composer.setBrandColor}
                          secondaryColor={composer.secondaryColor}
                          setSecondaryColor={composer.setSecondaryColor}
                          fontFamily={composer.fontFamily}
                          setFontFamily={composer.setFontFamily}
                          textColor={composer.textColor}
                          setTextColor={composer.setTextColor}
                        />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>

              {/* Mobile Preview Sheet Trigger */}
              <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2" size="lg">
                    <Eye className="w-4 h-4" />
                    Preview Email
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh]">
                  <SheetHeader>
                    <SheetTitle>Email Preview</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full mt-4">
                    <div className="pb-6">
                      <EmailPreview html={composer.generatedHtml} />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </ScrollArea>
        ) : (
          // Desktop Layout
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side - Form */}
            <ScrollArea className="h-full border-r border-border">
              <div className="p-6 space-y-6">
                {/* Section 1: Campaign Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                    <CardDescription>
                      Basic information for your Klaviyo campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaignName">
                        Campaign Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="campaignName"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g., Summer Collection 2024"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Email Subject <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g., New Collection Just Dropped"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previewText">Preview Text</Label>
                      <Input
                        id="previewText"
                        value={previewText}
                        onChange={(e) => setPreviewText(e.target.value)}
                        placeholder="Preview text shown in inbox"
                        maxLength={150}
                      />
                      <p className="text-xs text-muted-foreground">
                        {previewText.length}/150 characters
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">
                        From Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fromName">
                        From Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fromName"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="replyToEmail">Reply-To Email</Label>
                      <Input
                        id="replyToEmail"
                        type="email"
                        value={replyToEmail}
                        onChange={(e) => setReplyToEmail(e.target.value)}
                        placeholder={fromEmail}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to use From Email
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2: Audience Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Audience Selection</CardTitle>
                    <CardDescription>
                      Choose who will receive this email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingAudiences ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading audiences...
                        </span>
                      </div>
                    ) : (
                      <>
                        {apiError && (
                          <div className="p-3 text-sm bg-amber-500/10 text-amber-600 rounded-md">
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
                    )}
                  </CardContent>
                </Card>

                {/* Section 3: Email Content Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle>Email Design</CardTitle>
                    <CardDescription>
                      Customize your email template and content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmailDesignSection
                      selectedTemplate={composer.selectedTemplate}
                      setSelectedTemplate={composer.setSelectedTemplate}
                      title={composer.title}
                      setTitle={composer.setTitle}
                      subtitle={composer.subtitle}
                      setSubtitle={composer.setSubtitle}
                      content={composer.content}
                      setContent={composer.setContent}
                      headerImage={composer.headerImage}
                      setHeaderImage={composer.setHeaderImage}
                      brandColor={composer.brandColor}
                      setBrandColor={composer.setBrandColor}
                      secondaryColor={composer.secondaryColor}
                      setSecondaryColor={composer.setSecondaryColor}
                      fontFamily={composer.fontFamily}
                      setFontFamily={composer.setFontFamily}
                      textColor={composer.textColor}
                      setTextColor={composer.setTextColor}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            {/* Right Side - Preview */}
            <div className="bg-muted/30 flex flex-col">
              <div className="p-4 border-b border-border bg-card">
                <h2 className="text-lg font-semibold">Email Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Live preview of your email
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <EmailPreview html={composer.generatedHtml} />
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Button */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-50">
          <GoldButton
            onClick={handleCreateDraft}
            disabled={loading || !organizationId}
            className="w-full h-12 gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Draft in Klaviyo
          </GoldButton>
        </div>
      )}
    </div>
  );
}
