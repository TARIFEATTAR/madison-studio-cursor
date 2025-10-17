-- Create team_invitations table
create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role organization_role not null default 'member',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null default (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  
  -- Ensure valid email format
  constraint valid_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  
  -- Prevent duplicate pending invitations (only when accepted_at is null)
  constraint unique_pending_invitation unique nulls not distinct (organization_id, email, accepted_at)
);

-- Enable RLS
alter table public.team_invitations enable row level security;

-- RLS Policies: Only owners/admins can view and create invitations
create policy "Owners and admins can view their org invitations"
  on public.team_invitations
  for select
  using (
    has_organization_role(auth.uid(), organization_id, 'owner') OR
    has_organization_role(auth.uid(), organization_id, 'admin')
  );

create policy "Owners and admins can create invitations"
  on public.team_invitations
  for insert
  with check (
    has_organization_role(auth.uid(), organization_id, 'owner') OR
    has_organization_role(auth.uid(), organization_id, 'admin')
  );

-- Add indexes for faster lookups
create index idx_team_invitations_email on public.team_invitations(email) where accepted_at is null;
create index idx_team_invitations_org on public.team_invitations(organization_id);

-- Function to check and accept pending invitations on login/signup
create or replace function public.auto_accept_team_invitations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_record record;
begin
  -- Find all pending invitations for this user's email
  for invitation_record in
    select id, organization_id, role
    from public.team_invitations
    where email = new.email
      and accepted_at is null
      and expires_at > now()
  loop
    -- Add user to organization
    insert into public.organization_members (organization_id, user_id, role)
    values (invitation_record.organization_id, new.id, invitation_record.role)
    on conflict (organization_id, user_id) do nothing;
    
    -- Mark invitation as accepted
    update public.team_invitations
    set accepted_at = now()
    where id = invitation_record.id;
    
    raise notice 'Auto-accepted invitation % for user %', invitation_record.id, new.id;
  end loop;
  
  return new;
end;
$$;

-- Trigger: Run after user is created in auth.users
create trigger on_auth_user_created_accept_invitations
  after insert on auth.users
  for each row
  execute function public.auto_accept_team_invitations();