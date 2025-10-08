import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getIndustryTemplate } from "@/config/industryTemplates";

type OnboardingStep = "welcome_pending" | "document_pending" | "first_generation_pending" | "completed";

export function useOnboarding() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showForgeGuide, setShowForgeGuide] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("completed");

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

            // Create default "General" collection for new organizations
            console.log("Creating default collection for new organization");
            const { error: collectionError } = await supabase
              .from("brand_collections")
              .insert({
                organization_id: orgId,
                name: "General",
                description: "Default collection for getting started",
                sort_order: 1,
              });
            
            if (collectionError) {
              console.error("Failed to create default collection:", collectionError);
              // Don't throw - this shouldn't block onboarding
            }
          }
        }

        setCurrentOrganizationId(orgId);

        // Get onboarding step from localStorage
        const stepKey = `onboarding_step_${user.id}`;
        const savedStep = localStorage.getItem(stepKey) as OnboardingStep | null;
        const currentStep = savedStep || "welcome_pending";
        setOnboardingStep(currentStep);

        // Show appropriate UI based on step
        if (currentStep === "welcome_pending") {
          setShowWelcome(true);
        } else if (currentStep === "document_pending") {
          setShowDocumentUpload(true);
        } else if (currentStep === "first_generation_pending") {
          setShowForgeGuide(true);
        } else if (currentStep === "completed") {
          // Check if user has brand knowledge for banner
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
      // Get industry template configuration
      const industryTemplate = getIndustryTemplate(data.industry);
      
      // Update organization with brand info and industry configuration
      await supabase
        .from("organizations")
        .update({
          name: data.brandName,
          brand_config: {
            industry: data.industry,
            primaryColor: data.primaryColor,
            industry_config: {
              id: industryTemplate.id,
              name: industryTemplate.name,
              section_title: industryTemplate.section_title,
              fields: industryTemplate.fields,
            },
          },
        })
        .eq("id", currentOrganizationId);

      // Move to document upload step
      setOnboardingStep("document_pending");
      localStorage.setItem(`onboarding_step_${user.id}`, "document_pending");
      setShowWelcome(false);
      setShowDocumentUpload(true);
    } catch (error) {
      console.error("Error completing welcome:", error);
    }
  };

  const completeDocumentUpload = () => {
    if (!user) return;
    
    // Move to forge guide step
    setOnboardingStep("first_generation_pending");
    localStorage.setItem(`onboarding_step_${user.id}`, "first_generation_pending");
    setShowDocumentUpload(false);
    setShowForgeGuide(true);
  };

  const completeFirstGeneration = () => {
    if (!user) return;
    
    // Mark onboarding as complete
    setOnboardingStep("completed");
    localStorage.setItem(`onboarding_step_${user.id}`, "completed");
    setShowForgeGuide(false);
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
  };

  const dismissBanner = () => {
    if (!user) return;
    localStorage.setItem(`banner_dismissed_${user.id}`, "true");
    setShowBanner(false);
  };

  return {
    showWelcome,
    showDocumentUpload,
    showForgeGuide,
    showCompleteModal,
    showBanner,
    currentOrganizationId,
    isLoading,
    onboardingStep,
    completeWelcome,
    completeDocumentUpload,
    completeFirstGeneration,
    closeCompleteModal,
    dismissBanner,
  };
}
