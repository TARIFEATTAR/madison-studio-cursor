import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface KlaviyoEmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId?: string;
  initialContent?: string;
  initialTitle?: string;
}

export function KlaviyoEmailComposer({
  open,
  onOpenChange,
  contentId,
  initialContent = "",
  initialTitle = "",
}: KlaviyoEmailComposerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<KlaviyoList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const [subject, setSubject] = useState(initialTitle);
  const [previewText, setPreviewText] = useState("");
  const [emailTitle, setEmailTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [emailHtml, setEmailHtml] = useState("");

  useEffect(() => {
    if (open) {
      loadOrganizationAndLists();
      updatePreview();
    }
  }, [open]);

  useEffect(() => {
    updatePreview();
  }, [content, emailTitle, imageUrl]);

  const loadOrganizationAndLists = async () => {
    if (!user) return;

    try {
      // Get organization
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

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

      // Fetch lists
      setLoadingLists(true);
      const { data, error } = await supabase.functions.invoke("fetch-klaviyo-lists", {
        body: { organization_id: membership.organization_id },
      });

      if (error) throw error;

      if (data.lists) {
        setLists(data.lists);
      }
    } catch (error: any) {
      console.error("Error loading Klaviyo data:", error);
      toast.error("Failed to load Klaviyo lists");
    } finally {
      setLoadingLists(false);
    }
  };

  const updatePreview = () => {
    const html = convertToEmailHtml({
      content,
      title: emailTitle,
      imageUrl: imageUrl || undefined,
    });
    setEmailHtml(html);
  };

  const handleSend = async () => {
    if (!selectedList) {
      toast.error("Please select a Klaviyo list");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter email content");
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
          list_id: selectedList,
          subject: subject.trim(),
          preview_text: previewText.trim() || subject.trim(),
          content_html: emailHtml,
          content_id: contentId,
          content_title: emailTitle || subject,
        },
      });

      if (error) throw error;

      toast.success("Email campaign created in Klaviyo!", {
        description: "Your email has been scheduled to send in 1 minute.",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Klaviyo Email Campaign
          </DialogTitle>
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
            {/* List Selection */}
            <div className="space-y-2">
              <Label htmlFor="list">Send to List</Label>
              {loadingLists ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading lists...
                </div>
              ) : (
                <Select value={selectedList} onValueChange={setSelectedList}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Klaviyo list" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.profile_count.toLocaleString()} subscribers)
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
              <Label htmlFor="preview">Preview Text</Label>
              <Input
                id="preview"
                placeholder="Text shown in inbox preview (optional)"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />
            </div>

            {/* Email Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Email Title (optional)</Label>
              <Input
                id="title"
                placeholder="Heading in email"
                value={emailTitle}
                onChange={(e) => setEmailTitle(e.target.value)}
              />
            </div>

            {/* Header Image */}
            <div className="space-y-2">
              <Label htmlFor="image">Header Image URL (optional)</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Email Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your email content here. Use double line breaks for paragraphs."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use double line breaks to create paragraphs. Simple formatting works best for email compatibility.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <div className="border rounded-lg h-full overflow-auto bg-muted/20">
              <iframe
                srcDoc={emailHtml}
                className="w-full h-full min-h-[500px]"
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
          <Button onClick={handleSend} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send to Klaviyo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
