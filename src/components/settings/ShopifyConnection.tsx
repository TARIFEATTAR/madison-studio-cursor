import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

export function ShopifyConnection() {
  const { toast } = useToast();
  const { user } = useAuthContext();
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
      logger.error("Error fetching organization:", error);
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
        // Check if connection has proper encryption (IV is required)
        if (data.access_token_encrypted && !data.access_token_iv) {
          // Old connection without encryption - needs reconnection
          toast({
            title: "Connection Update Required",
            description: "Please disconnect and reconnect your Shopify account to enable encryption.",
            variant: "destructive",
            duration: 8000,
          });
        }
        
        setIsConnected(true);
        setShopDomain(data.shop_domain);
        setLastSyncedAt(data.last_synced_at);
        setConnectionId(data.id);
      }
    } catch (error) {
      // Error checking connection - silently fail
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
      // Call edge function to encrypt and store the connection
      const { data, error } = await supabase.functions.invoke("connect-shopify", {
        body: {
          organization_id: organizationId,
          shop_domain: shopDomain,
          access_token: accessToken,
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "Failed to connect to Shopify");
      }

      setIsConnected(true);
      setAccessToken(""); // Clear token from UI
      await checkConnection();

      toast({
        title: "Connected to Shopify",
        description: `Successfully connected to ${shopDomain}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Shopify",
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
      logger.error("Error disconnecting:", error);
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

      if (error) {
        // Try to extract detailed error message from response
        let errorMessage = error.message || "Failed to sync products from Shopify";
        
        // Check error context for response body (might be a ReadableStream)
        if (error.context?.body) {
          try {
            // If it's a ReadableStream, read it
            if (error.context.body instanceof ReadableStream) {
              const reader = error.context.body.getReader();
              const decoder = new TextDecoder();
              let chunks = '';
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks += decoder.decode(value, { stream: true });
              }
              
              // Parse the JSON response
              try {
                const parsed = JSON.parse(chunks);
                if (parsed.error) {
                  errorMessage = parsed.error;
                } else if (parsed.message) {
                  errorMessage = parsed.message;
                }
              } catch (e) {
                // If not JSON, use the raw text
                if (chunks.length < 500) {
                  errorMessage = chunks;
                }
              }
            } else if (typeof error.context.body === 'string') {
              // If it's already a string, try to parse as JSON
              try {
                const parsed = JSON.parse(error.context.body);
                if (parsed.error) {
                  errorMessage = parsed.error;
                } else if (parsed.message) {
                  errorMessage = parsed.message;
                }
              } catch (e) {
                // If parsing fails, use the string directly
                if (error.context.body.length < 500) {
                  errorMessage = error.context.body;
                }
              }
            } else {
              // If it's already an object
              if (error.context.body.error) {
                errorMessage = error.context.body.error;
              } else if (error.context.body.message) {
                errorMessage = error.context.body.message;
              }
            }
          } catch (e) {
            console.error("Error extracting error message:", e);
          }
        }
        
        // Check error context for status code and provide helpful messages
        if (error.context?.status) {
          const status = error.context.status;
          if (status === 404) {
            errorMessage = "Shopify connection not found. Please reconnect your Shopify account.";
          } else if (status === 500) {
            errorMessage = errorMessage || "Server error occurred. Please try again or contact support.";
          } else if (status === 400 && !errorMessage.includes('Shopify') && !errorMessage.includes('encryption')) {
            errorMessage = errorMessage || "Invalid request. Please check your connection and try again.";
          }
        }
        
        logger.error("Sync function error:", { 
          error: error.message,
          status: error.context?.status,
          extractedMessage: errorMessage
        });
        throw new Error(errorMessage);
      }

      // Check if the response indicates failure
      if (data && !data.success) {
        throw new Error(data.error || "Failed to sync products from Shopify");
      }

      // Update last synced timestamp (only if sync was successful)
      await supabase
        .from("shopify_connections")
        .update({ 
          last_synced_at: new Date().toISOString(),
          sync_status: "idle"
        })
        .eq("id", connectionId);

      await checkConnection();

      // Show success message with sync results
      const totalSynced = data?.total || data?.updated + data?.inserted || 0;
      const updated = data?.updated || 0;
      const inserted = data?.inserted || 0;
      
      toast({
        title: "Products Synced",
        description: `Successfully synced ${totalSynced} products (${updated} updated, ${inserted} new) from Shopify`,
      });
    } catch (error: any) {
      logger.error("Error syncing products:", error);
      
      // Reset sync status on error
      await supabase
        .from("shopify_connections")
        .update({ sync_status: "error" })
        .eq("id", connectionId);

      // Extract error message from response if available
      let errorMessage = error.message || "Failed to sync products from Shopify";
      
      // If error has a context with body, try to parse it
      if (error.context?.body) {
        try {
          const parsed = typeof error.context.body === 'string' 
            ? JSON.parse(error.context.body) 
            : error.context.body;
          if (parsed.error) {
            errorMessage = parsed.error;
          }
        } catch (e) {
          // If parsing fails, use original message
        }
      }
      
      toast({
        title: "Sync Failed",
        description: errorMessage,
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
            <p className="text-xs text-amber-600 mt-2 font-medium">
              ⚠️ If sync fails, please disconnect and reconnect to enable encryption.
            </p>
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
        
        <p className="text-xs text-muted-foreground">
          Sync imports all products including SKU, pricing, variants, images, and inventory into your Product Hub.
        </p>
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
