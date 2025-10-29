import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, ArrowLeft, Loader2, Plus, Check, Edit2, Eye } from "lucide-react";
import { convertToEmailHtml } from "@/utils/emailHtmlConverter";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SequenceEmail {
  id: string;
  day: number;
  subject: string;
  previewText: string;
  content: string;
  status: "pending" | "generated" | "edited";
}

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

export default function EmailSequence() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [organizationId, setOrganizationId] = useState<string>("");
  const [klaviyoConnected, setKlaviyoConnected] = useState(false);
  
  const [sequenceLength, setSequenceLength] = useState<3 | 5 | 7>(3);
  const [sequenceGoal, setSequenceGoal] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [audienceType, setAudienceType] = useState<AudienceType>("list");
  const [lists, setLists] = useState<KlaviyoList[]>([]);
  const [segments, setSegments] = useState<KlaviyoSegment[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string>("");
  
  const [sequenceEmails, setSequenceEmails] = useState<SequenceEmail[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [publishedCount, setPublishedCount] = useState(0);

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
          .limit(1)
          .maybeSingle();

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

        const { data: connection } = await supabase
          .from("klaviyo_connections")
          .select("id")
          .eq("organization_id", orgMember.organization_id)
          .maybeSingle();

        setKlaviyoConnected(!!connection);

        if (connection) {
          await Promise.all([loadLists(orgMember.organization_id), loadSegments(orgMember.organization_id)]);
        }
      } catch (error) {
        console.error("Error loading organization:", error);
      }
    };

    loadOrganization();
  }, [navigate, toast]);

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

  const generateSequence = async () => {
    if (!sequenceGoal.trim()) {
      toast({
        title: "Goal Required",
        description: "Please describe the goal of your email sequence",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      const prompt = `Generate a ${sequenceLength}-email sequence for the following:

Goal: ${sequenceGoal}
${productInfo ? `Product/Service Info: ${productInfo}` : ""}

Create ${sequenceLength} emails with strategic timing. Return ONLY valid JSON in this exact format:
{
  "emails": [
    {
      "day": 1,
      "subject": "compelling subject line",
      "previewText": "preview text for inbox",
      "content": "full email body with paragraphs separated by double line breaks"
    }
  ]
}

Each email should build on the previous one, creating a cohesive journey. Use persuasive copywriting and clear calls to action.`;

      const { data, error } = await supabase.functions.invoke("generate-with-claude", {
        body: {
          prompt,
          context: "email_sequence_generation",
          max_tokens: 4000,
        },
      });

      if (error) throw error;

      const jsonMatch = data.generated_text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid response format");

      const parsed = JSON.parse(jsonMatch[0]);
      
      const emails: SequenceEmail[] = parsed.emails.map((email: any, index: number) => ({
        id: `email-${index}`,
        day: email.day || index + 1,
        subject: email.subject,
        previewText: email.previewText,
        content: email.content,
        status: "generated" as const,
      }));

      setSequenceEmails(emails);
      setSelectedEmailIndex(0);

      toast({
        title: "Sequence Generated!",
        description: `Created ${sequenceLength} emails. Review and edit before publishing.`,
      });
    } catch (error: any) {
      console.error("Error generating sequence:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate email sequence",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const updateEmail = (index: number, updates: Partial<SequenceEmail>) => {
    setSequenceEmails(prev => 
      prev.map((email, i) => 
        i === index 
          ? { ...email, ...updates, status: "edited" as const }
          : email
      )
    );
  };

  const publishSequence = async () => {
    if (!selectedAudience) {
      toast({
        title: "Select Audience",
        description: "Please select a list or segment",
        variant: "destructive",
      });
      return;
    }

    if (sequenceEmails.length === 0) {
      toast({
        title: "No Emails",
        description: "Generate your sequence first",
        variant: "destructive",
      });
      return;
    }

    setPublishing(true);
    setPublishedCount(0);

    try {
      for (let i = 0; i < sequenceEmails.length; i++) {
        const email = sequenceEmails[i];
        const emailHtml = convertToEmailHtml({
          content: email.content,
          title: email.subject,
        });

        const { error } = await supabase.functions.invoke("publish-to-klaviyo", {
          body: {
            organization_id: organizationId,
            audience_type: audienceType,
            audience_id: selectedAudience,
            campaign_name: `${sequenceGoal} - Day ${email.day}`,
            subject: email.subject,
            preview_text: email.previewText,
            content_html: emailHtml,
          },
        });

        if (error) throw error;
        setPublishedCount(i + 1);
      }

      toast({
        title: "Sequence Published!",
        description: `All ${sequenceEmails.length} emails created as drafts in Klaviyo`,
      });

      setTimeout(() => navigate("/library"), 1500);
    } catch (error: any) {
      console.error("Error publishing sequence:", error);
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to publish sequence",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const currentEmail = sequenceEmails[selectedEmailIndex];
  const currentEmailHtml = currentEmail ? convertToEmailHtml({
    content: currentEmail.content,
    title: currentEmail.subject,
  }) : "";

  if (!klaviyoConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <Mail className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Klaviyo Not Connected</h2>
          <p className="text-muted-foreground max-w-md">
            Connect Klaviyo to create email sequences
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/library")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
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
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/library")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">Email Sequence Builder</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create 3, 5, or 7 email sequences for Klaviyo
              </p>
            </div>
          </div>
          {sequenceEmails.length > 0 && (
            <Button onClick={publishSequence} disabled={publishing}>
              {publishing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {publishing ? `Publishing ${publishedCount}/${sequenceEmails.length}...` : "Publish All to Klaviyo"}
            </Button>
          )}
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Setup */}
          <Card className="p-6 space-y-6 lg:col-span-1">
            <div>
              <h3 className="font-semibold mb-4">Sequence Setup</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Number of Emails</Label>
                  <Select 
                    value={String(sequenceLength)} 
                    onValueChange={(v) => setSequenceLength(Number(v) as 3 | 5 | 7)}
                    disabled={sequenceEmails.length > 0}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Emails</SelectItem>
                      <SelectItem value="5">5 Emails</SelectItem>
                      <SelectItem value="7">7 Emails</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sequence Goal *</Label>
                  <Textarea
                    value={sequenceGoal}
                    onChange={(e) => setSequenceGoal(e.target.value)}
                    placeholder="E.g., Nurture leads for our new skincare line launch"
                    rows={3}
                    disabled={sequenceEmails.length > 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product/Service Info (Optional)</Label>
                  <Textarea
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    placeholder="Key details about what you're promoting"
                    rows={3}
                    disabled={sequenceEmails.length > 0}
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
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name} ({list.profile_count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {segments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            {segment.name} ({segment.profile_count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {sequenceEmails.length === 0 && (
                  <Button 
                    onClick={generateSequence} 
                    disabled={generating}
                    className="w-full"
                  >
                    {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Generate Sequence
                  </Button>
                )}
              </div>
            </div>

            {/* Email List */}
            {sequenceEmails.length > 0 && (
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-3">Emails in Sequence</h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {sequenceEmails.map((email, index) => (
                      <Button
                        key={email.id}
                        variant={selectedEmailIndex === index ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedEmailIndex(index)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Badge variant="secondary" className="shrink-0">
                            Day {email.day}
                          </Badge>
                          <span className="truncate flex-1 text-sm">
                            {email.subject || `Email ${index + 1}`}
                          </span>
                          {email.status === "edited" && (
                            <Edit2 className="h-3 w-3 shrink-0" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </Card>

          {/* Right: Email Editor */}
          {currentEmail && (
            <Card className="p-6 lg:col-span-2">
              <Tabs defaultValue="edit" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Day {currentEmail.day} Email
                  </h3>
                  <TabsList>
                    <TabsTrigger value="edit">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="edit" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={currentEmail.subject}
                      onChange={(e) => updateEmail(selectedEmailIndex, { subject: e.target.value })}
                      placeholder="Email subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preview Text</Label>
                    <Input
                      value={currentEmail.previewText}
                      onChange={(e) => updateEmail(selectedEmailIndex, { previewText: e.target.value })}
                      placeholder="Inbox preview text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Content</Label>
                    <Textarea
                      value={currentEmail.content}
                      onChange={(e) => updateEmail(selectedEmailIndex, { content: e.target.value })}
                      rows={16}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="h-[600px]">
                  <div className="border rounded-lg h-full overflow-auto bg-muted/20">
                    <iframe
                      srcDoc={currentEmailHtml}
                      className="w-full h-full bg-white"
                      title="Email Preview"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          )}

          {/* Empty State */}
          {sequenceEmails.length === 0 && (
            <Card className="p-12 lg:col-span-2 flex flex-col items-center justify-center text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sequence Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Fill out the setup form and click "Generate Sequence" to create your email series.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
