/**
 * EtsyConnection - Etsy Integration Settings Component
 * 
 * Allows users to connect/disconnect their Etsy shop and configure
 * default settings for listing creation.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  ExternalLink, 
  Check, 
  X, 
  Loader2, 
  Store, 
  Settings2, 
  RefreshCw,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EtsyConnection {
  id: string;
  shop_id: string;
  shop_name: string;
  shop_url: string | null;
  connected_at: string;
  last_sync_at: string | null;
  is_active: boolean;
  default_who_made: string;
  default_when_made: string;
  default_is_supply: boolean;
}

interface EtsyConnectionProps {
  organizationId: string | null;
}

export function EtsyConnection({ organizationId }: EtsyConnectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [connection, setConnection] = useState<EtsyConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Check for OAuth callback results
  useEffect(() => {
    const success = searchParams.get("etsy_success");
    const error = searchParams.get("etsy_error");
    const shopName = searchParams.get("shop_name");

    if (success) {
      toast({
        title: "Etsy Connected!",
        description: shopName 
          ? `Successfully connected to ${shopName}` 
          : "Your Etsy shop is now connected",
      });
      // Clear params
      searchParams.delete("etsy_success");
      searchParams.delete("shop_name");
      setSearchParams(searchParams);
      // Refresh connection
      fetchConnection();
    } else if (error) {
      toast({
        title: "Connection Failed",
        description: decodeURIComponent(error).replace(/_/g, " "),
        variant: "destructive",
      });
      searchParams.delete("etsy_error");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  // Fetch existing connection
  useEffect(() => {
    if (organizationId) {
      fetchConnection();
    }
  }, [organizationId]);

  const fetchConnection = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("etsy_connections")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching Etsy connection:", error);
      }
      
      setConnection(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!organizationId || !user) return;

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("etsy-oauth-start", {
        body: { 
          organizationId,
          redirectUrl: `${window.location.origin}/settings?tab=integrations`
        },
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Redirect to Etsy authorization
        window.location.href = data.authUrl;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (err: any) {
      console.error("Error starting OAuth:", err);
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to start Etsy authorization",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!organizationId) return;

    setDisconnecting(true);
    try {
      const { error } = await supabase.functions.invoke("etsy-disconnect", {
        body: { organizationId },
      });

      if (error) throw error;

      setConnection(null);
      toast({
        title: "Disconnected",
        description: "Your Etsy shop has been disconnected",
      });
    } catch (err: any) {
      console.error("Error disconnecting:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to disconnect Etsy",
        variant: "destructive",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const updateSetting = async (field: string, value: any) => {
    if (!connection) return;

    setUpdatingSettings(true);
    try {
      const { error } = await supabase
        .from("etsy_connections")
        .update({ [field]: value })
        .eq("id", connection.id);

      if (error) throw error;

      setConnection(prev => prev ? { ...prev, [field]: value } : null);
      toast({
        title: "Settings Updated",
        description: "Your Etsy default settings have been saved",
      });
    } catch (err: any) {
      console.error("Error updating settings:", err);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setUpdatingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Not connected state
  if (!connection) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Etsy shop to push listings directly from Madison. 
          Listings are created as drafts so you can review before publishing.
        </p>
        
        <Button 
          onClick={handleConnect} 
          disabled={connecting || !organizationId}
          className="bg-[#F56400] hover:bg-[#E55400] text-white"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Store className="w-4 h-4 mr-2" />
              Connect Etsy Shop
            </>
          )}
        </Button>

        {!organizationId && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete your organization setup first.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Connected state
  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{connection.shop_name}</p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connected
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Connected {new Date(connection.connected_at).toLocaleDateString()}
              {connection.last_sync_at && (
                <> · Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connection.shop_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={connection.shop_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Shop
              </a>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <X className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Etsy Shop?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect your Etsy shop from Madison. Your existing Etsy listings will not be affected, but you won't be able to push new listings until you reconnect.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {disconnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Default Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Default Listing Settings</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          These defaults will be applied to all new Etsy listings. You can override them per listing.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Who Made */}
          <div className="space-y-2">
            <Label htmlFor="who-made">Who Made It</Label>
            <Select
              value={connection.default_who_made}
              onValueChange={(value) => updateSetting("default_who_made", value)}
              disabled={updatingSettings}
            >
              <SelectTrigger id="who-made">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="i_did">I did</SelectItem>
                <SelectItem value="someone_else">A member of my shop</SelectItem>
                <SelectItem value="collective">Another company or person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* When Made */}
          <div className="space-y-2">
            <Label htmlFor="when-made">When Was It Made</Label>
            <Select
              value={connection.default_when_made}
              onValueChange={(value) => updateSetting("default_when_made", value)}
              disabled={updatingSettings}
            >
              <SelectTrigger id="when-made">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="made_to_order">Made to Order</SelectItem>
                <SelectItem value="2020_2025">2020-2025</SelectItem>
                <SelectItem value="2010_2019">2010-2019</SelectItem>
                <SelectItem value="2000_2009">2000-2009</SelectItem>
                <SelectItem value="1990_1999">1990s</SelectItem>
                <SelectItem value="before_1990">Before 1990</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Is Supply */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label htmlFor="is-supply" className="text-sm font-medium">
              Is this a craft supply?
            </Label>
            <p className="text-xs text-muted-foreground">
              Check if this is a supply used to make other things
            </p>
          </div>
          <Switch
            id="is-supply"
            checked={connection.default_is_supply}
            onCheckedChange={(checked) => updateSetting("default_is_supply", checked)}
            disabled={updatingSettings}
          />
        </div>
      </div>

      {/* Refresh Connection */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={fetchConnection}
        disabled={loading}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh Connection
      </Button>
    </div>
  );
}


























