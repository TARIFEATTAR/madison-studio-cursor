import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const teamMembers = [
  {
    name: "Sarah Bennett",
    email: "sarah@madisonstudio.io",
    role: "Owner",
    initials: "SB",
  },
  {
    name: "Michael Chen",
    email: "michael@madisonstudio.io",
    role: "Editor",
    initials: "MC",
  },
  {
    name: "Emma Rodriguez",
    email: "emma@madisonstudio.io",
    role: "Contributor",
    initials: "ER",
  },
];

export function TeamTab() {
  return (
    <div className="bg-paper-light border border-cream-dark rounded-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-charcoal">Team Members</h2>
        <Button className="bg-brass hover:bg-brass-light text-charcoal">
          Invite Member
        </Button>
      </div>

      {/* Team Member Cards */}
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div
            key={member.email}
            className="flex items-center gap-4 p-4 bg-paper border border-cream-dark rounded-lg"
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-brass text-charcoal font-serif text-base">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-medium text-charcoal">{member.name}</h3>
              <p className="text-sm text-neutral-600">{member.email}</p>
            </div>

            <Badge variant="outline" className="border-cream-dark text-neutral-700">
              {member.role}
            </Badge>

            <Button variant="outline" size="sm" className="border-cream-dark">
              Manage
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
