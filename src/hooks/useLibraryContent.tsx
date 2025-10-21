import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getDeliverableByValue } from "@/config/deliverableFormats";

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
  sourceTable: "master_content" | "outputs" | "derivative_assets" | "generated_images";
  publishedTo?: string[];
  externalUrls?: Record<string, string>;
  publishNotes?: string;
  publishedAt?: string;
  brandConsistencyScore?: number;
  brandAnalysis?: any;
  lastBrandCheckAt?: string;
  imageUrl?: string;
  goalType?: string;
  aspectRatio?: string;
  finalPrompt?: string;
}

export const useLibraryContent = (groupBySessions = false) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["library-content", user?.id, groupBySessions],
    queryFn: async () => {
      if (!user) return [];

      const items: LibraryContentItem[] = [];

      // Fetch master content
      const { data: masterContent, error: masterError } = await supabase
        .from("master_content")
        .select("*, brand_consistency_score, brand_analysis, last_brand_check_at")
        .order("created_at", { ascending: false });

      if (masterError) {
        console.error("Error fetching master content:", masterError);
      } else if (masterContent) {
        items.push(
          ...masterContent.map((item) => {
            const deliverable = getDeliverableByValue(item.content_type);
            return {
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
              publishedTo: item.published_to as string[] | undefined,
              externalUrls: item.external_urls as Record<string, string> | undefined,
              publishNotes: item.publish_notes || undefined,
              brandConsistencyScore: item.brand_consistency_score || undefined,
              brandAnalysis: item.brand_analysis || undefined,
              lastBrandCheckAt: item.last_brand_check_at || undefined,
            };
          })
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
          ...outputs.map((item) => {
            const contentType = item.prompts?.content_type || "output";
            const deliverable = getDeliverableByValue(contentType);
            return {
              id: item.id,
              title: item.prompts?.title || "Untitled Output",
              contentType: contentType,
              collection: item.prompts?.collection || null,
              content: item.generated_content,
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.created_at),
              rating: item.quality_rating,
              wordCount: item.generated_content?.split(/\s+/).filter(Boolean).length || 0,
              archived: item.is_archived,
              status: "generated",
              sourceTable: "outputs" as const,
            };
          })
        );
      }

      // Fetch derivative assets
      const { data: derivatives, error: derivativesError } = await supabase
        .from("derivative_assets")
        .select("*, master_content(title, collection), brand_consistency_score, brand_analysis, last_brand_check_at")
        .order("created_at", { ascending: false });

      if (derivativesError) {
        console.error("Error fetching derivatives:", derivativesError);
      } else if (derivatives) {
        items.push(
          ...derivatives.map((item) => {
            const deliverable = getDeliverableByValue(item.asset_type);
            return {
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
              publishedTo: item.published_to as string[] | undefined,
              externalUrls: item.external_urls as Record<string, string> | undefined,
              publishNotes: item.publish_notes || undefined,
              publishedAt: item.published_at || undefined,
              brandConsistencyScore: item.brand_consistency_score || undefined,
              brandAnalysis: item.brand_analysis || undefined,
              lastBrandCheckAt: item.last_brand_check_at || undefined,
            };
          })
        );
      }

      // Fetch generated images (from Madison Image Studio)
      const { data: generatedImages, error: imagesError } = await supabase
        .from("generated_images")
        .select("*")
        .eq("saved_to_library", true)
        .order("created_at", { ascending: false });

      if (imagesError) {
        console.error("Error fetching generated images:", imagesError);
      } else if (generatedImages) {
        items.push(
          ...generatedImages.map((item) => {
            // Parse library_category to determine where to show
            const categories = item.library_category?.split(',') || ['content'];
            const isContentLibrary = categories.includes('content');
            const isMarketplace = categories.includes('marketplace');
            
            return {
              id: item.id,
              title: item.session_name || "Generated Image",
              contentType: "visual-asset", // Use existing visual asset type
              collection: null,
              content: item.image_url, // Store image URL as content
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.created_at),
              rating: null,
              wordCount: 0,
              archived: item.is_archived || false,
              status: "published",
              sourceTable: "generated_images" as any,
              imageUrl: item.image_url, // Add explicit imageUrl field
              goalType: item.goal_type,
              aspectRatio: item.aspect_ratio,
              finalPrompt: item.final_prompt,
            };
          })
        );
      }

      // If grouping by sessions, aggregate generated_images
      if (groupBySessions && generatedImages) {
        const sessionMap = new Map<string, {
          sessionId: string;
          sessionName: string;
          heroImage: string;
          images: typeof generatedImages;
          createdAt: Date;
          archived: boolean;
        }>();

        generatedImages.forEach(img => {
          const sessionId = img.session_id || img.id;
          
          if (!sessionMap.has(sessionId)) {
            sessionMap.set(sessionId, {
              sessionId,
              sessionName: img.session_name || 'Generated Image',
              heroImage: '',
              images: [],
              createdAt: new Date(img.created_at),
              archived: img.is_archived || false
            });
          }
          
          const session = sessionMap.get(sessionId)!;
          session.images.push(img);
          
          // Update hero image - prioritize hero flag, then first image (order 0), then fallback to first in array
          if (img.is_hero_image) {
            session.heroImage = img.image_url;
          } else if (img.image_order === 0 && !session.heroImage) {
            session.heroImage = img.image_url;
          } else if (!session.heroImage) {
            // Fallback: use first image if no hero defined yet
            session.heroImage = img.image_url;
          }
          
          // Keep earliest creation date
          const imgDate = new Date(img.created_at);
          if (imgDate < session.createdAt) {
            session.createdAt = imgDate;
          }
        });

        // Convert sessions to library items
        sessionMap.forEach(session => {
          items.push({
            id: session.sessionId,
            title: session.sessionName,
            contentType: "image-session",
            collection: null,
            content: session.heroImage,
            createdAt: session.createdAt,
            updatedAt: session.createdAt,
            rating: null,
            wordCount: session.images.length,
            archived: session.archived,
            status: "published",
            sourceTable: "generated_images" as any,
            imageUrl: session.heroImage,
          });
        });
      }

      // Sort all items by date (most recent first)
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return items;
    },
    enabled: !!user,
  });
};
