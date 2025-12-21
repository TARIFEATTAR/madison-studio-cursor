/**
 * GoogleMeetWidget - Widget for displaying Google Meet links
 * 
 * Features:
 * - Add/edit Google Meet link
 * - Preview display with thumbnail
 * - Click to expand to fullscreen
 * - Resizable widget
 */

import { useState, useEffect } from "react";
import { Video, Plus, Edit2, ExternalLink, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TVFrame } from "@/components/ui/tv-frame";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { cn } from "@/lib/utils";
import React from "react";

interface OrganizationSettings {
  googleMeetLinks?: Record<string, string>;
  [key: string]: unknown;
}

interface GoogleMeetWidgetProps {
  widgetId?: string;
}

// Extract meeting ID from Google Meet URL
function extractMeetId(url: string): string | null {
  if (!url) return null;

  // Handle different Google Meet URL formats
  // https://meet.google.com/abc-defg-hij
  // https://meet.google.com/abc-defg-hij?authuser=0
  const match = url.match(/meet\.google\.com\/([a-z-]+)/i);
  return match ? match[1] : null;
}

// Generate Google Meet embed URL
function getMeetEmbedUrl(meetId: string): string {
  return `https://meet.google.com/${meetId}`;
}

// Generate Google Meet thumbnail URL (if available)
function getMeetThumbnailUrl(meetId: string): string {
  // Google Meet doesn't provide direct thumbnails, but we can use a placeholder
  return `https://via.placeholder.com/400x225/4285F4/FFFFFF?text=Google+Meet`;
}

export function GoogleMeetWidget({ widgetId = 'google-meet' }: GoogleMeetWidgetProps) {
  const { organizationId } = useOrganization();
  const { toast } = useToast();
  const [meetUrl, setMeetUrl] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadMeetLink = React.useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single();

      const settings = data?.settings as unknown as OrganizationSettings | null;
      if (settings?.googleMeetLinks?.[widgetId]) {
        setMeetUrl(settings.googleMeetLinks[widgetId]);
      }
    } catch (error) {
      console.error('Error loading Google Meet link:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, widgetId]);

  useEffect(() => {
    loadMeetLink();
  }, [loadMeetLink]);

  const saveMeetLink = async (url: string) => {
    if (!organizationId) return;

    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single();

      const currentSettings = (orgData?.settings && typeof orgData.settings === 'object')
        ? orgData.settings as unknown as OrganizationSettings
        : {};

      const updatedSettings = {
        ...currentSettings,
        googleMeetLinks: {
          ...(currentSettings.googleMeetLinks || {}),
          [widgetId]: url,
        },
      };

      await supabase
        .from('organizations')
        .update({ settings: updatedSettings })
        .eq('id', organizationId);

      setMeetUrl(url);
      setIsEditing(false);
      toast({
        title: 'Google Meet link saved',
        description: 'Your meeting link has been updated.',
      });
    } catch (error) {
      console.error('Error saving Google Meet link:', error);
      toast({
        title: 'Error',
        description: 'Failed to save Google Meet link.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    if (!meetUrl.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Google Meet URL.',
        variant: 'destructive',
      });
      return;
    }

    const meetId = extractMeetId(meetUrl);
    if (!meetId) {
      toast({
        title: 'Invalid Google Meet URL',
        description: 'Please enter a valid Google Meet URL (e.g., https://meet.google.com/abc-defg-hij)',
        variant: 'destructive',
      });
      return;
    }

    saveMeetLink(meetUrl);
  };

  const meetId = extractMeetId(meetUrl);
  const hasLink = !!meetId;

  if (isLoading) {
    return (
      <Card className="bg-card border-border h-full flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-border h-full flex flex-col hover-lift transition-all duration-200">
        <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
              <Video className="w-4 h-4 text-primary" />
              Google Meet
            </CardTitle>
            <div className="flex items-center gap-1">
              {hasLink && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsFullscreen(true)}
                  title="Expand to fullscreen"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsEditing(true)}
                title={hasLink ? "Edit meeting link" : "Add meeting link"}
              >
                {hasLink ? <Edit2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-3 pt-0">
          {hasLink ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              {/* TV Frame with Preview */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="w-full group"
              >
                <TVFrame
                  className="w-full h-full min-h-[280px]"
                  meetingId={meetId || undefined}
                  meetingUrl={meetUrl}
                  onJoinClick={() => {
                    window.open(meetUrl, '_blank');
                  }}
                >
                  <div className="relative w-full h-full aspect-video rounded overflow-hidden bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center">
                    {/* Google Meet Logo/Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 md:w-16 md:h-16 text-white/90 drop-shadow-lg" />
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center z-40">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-medium flex items-center gap-2 shadow-level-2">
                        <Maximize2 className="w-3 h-3 md:w-4 md:h-4" />
                        Click to join meeting
                      </div>
                    </div>
                  </div>
                </TVFrame>
              </button>

              {/* Meeting Info */}
              <div className="w-full text-center space-y-2 mt-2">
                <p className="text-xs text-muted-foreground truncate">
                  {meetUrl}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  No meeting link added
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Add a Google Meet link to display it here
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Meeting Link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google Meet Link</DialogTitle>
            <DialogDescription>
              Enter your Google Meet URL. It will be displayed as a preview in the widget.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meet-url">Meeting URL</Label>
              <Input
                id="meet-url"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Example: https://meet.google.com/abc-defg-hij
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Modal - Opens Google Meet in new window */}
      {isFullscreen && meetId && (
        <div
          className="fixed inset-0 z-[2000] bg-background/95 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="bg-card border border-border rounded-lg shadow-level-3 max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-medium text-foreground">Join Google Meet</h2>
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {meetUrl}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Preview/Info */}
            <div className="space-y-4 mb-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center">
                <Video className="w-20 h-20 text-white/90" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  Ready to join?
                </p>
                <p className="text-xs text-muted-foreground">
                  Click the button below to open Google Meet in a new window
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsFullscreen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  window.open(meetUrl, '_blank', 'width=1280,height=720');
                  setIsFullscreen(false);
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Join Meeting
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
