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
      
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          id,
          role,
          created_at,
          user_id
        `)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
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

  return {
    members,
    invitations,
    isLoading,
    removeMember: removeMember.mutate,
  };
}
