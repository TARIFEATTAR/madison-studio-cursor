import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useOnboarding() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        // Check if user has completed onboarding
        const hasCompletedKey = `onboarding_completed_${user.id}`;
        const hasCompleted = localStorage.getItem(hasCompletedKey);

        // Get or create user's organization
        const { data: existingOrgs } = await supabase
          .from("organization_members")
          .select("organization_id, organizations(id, name, brand_config)")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        let orgId: string;

        if (existingOrgs?.organization_id) {
          orgId = existingOrgs.organization_id;
        } else {
          // Check if user already created an organization but wasn't added as member
          const { data: userOrgs } = await supabase
            .from("organizations")
            .select("id")
            .eq("created_by", user.id)
            .limit(1)
            .maybeSingle();

          if (userOrgs) {
            // User already has an organization, use it
            orgId = userOrgs.id;
            console.log("Found existing organization:", orgId);
            
            // Try to add them as a member if not already
            const { data: existingMember } = await supabase
              .from("organization_members")
              .select("id")
              .eq("organization_id", orgId)
              .eq("user_id", user.id)
              .maybeSingle();
              
            if (!existingMember) {
              console.log("Adding user as member of existing organization");
              const { error: memberError } = await supabase
                .from("organization_members")
                .insert({
                  organization_id: orgId,
                  user_id: user.id,
                  role: "owner",
                });
              
              if (memberError) {
                console.error("Failed to add user as organization member:", memberError);
                throw memberError;
              }
            }
          } else {
            // Create personal organization
            console.log("Creating new organization for user");
            const { data: newOrg, error: orgError } = await supabase
              .from("organizations")
              .insert({
                name: `${user.email?.split("@")[0]}'s Workspace`,
                created_by: user.id,
              })
              .select()
              .single();

            if (orgError) {
              console.error("Failed to create organization:", orgError);
              throw orgError;
            }
            
            orgId = newOrg.id;

            // Add user as owner
            console.log("Adding user as owner of new organization");
            const { error: memberError } = await supabase
              .from("organization_members")
              .insert({
                organization_id: orgId,
                user_id: user.id,
                role: "owner",
              });
            
            if (memberError) {
              console.error("Failed to add user as organization owner:", memberError);
              throw memberError;
            }
          }
        }

        setCurrentOrganizationId(orgId);

        // Show welcome modal if not completed
        if (!hasCompleted) {
          setShowWelcome(true);
        } else {
          // Check if user has brand knowledge
          const { data: brandKnowledge } = await supabase
            .from("brand_knowledge")
            .select("id")
            .eq("organization_id", orgId)
            .limit(1);

          if (!brandKnowledge || brandKnowledge.length === 0) {
            setShowBanner(true);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeWelcome = async (data: {
    brandName: string;
    industry: string;
    primaryColor: string;
  }) => {
    if (!user || !currentOrganizationId) return;

    try {
      // Update organization with brand info
      await supabase
        .from("organizations")
        .update({
          name: data.brandName,
          brand_config: {
            industry: data.industry,
            primaryColor: data.primaryColor,
          },
        })
        .eq("id", currentOrganizationId);

      // Mark onboarding as complete
      localStorage.setItem(`onboarding_completed_${user.id}`, "true");
      setShowWelcome(false);
      setShowBanner(true);
    } catch (error) {
      console.error("Error completing welcome:", error);
    }
  };

  const skipWelcome = () => {
    if (!user) return;
    localStorage.setItem(`onboarding_completed_${user.id}`, "true");
    setShowWelcome(false);
    setShowBanner(true);
  };

  const dismissBanner = () => {
    if (!user) return;
    localStorage.setItem(`banner_dismissed_${user.id}`, "true");
    setShowBanner(false);
  };

  return {
    showWelcome,
    showBanner,
    currentOrganizationId,
    isLoading,
    completeWelcome,
    skipWelcome,
    dismissBanner,
  };
}
