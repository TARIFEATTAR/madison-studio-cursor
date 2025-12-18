/**
 * PublishToLinkedIn - Button to publish content directly to LinkedIn
 * 
 * This component provides a simple way to post content to a connected
 * LinkedIn profile or company page.
 */

import { useState } from "react";
import { Linkedin, Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

interface PublishToLinkedInProps {
  /** The content text to publish */
  content: string;
  /** Optional content ID for tracking */
  contentId?: string;
  /** Which table the content comes from */
  contentTable?: "master_content" | "derivative_assets" | "outputs";
  /** Button variant */
  variant?: "default" | "outline" | "ghost";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Custom button text */
  buttonText?: string;
  /** Callback when publish succeeds */
  onSuccess?: (postUrl: string) => void;
}

export function PublishToLinkedIn({
  content,
  contentId,
  contentTable,
  variant = "outline",
  size = "sm",
  buttonText = "Share to LinkedIn",
  onSuccess,
}: PublishToLinkedInProps) {
  const { toast } = useToast();
  const { currentOrganizationId } = useOrganization();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [publishing, setPublishing] = useState(false);
  const [connection, setConnection] = useState<any>(null);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [publishResult, setPublishResult] = useState<{ postUrl: string } | null>(null);

  // Fetch LinkedIn connection when dialog opens
  const handleOpenDialog = async () => {
    setEditedContent(content);
    setPublishResult(null);
    setDialogOpen(true);
    
    if (!currentOrganizationId) return;
    
    setLoadingConnection(true);
    try {
      const { data, error } = await supabase
        .from("linkedin_connections")
        .select("*")
        .eq("organization_id", currentOrganizationId)
        .eq("is_active", true)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching LinkedIn connection:", error);
      }
      
      setConnection(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingConnection(false);
    }
  };

  const handlePublish = async () => {
    if (!currentOrganizationId || !editedContent.trim()) return;

    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("linkedin-publish", {
        body: {
          organizationId: currentOrganizationId,
          text: editedContent,
          contentId,
          contentTable,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setPublishResult({ postUrl: data.postUrl });
        toast({
          title: "Published to LinkedIn!",
          description: data.message || "Your content is now live on LinkedIn.",
        });
        onSuccess?.(data.postUrl);
      } else {
        throw new Error(data?.error || "Failed to publish");
      }
    } catch (err: any) {
      console.error("Error publishing to LinkedIn:", err);
      toast({
        title: "Publish Failed",
        description: err.message || "Failed to publish to LinkedIn. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  // Character count (LinkedIn limit is 3000)
  const charCount = editedContent.length;
  const charLimit = 3000;
  const isOverLimit = charCount > charLimit;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenDialog}
        className="gap-2"
      >
        <Linkedin className="w-4 h-4" />
        {buttonText}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0077B5]" />
              Publish to LinkedIn
            </DialogTitle>
            <DialogDescription>
              Review and edit your post before publishing to LinkedIn.
            </DialogDescription>
          </DialogHeader>

          {/* Success State */}
          {publishResult ? (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Published Successfully!</h3>
                  <p className="text-muted-foreground">Your post is now live on LinkedIn</p>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" asChild>
                  <a href={publishResult.postUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Post
                  </a>
                </Button>
                <Button onClick={() => setDialogOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : loadingConnection ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !connection ? (
            <div className="space-y-4 py-4">
              <Alert>
                <Linkedin className="h-4 w-4" />
                <AlertDescription>
                  LinkedIn is not connected. Please connect your LinkedIn account in{" "}
                  <a href="/settings?tab=integrations" className="underline font-medium">
                    Settings → Integrations
                  </a>{" "}
                  to publish content.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Connection Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {connection.profile_picture_url || connection.linkedin_org_logo_url ? (
                  <img 
                    src={connection.linkedin_org_logo_url || connection.profile_picture_url} 
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {connection.linkedin_org_name || connection.linkedin_user_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Posting as {connection.connection_type === "organization" ? "Company Page" : "Personal Profile"}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Connected
                </Badge>
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <Label htmlFor="linkedin-post">Post Content</Label>
                <Textarea
                  id="linkedin-post"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="What do you want to share?"
                  className="min-h-[200px] resize-none"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Edit your post before publishing
                  </span>
                  <span className={isOverLimit ? "text-red-500 font-medium" : "text-muted-foreground"}>
                    {charCount}/{charLimit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer - only show if connected and not published */}
          {connection && !publishResult && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishing || isOverLimit || !editedContent.trim()}
                className="bg-[#0077B5] hover:bg-[#006097] text-white"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Linkedin className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}




