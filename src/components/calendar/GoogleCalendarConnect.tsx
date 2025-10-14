import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const GoogleCalendarConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("google_calendar_sync")
        .select("sync_enabled")
        .eq("user_id", user.id)
        .single();

      if (!error && data?.sync_enabled) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    toast({
      title: "Google Calendar Setup Required",
      description: "Please configure Google OAuth credentials in your backend settings to enable calendar sync.",
      variant: "destructive",
    });
  };

  const handleDisconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("google_calendar_sync")
        .update({ sync_enabled: false })
        .eq("user_id", user.id);

      if (error) throw error;

      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Google Calendar sync has been disabled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          {isConnected
            ? "Your scheduled content will sync to your Google Calendar"
            : "Connect your Google Calendar to automatically sync scheduled content"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Not connected</span>
              </>
            )}
          </div>
          {isConnected ? (
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={true} variant="outline" className="opacity-50">
              <Calendar className="w-4 h-4 mr-2" />
              Connect Google Calendar (Setup Required)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
