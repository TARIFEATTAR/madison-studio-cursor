import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, UserMinus, Mail, Clock } from "lucide-react";
import { useState } from "react";

export function TeamTab() {
  const { currentOrganizationId } = useOnboarding();
  const { members, invitations, isLoading, removeMember } = useTeamMembers(currentOrganizationId);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
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

  if (isLoading) {
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
            {memberCount} of {MEMBER_LIMIT} members
          </p>
        </div>
        <Button 
          className="bg-brass hover:bg-brass-light text-charcoal"
          onClick={() => setInviteDialogOpen(true)}
          disabled={memberCount >= MEMBER_LIMIT}
        >
          Invite Member
        </Button>
      </div>

      {/* Current Members */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-medium text-charcoal">Current Members</h3>
        {members && members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 bg-paper border border-cream-dark rounded-lg"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-brass text-charcoal font-serif text-base">
                  {getInitials(member.user_id)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-medium text-charcoal">User {member.user_id.substring(0, 8)}</h3>
                <p className="text-sm text-neutral-600">{member.user_id}</p>
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
              className="flex items-center gap-4 p-4 bg-paper border border-cream-dark rounded-lg opacity-60"
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
