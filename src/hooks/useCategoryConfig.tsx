import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CategoryKnowledge {
  vocabulary: string[];
  product_types: string[];
  copy_style_notes: string;
}

export function useCategoryConfig(organizationId: string | null, category?: string) {
  const [categoryKnowledge, setCategoryKnowledge] = useState<CategoryKnowledge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryKnowledge = async () => {
      if (!organizationId || !category) {
        setLoading(false);
        return;
      }

      try {
        const knowledgeType = `category_${category}`;
        
        const { data, error } = await supabase
          .from("brand_knowledge")
          .select("content")
          .eq("organization_id", organizationId)
          .eq("knowledge_type", knowledgeType)
          .eq("is_active", true)
          .maybeSingle();

        if (error) throw error;

        if (data?.content) {
          setCategoryKnowledge(data.content as unknown as CategoryKnowledge);
        }
      } catch (error) {
        console.error("Error loading category knowledge:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryKnowledge();
  }, [organizationId, category]);

  return { categoryKnowledge, loading };
}
