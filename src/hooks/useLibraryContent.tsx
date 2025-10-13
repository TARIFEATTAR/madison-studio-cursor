import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LibraryContentItem {
  id: string;
  title: string;
  contentType: string;
  collection: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number | null;
  wordCount: number | null;
  archived: boolean;
  status: string;
  sourceTable: "master_content" | "outputs" | "derivative_assets";
}

export const useLibraryContent = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["library-content", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const items: LibraryContentItem[] = [];

      // Fetch master content
      const { data: masterContent, error: masterError } = await supabase
        .from("master_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (masterError) {
        console.error("Error fetching master content:", masterError);
      } else if (masterContent) {
        items.push(
          ...masterContent.map((item) => ({
            id: item.id,
            title: item.title,
            contentType: item.content_type,
            collection: item.collection,
            content: item.full_content,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            rating: item.quality_rating,
            wordCount: item.word_count || item.full_content?.split(/\s+/).filter(Boolean).length || 0,
            archived: item.is_archived,
            status: item.status || "draft",
            sourceTable: "master_content" as const,
          }))
        );
      }

      // Fetch outputs
      const { data: outputs, error: outputsError } = await supabase
        .from("outputs")
        .select("*, prompts(title, content_type, collection)")
        .order("created_at", { ascending: false });

      if (outputsError) {
        console.error("Error fetching outputs:", outputsError);
      } else if (outputs) {
        items.push(
          ...outputs.map((item) => ({
            id: item.id,
            title: item.prompts?.title || "Untitled Output",
            contentType: item.prompts?.content_type || "output",
            collection: item.prompts?.collection || null,
            content: item.generated_content,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.created_at),
            rating: item.quality_rating,
            wordCount: item.generated_content?.split(/\s+/).filter(Boolean).length || 0,
            archived: item.is_archived,
            status: "generated",
            sourceTable: "outputs" as const,
          }))
        );
      }

      // Fetch derivative assets
      const { data: derivatives, error: derivativesError } = await supabase
        .from("derivative_assets")
        .select("*, master_content(title, collection)")
        .order("created_at", { ascending: false });

      if (derivativesError) {
        console.error("Error fetching derivatives:", derivativesError);
      } else if (derivatives) {
        items.push(
          ...derivatives.map((item) => ({
            id: item.id,
            title: (typeof item.platform_specs === 'object' && item.platform_specs !== null && 'title' in item.platform_specs ? item.platform_specs.title as string : null) || item.master_content?.title || "Untitled Derivative",
            contentType: item.asset_type,
            collection: item.master_content?.collection || null,
            content: item.generated_content || "",
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.created_at),
            rating: item.quality_rating,
            wordCount: item.generated_content?.split(/\s+/).filter(Boolean).length || 0,
            archived: item.is_archived,
            status: item.approval_status || "pending",
            sourceTable: "derivative_assets" as const,
          }))
        );
      }

      // Sort all items by date (most recent first)
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return items;
    },
    enabled: !!user,
  });
};
