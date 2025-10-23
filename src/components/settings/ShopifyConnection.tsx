import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function ShopifyConnection() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shopDomain, setShopDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrganizationId();
    }
  }, [user]);

  useEffect(() => {
    if (organizationId) {
      checkConnection();
    }
  }, [organizationId]);

  const fetchOrganizationId = async () => {
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setOrganizationId(data.organization_id);
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
  };

  const checkConnection = async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from("shopify_connections")
        .select("*")
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsConnected(true);
        setShopDomain(data.shop_domain);
        setLastSyncedAt(data.last_synced_at);
        setConnectionId(data.id);
      }
    } catch (error) {
      console.error("Error checking Shopify connection:", error);
    }
  };

  const handleConnect = async () => {
    if (!shopDomain || !accessToken) {
      toast({
        title: "Missing Information",
        description: "Please provide both shop domain and access token",
        variant: "destructive",
      });
      return;
    }

    if (!organizationId) {
      toast({
        title: "No Organization",
        description: "Please select an organization first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store connection (in production, access_token should be properly encrypted)
      const { error } = await supabase
        .from("shopify_connections")
        .upsert({
          organization_id: organizationId,
          shop_domain: shopDomain,
          access_token_encrypted: accessToken, // TODO: Implement proper encryption
          sync_status: "idle",
        });

      if (error) throw error;

      setIsConnected(true);
      setAccessToken(""); // Clear token from UI
      await checkConnection();

      toast({
        title: "Connected to Shopify",
        description: `Successfully connected to ${shopDomain}`,
      });
    } catch (error: any) {
      console.error("Error connecting to Shopify:", error);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connectionId) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("shopify_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      setIsConnected(false);
      setShopDomain("");
      setLastSyncedAt(null);
      setConnectionId(null);

      toast({
        title: "Disconnected",
        description: "Shopify connection removed",
      });
    } catch (error: any) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Disconnection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncProducts = async () => {
    if (!organizationId || !connectionId) return;

    setIsSyncing(true);

    try {
      // Update sync status
      await supabase
        .from("shopify_connections")
        .update({ sync_status: "syncing" })
        .eq("id", connectionId);

      // Call edge function to sync products
      const { data, error } = await supabase.functions.invoke("sync-shopify-products", {
        body: { organization_id: organizationId },
      });

      if (error) throw error;

      // Update last synced timestamp
      await supabase
        .from("shopify_connections")
        .update({ 
          last_synced_at: new Date().toISOString(),
          sync_status: "idle"
        })
        .eq("id", connectionId);

      await checkConnection();

      toast({
        title: "Products Synced",
        description: `Successfully synced ${data?.count || 0} products from Shopify`,
      });
    } catch (error: any) {
      console.error("Error syncing products:", error);
      
      // Reset sync status on error
      await supabase
        .from("shopify_connections")
        .update({ sync_status: "error" })
        .eq("id", connectionId);

      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync products from Shopify",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-emerald-500/5 border-emerald-500/20">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <div className="flex-1">
            <p className="font-medium">Connected to Shopify</p>
            <p className="text-sm text-muted-foreground">{shopDomain}</p>
            {lastSyncedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced: {new Date(lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSyncProducts}
            disabled={isSyncing}
            className="flex-1"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing Products...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Products
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
        <XCircle className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Not connected to Shopify
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shop-domain">Shop Domain</Label>
          <Input
            id="shop-domain"
            placeholder="your-store.myshopify.com"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your Shopify store URL (e.g., tarifa-tarr.myshopify.com)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="access-token">Admin API Access Token</Label>
          <Input
            id="access-token"
            type="password"
            placeholder="shpat_..."
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Generate an Admin API access token from your Shopify admin
          </p>
        </div>

        <Button
          onClick={handleConnect}
          disabled={isLoading || !shopDomain || !accessToken}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect to Shopify"
          )}
        </Button>
      </div>
    </div>
  );
}
