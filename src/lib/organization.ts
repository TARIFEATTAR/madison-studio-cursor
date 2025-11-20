import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the organization ID the current user should operate against.
 * Prefers an existing membership entry, falls back to organizations created
 * by the user, and creates a fresh organization + membership if none exist.
 */
export async function getOrCreateOrganizationId(userId: string) {
  // 1) Check existing membership
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  if (member?.organization_id) {
    return member.organization_id;
  }

  // 2) Fallback to organizations the user created
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("created_by", userId)
    .maybeSingle();

  if (orgError) {
    throw orgError;
  }

  if (org?.id) {
    await ensureMembership(userId, org.id);
    return org.id;
  }

  // 3) Create a new organization + membership
  const { data: newOrg, error: createError } = await supabase
    .from("organizations")
    .insert({
      name: `${userId.slice(0, 6)}'s Workspace`,
      created_by: userId,
    })
    .select()
    .single();

  if (createError || !newOrg?.id) {
    throw createError ?? new Error("Failed to create organization");
  }

  await ensureMembership(userId, newOrg.id);

  return newOrg.id;
}

async function ensureMembership(userId: string, organizationId: string) {
  await supabase
    .from("organization_members")
    .upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        role: "owner",
      },
      {
        onConflict: "organization_id,user_id",
        ignoreDuplicates: true,
      }
    );
}











