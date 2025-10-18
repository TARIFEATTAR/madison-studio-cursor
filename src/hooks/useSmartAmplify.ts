import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AmplifyRecommendation } from "@/components/multiply/SmartAmplifyPanel";

interface MasterContent {
  id: string;
  title: string;
  content_type: string;
  full_content: string;
}

// Rule-based fallback recommendations
const getRuleBasedRecommendations = (
  masterContent: MasterContent
): AmplifyRecommendation[] => {
  const contentLength = masterContent.full_content.length;
  const contentType = masterContent.content_type;
  const recommendations: AmplifyRecommendation[] = [];

  // Always recommend social media for most content
  recommendations.push({
    derivativeType: "instagram",
    confidence: "high",
    reason: "Visual platform perfect for highlighting key insights",
    priority: 1,
  });

  // Long-form content works well for LinkedIn
  if (contentLength > 1000) {
    recommendations.push({
      derivativeType: "linkedin",
      confidence: "high",
      reason: "Long-form content translates well to professional audience",
      priority: 2,
    });
  }

  // Email series for comprehensive content
  if (contentLength > 1500) {
    recommendations.push({
      derivativeType: "email_3part",
      confidence: "medium",
      reason: "Rich content perfect for email nurture sequence",
      priority: 3,
    });
  }

  // Product descriptions for product-related content
  if (contentType?.includes("product") || masterContent.title.toLowerCase().includes("product")) {
    recommendations.push({
      derivativeType: "product",
      confidence: "high",
      reason: "Product-focused content ideal for descriptions",
      priority: 1,
    });
  }

  // Facebook for community engagement
  recommendations.push({
    derivativeType: "facebook",
    confidence: "medium",
    reason: "Conversational content drives community engagement",
    priority: 4,
  });

  // YouTube for educational/story content
  if (contentLength > 800) {
    recommendations.push({
      derivativeType: "youtube",
      confidence: "medium",
      reason: "Substantial content works well as video description",
      priority: 5,
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 6);
};

export function useSmartAmplify(masterContent: MasterContent | null) {
  const [recommendations, setRecommendations] = useState<AmplifyRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!masterContent) {
      setRecommendations([]);
      return;
    }

    const analyzeContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get auth session for JWT
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Authentication required");
        }

        // Call AI edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-amplify-fit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              masterContent: {
                title: masterContent.title,
                contentType: masterContent.content_type,
                // Send first 3000 chars for analysis
                content: masterContent.full_content.substring(0, 3000),
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to analyze content");
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error("Smart Amplify error:", err);
        // Fall back to rule-based recommendations
        const fallbackRecs = getRuleBasedRecommendations(masterContent);
        setRecommendations(fallbackRecs);
        setError("Using fallback recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the analysis
    const timer = setTimeout(analyzeContent, 500);
    return () => clearTimeout(timer);
  }, [masterContent?.id]);

  return { recommendations, isLoading, error };
}
