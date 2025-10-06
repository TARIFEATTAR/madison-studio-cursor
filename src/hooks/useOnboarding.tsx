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
    if (!user) return;

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
          .single();

        let orgId: string;

        if (existingOrgs?.organization_id) {
          orgId = existingOrgs.organization_id;
        } else {
          // Create personal organization
          const { data: newOrg, error: orgError } = await supabase
            .from("organizations")
            .insert({
              name: `${user.email?.split("@")[0]}'s Workspace`,
              created_by: user.id,
            })
            .select()
            .single();

          if (orgError) throw orgError;
          orgId = newOrg.id;

          // Add user as owner
          await supabase.from("organization_members").insert({
            organization_id: orgId,
            user_id: user.id,
            role: "owner",
          });
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
