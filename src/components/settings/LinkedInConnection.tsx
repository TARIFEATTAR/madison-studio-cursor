/**
 * LinkedInConnection - LinkedIn Integration Settings Component
 * 
 * Allows users to connect/disconnect their LinkedIn profile or company page
 * to publish content directly from Madison Studio.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  ExternalLink, 
  Check, 
  X, 
  Loader2, 
  Linkedin,
  Building2,
  User,
  RefreshCw,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface LinkedInConnectionData {
  id: string;
  linkedin_user_id: string;
  linkedin_user_name: string | null;
  linkedin_email: string | null;
  profile_picture_url: string | null;
  linkedin_org_id: string | null;
  linkedin_org_name: string | null;
  linkedin_org_vanity_name: string | null;
  linkedin_org_logo_url: string | null;
  connected_at: string;
  last_post_at: string | null;
  is_active: boolean;
  connection_type: "personal" | "organization";
  scopes: string[];
  token_expiry: string;
}

interface LinkedInConnectionProps {
  organizationId: string | null;
}

export function LinkedInConnection({ organizationId }: LinkedInConnectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [connection, setConnection] = useState<LinkedInConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Check for OAuth callback results
  useEffect(() => {
    const success = searchParams.get("linkedin_success");
    const error = searchParams.get("linkedin_error");
    const linkedinName = searchParams.get("linkedin_name");
    const connectionType = searchParams.get("connection_type");

    if (success) {
      toast({
        title: "LinkedIn Connected!",
        description: linkedinName 
          ? `Successfully connected to ${linkedinName}${connectionType === 'organization' ? ' (Company Page)' : ''}` 
          : "Your LinkedIn account is now connected",
      });
      // Clear params
      searchParams.delete("linkedin_success");
      searchParams.delete("linkedin_name");
      searchParams.delete("connection_type");
      setSearchParams(searchParams);
      // Refresh connection
      fetchConnection();
    } else if (error) {
      toast({
        title: "Connection Failed",
        description: decodeURIComponent(error).replace(/_/g, " "),
        variant: "destructive",
      });
      searchParams.delete("linkedin_error");
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
      setLoading(false);
    }
  };

  const handleConnect = async (connectionType: "personal" | "organization" = "personal") => {
    if (!organizationId || !user) return;

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("linkedin-oauth-start", {
        body: { 
          organizationId,
          redirectUrl: `${window.location.origin}/settings?tab=integrations`,
          connectionType
        },
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Redirect to LinkedIn authorization
        window.location.href = data.authUrl;
      } else if (data?.setup_instructions) {
        // LinkedIn not configured - show setup instructions
        toast({
          title: "LinkedIn Integration Not Configured",
          description: "Please ask your administrator to set up LinkedIn API credentials.",
          variant: "destructive",
        });
        console.log("LinkedIn setup instructions:", data.setup_instructions);
        setConnecting(false);
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (err: any) {
      console.error("Error starting OAuth:", err);
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to start LinkedIn authorization",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!organizationId || !connection) return;

    setDisconnecting(true);
    try {
      // Simply deactivate the connection
      const { error } = await supabase
        .from("linkedin_connections")
        .update({ is_active: false })
        .eq("id", connection.id);

      if (error) throw error;

      setConnection(null);
      toast({
        title: "Disconnected",
        description: "Your LinkedIn account has been disconnected",
      });
    } catch (err: any) {
      console.error("Error disconnecting:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to disconnect LinkedIn",
        variant: "destructive",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  // Check if token is expired or about to expire
  const isTokenExpiring = connection && new Date(connection.token_expiry) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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
          Connect your LinkedIn account to publish content directly from Madison. 
          You can post to your personal profile or company page.
        </p>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleConnect("personal")} 
            disabled={connecting || !organizationId}
            className="bg-[#0077B5] hover:bg-[#006097] text-white"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Connect Profile
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => handleConnect("organization")} 
            disabled={connecting || !organizationId}
            variant="outline"
            className="border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5]/10"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Connect Company Page
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Company page posting requires LinkedIn Marketing Developer Platform access. 
          If you only see personal profile options, start with that!
        </p>

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
  const displayName = connection.linkedin_org_name || connection.linkedin_user_name || "LinkedIn";
  const isOrgConnection = connection.connection_type === "organization";

  return (
    <div className="space-y-6">
      {/* Token Expiry Warning */}
      {isTokenExpiring && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your LinkedIn connection will expire soon. Please reconnect to continue posting.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
        <div className="flex items-center gap-3">
          {connection.profile_picture_url || connection.linkedin_org_logo_url ? (
            <img 
              src={connection.linkedin_org_logo_url || connection.profile_picture_url || ""} 
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center">
              {isOrgConnection ? (
                <Building2 className="w-5 h-5 text-white" />
              ) : (
                <Linkedin className="w-5 h-5 text-white" />
              )}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{displayName}</p>
              <Badge variant="outline" className="text-[#0077B5] border-[#0077B5]">
                {isOrgConnection ? "Company Page" : "Personal"}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connected
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Connected {new Date(connection.connected_at).toLocaleDateString()}
              {connection.last_post_at && (
                <> · Last post: {new Date(connection.last_post_at).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOrgConnection && connection.linkedin_org_vanity_name && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://www.linkedin.com/company/${connection.linkedin_org_vanity_name}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Page
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
                <AlertDialogTitle>Disconnect LinkedIn?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect your LinkedIn {isOrgConnection ? 'company page' : 'profile'} from Madison. 
                  You won't be able to publish to LinkedIn until you reconnect.
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

      {/* Connection Info */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Permissions Granted</Label>
        <div className="flex flex-wrap gap-2">
          {connection.scopes.map((scope) => (
            <Badge key={scope} variant="secondary" className="text-xs">
              {scope.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      </div>

      {/* Refresh Connection */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchConnection}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        
        {isTokenExpiring && (
          <Button 
            size="sm"
            onClick={() => handleConnect(connection.connection_type)}
            className="bg-[#0077B5] hover:bg-[#006097] text-white"
          >
            Reconnect
          </Button>
        )}
      </div>
    </div>
  );
}



