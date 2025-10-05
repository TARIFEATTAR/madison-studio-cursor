import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useGoogleCalendarConnection = () => {
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
    setConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect Google Calendar",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("google-calendar-oauth/auth", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          app_origin: window.location.origin,
        },
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      console.error("Error connecting to Google Calendar:", error);
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
      setConnecting(false);
    }
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

  return {
    isConnected,
    loading,
    connecting,
    handleConnect,
    handleDisconnect,
  };
};
