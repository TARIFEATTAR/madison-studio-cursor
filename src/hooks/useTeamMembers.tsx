import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useTeamMembers(organizationId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch team members
  const { data: members, isLoading } = useQuery({
    queryKey: ["team-members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      // Fetch organization members
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select("id, role, created_at, user_id")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true });

      if (memberError) throw memberError;
      if (!memberData) return [];

      // Fetch profiles using the SECURITY DEFINER function
      const { data: profiles, error: profileError } = await supabase
        .rpc("get_team_member_profiles", { _org_id: organizationId });

      if (profileError) {
        console.error("Error fetching team member profiles:", profileError);
        // Fallback: return members without profiles if function fails
        return memberData.map(member => ({
          ...member,
          profiles: {
            email: null,
            full_name: null
          }
        }));
      }

      // Create a map of user_id -> profile for quick lookup
      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Merge members with their profiles
      return memberData.map(member => {
        const profile = profileMap.get(member.user_id);
        return {
          ...member,
          profiles: profile ? {
            email: profile.email,
            full_name: profile.full_name
          } : {
            email: null,
            full_name: null
          }
        };
      });
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Fetch pending invitations
  const { data: invitations } = useQuery({
    queryKey: ["team-invitations", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("organization_id", organizationId)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (invitations change more frequently)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Remove member mutation
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", organizationId] });
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove team member: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel invitation mutation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invitations", organizationId] });
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel invitation: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    members,
    invitations,
    isLoading,
    removeMember: removeMember.mutate,
    cancelInvitation: cancelInvitation.mutate,
  };
}

