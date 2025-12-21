import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, UserMinus, Mail, Clock, X } from "lucide-react";
import { useState } from "react";

export function TeamTab() {
  const { orgId: currentOrganizationId, loading: orgIdLoading } = useCurrentOrganizationId();
  const { members, invitations, isLoading, removeMember, cancelInvitation } = useTeamMembers(currentOrganizationId);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Only show full loading spinner if we don't have orgId yet
  // If we have cached orgId, show the UI immediately even while data is fetching
  if (orgIdLoading && !currentOrganizationId) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  const memberCount = members?.length || 0;
  const invitationCount = invitations?.length || 0;
  const MEMBER_LIMIT = 10; // Temporary hard limit

  return (
    <div className="bg-paper-light border border-cream-dark rounded-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif text-charcoal">Team Members</h2>
          <p className="text-sm text-neutral-600 mt-1">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </span>
            ) : (
              `${memberCount} of ${MEMBER_LIMIT} members`
            )}
          </p>
        </div>
        <Button
          className="bg-brass hover:bg-brass-light text-charcoal"
          onClick={() => setInviteDialogOpen(true)}
          disabled={memberCount >= MEMBER_LIMIT || isLoading}
        >
          Invite Member
        </Button>
      </div>

      {/* Current Members */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-medium text-charcoal">Current Members</h3>
        {isLoading && !members ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-brass" />
          </div>
        ) : members && members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 bg-paper border border-cream-dark rounded-lg"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-brass text-charcoal font-serif text-base">
                  {getInitials((member as any).profiles?.full_name || (member as any).profiles?.email || member.user_id?.slice(0, 2).toUpperCase() || 'U')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-medium text-charcoal">
                  {(member as any).profiles?.full_name || (member as any).profiles?.email || `User ${member.user_id?.slice(0, 8)}`}
                </h3>
                <p className="text-sm text-neutral-600">
                  {(member as any).profiles?.email || member.user_id || 'No email'}
                </p>
              </div>

              <Badge
                variant={getRoleBadgeVariant(member.role)}
                className="border-cream-dark capitalize"
              >
                {member.role}
              </Badge>

              {member.role !== "owner" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-cream-dark">
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove this member from your organization. They will lose access to all content and settings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeMember(member.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))
        ) : (
          <p className="text-neutral-500 italic">No team members yet</p>
        )}
      </div>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-charcoal flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Invitations
          </h3>
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center gap-4 p-4 bg-paper border border-cream-dark rounded-lg opacity-75 hover:opacity-100 transition-opacity"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-neutral-300 text-charcoal font-serif text-base">
                  <Mail className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-medium text-charcoal">{invitation.email}</h3>
                <p className="text-sm text-neutral-600">
                  Invited {new Date(invitation.created_at).toLocaleDateString()}
                </p>
              </div>

              <Badge variant="outline" className="border-cream-dark capitalize">
                {invitation.role} (Pending)
              </Badge>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-cream-dark hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel the invitation sent to <strong>{invitation.email}</strong>. They will no longer be able to join your organization using this invitation.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelInvitation(invitation.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Cancel Invitation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        organizationId={currentOrganizationId}
        currentMemberCount={memberCount}
        memberLimit={MEMBER_LIMIT}
      />
    </div>
  );
}
