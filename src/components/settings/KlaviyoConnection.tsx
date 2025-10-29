import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

export const KlaviyoConnection = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listCount, setListCount] = useState<number | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    loadConnection();
  }, [user]);

  const loadConnection = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (membershipError && membershipError.code !== "PGRST116") throw membershipError;
      if (!membership) {
        setIsLoading(false);
        return;
      }

      setOrganizationId(membership.organization_id);

      // Check if Klaviyo is connected
      const { data: connection, error: connectionError } = await supabase
        .from("klaviyo_connections")
        .select("list_count, last_synced_at")
        .eq("organization_id", membership.organization_id)
        .maybeSingle();

      if (connectionError && connectionError.code !== "PGRST116") {
        throw connectionError;
      }

      if (connection) {
        setIsConnected(true);
        setListCount(connection.list_count);
      }
    } catch (error) {
      console.error("Error loading Klaviyo connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Klaviyo API key");
      return;
    }

    if (!organizationId) {
      toast.error("Organization not found");
      return;
    }

    setIsConnecting(true);

    try {
      const { data, error } = await supabase.functions.invoke("connect-klaviyo", {
        body: {
          api_key: apiKey.trim(),
          organization_id: organizationId,
        },
      });

      if (error || (data as any)?.error) {
        const serverMsg = (data as any)?.error || (error as any)?.message || "Failed to connect Klaviyo";
        console.error("Klaviyo connect error:", { error, data });
        toast.error(serverMsg);
        return;
      }

      if ((data as any)?.success) {
        setIsConnected(true);
        setListCount((data as any).list_count);
        setApiKey("");
        toast.success("Klaviyo connected successfully!");
      } else {
        const msg = (data as any)?.message || "Failed to connect Klaviyo";
        toast.error(msg);
      }
    } catch (error: any) {
      console.error("Error connecting Klaviyo:", error);
      toast.error(error.message || "Failed to connect Klaviyo");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from("klaviyo_connections")
        .delete()
        .eq("organization_id", organizationId);

      if (error) throw error;

      setIsConnected(false);
      setListCount(null);
      toast.success("Klaviyo disconnected");
    } catch (error: any) {
      console.error("Error disconnecting Klaviyo:", error);
      toast.error("Failed to disconnect Klaviyo");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Klaviyo</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Klaviyo account to publish email content directly
            </p>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>Connected</span>
            </div>
          )}
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Lists available</p>
                <p className="text-2xl font-bold">{listCount}</p>
              </div>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Klaviyo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="klaviyo-api-key">API Key</Label>
              <Input
                id="klaviyo-api-key"
                type="password"
                placeholder="Enter your Klaviyo Private API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnecting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from Settings → API Keys in your Klaviyo account
              </p>
            </div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !apiKey.trim()}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Klaviyo"
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
