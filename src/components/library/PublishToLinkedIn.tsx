/**
 * PublishToLinkedIn - Button to publish content directly to LinkedIn
 * 
 * This component provides a simple way to post content to a connected
 * LinkedIn profile or company page.
 * 
 * Supports:
 * - Text posts
 * - Image attachments (from image library)
 * - Article/blog links
 */

import { useState } from "react";
import { Linkedin, Loader2, Check, ExternalLink, ImageIcon, Link2, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { ImageLibraryPicker } from "@/components/email-composer/ImageLibraryPicker";

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
  /** Optional default image URL */
  defaultImageUrl?: string;
  /** Optional default article/blog URL */
  defaultArticleUrl?: string;
  /** Optional article title for link preview */
  defaultArticleTitle?: string;
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
  defaultImageUrl = "",
  defaultArticleUrl = "",
  defaultArticleTitle = "",
  onSuccess,
}: PublishToLinkedInProps) {
  const { toast } = useToast();
  const { organizationId } = useOrganization();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [publishing, setPublishing] = useState(false);
  const [connection, setConnection] = useState<any>(null);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [publishResult, setPublishResult] = useState<{ postUrl: string } | null>(null);
  
  // Image and article state
  const [selectedImageUrl, setSelectedImageUrl] = useState(defaultImageUrl);
  const [articleUrl, setArticleUrl] = useState(defaultArticleUrl);
  const [articleTitle, setArticleTitle] = useState(defaultArticleTitle);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showArticleLink, setShowArticleLink] = useState(!!defaultArticleUrl);

  // Fetch LinkedIn connection when dialog opens
  const handleOpenDialog = async () => {
    setEditedContent(content);
    setPublishResult(null);
    setSelectedImageUrl(defaultImageUrl);
    setArticleUrl(defaultArticleUrl);
    setArticleTitle(defaultArticleTitle);
    setShowImagePicker(false);
    setShowArticleLink(!!defaultArticleUrl);
    setDialogOpen(true);
    
    if (!organizationId) return;
    
    setLoadingConnection(true);
    try {
      const { data, error } = await supabase
        .from("linkedin_connections")
        .select("*")
        .eq("organization_id", organizationId)
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
    if (!organizationId || !editedContent.trim()) return;

    setPublishing(true);
    try {
      // Build the request body with optional image and article
      const requestBody: any = {
        organizationId: organizationId,
        text: editedContent,
        contentId,
        contentTable,
      };

      // Add image if selected
      if (selectedImageUrl) {
        requestBody.imageUrl = selectedImageUrl;
      }

      // Add article link if provided
      if (articleUrl) {
        requestBody.articleUrl = articleUrl;
        if (articleTitle) {
          requestBody.articleTitle = articleTitle;
        }
      }

      console.log("[PublishToLinkedIn] Publishing with:", {
        hasImage: !!selectedImageUrl,
        hasArticle: !!articleUrl,
        textLength: editedContent.length
      });

      const { data, error } = await supabase.functions.invoke("linkedin-publish", {
        body: requestBody,
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0077B5]" />
              Publish to LinkedIn
            </DialogTitle>
            <DialogDescription>
              Review and edit your post before publishing to LinkedIn.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
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
                  className="min-h-[150px] resize-none"
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

              {/* Image Attachment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Attach Image
                  </Label>
                  {selectedImageUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedImageUrl("")}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
                
                {selectedImageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
                    <img 
                      src={selectedImageUrl} 
                      alt="Selected" 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setShowImagePicker(true)}
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-20 border-dashed"
                    onClick={() => setShowImagePicker(true)}
                  >
                    <ImageIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Select from Image Library</span>
                  </Button>
                )}

                {/* Image Picker Modal */}
                {showImagePicker && (
                  <Dialog open={showImagePicker} onOpenChange={setShowImagePicker}>
                    <DialogContent className="w-[95vw] max-w-[700px] max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Select Image</DialogTitle>
                        <DialogDescription>
                          Choose an image from your library to attach to your LinkedIn post.
                        </DialogDescription>
                      </DialogHeader>
                      <ImageLibraryPicker
                        value={selectedImageUrl}
                        onChange={(url) => {
                          setSelectedImageUrl(url);
                          setShowImagePicker(false);
                        }}
                        organizationId={organizationId || undefined}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Article Link */}
              <Collapsible open={showArticleLink} onOpenChange={setShowArticleLink}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                    <Link2 className="w-4 h-4" />
                    {showArticleLink ? "Hide Article Link" : "Add Article/Blog Link"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="article-url" className="text-sm">Blog/Article URL</Label>
                    <Input
                      id="article-url"
                      type="url"
                      value={articleUrl}
                      onChange={(e) => setArticleUrl(e.target.value)}
                      placeholder="https://yourblog.com/article"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="article-title" className="text-sm">Link Title (optional)</Label>
                    <Input
                      id="article-title"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      placeholder="Read the full article..."
                      className="text-sm"
                    />
                  </div>
                  {articleUrl && (
                    <p className="text-xs text-muted-foreground">
                      {selectedImageUrl 
                        ? "Note: With an image attached, the link will appear in your post text."
                        : "LinkedIn will show a preview card for this link."}
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
          </div>

          {/* Footer - only show if connected and not published */}
          {connection && !publishResult && (
            <DialogFooter className="flex-shrink-0">
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






