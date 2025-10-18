import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { VideoCategory, helpVideos, getVideosByCategory } from "@/config/helpVideos";

interface VideoCompletion {
  id: string;
  user_id: string;
  video_id: string;
  completed_at: string;
  created_at: string;
}

export function useVideoCompletion() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch completed videos for current user
  const { data: completions = [], isLoading } = useQuery({
    queryKey: ['video-completions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('video_completions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as VideoCompletion[];
    },
    enabled: !!user,
  });

  // Convert to Set for fast lookup
  const completedVideoIds = new Set(completions.map(c => c.video_id));

  // Calculate which categories are fully completed
  const completedCategories = new Set<VideoCategory>();
  const categories: VideoCategory[] = ['getting-started', 'settings', 'content-creation', 'multiply', 'library', 'calendar'];
  
  categories.forEach(category => {
    const categoryVideos = getVideosByCategory(category);
    const allCompleted = categoryVideos.length > 0 && categoryVideos.every(v => completedVideoIds.has(v.id));
    if (allCompleted) {
      completedCategories.add(category);
    }
  });

  // Mark video as complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (videoId: string) => {
      if (!user) throw new Error('Must be logged in to track progress');

      const { error } = await supabase
        .from('video_completions')
        .insert({
          user_id: user.id,
          video_id: videoId,
        });

      if (error) {
        // Ignore unique constraint violations (already completed)
        if (error.code !== '23505') {
          throw error;
        }
      }

      return videoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-completions'] });
      toast({
        title: "Video marked as complete! ✓",
        description: "Your progress has been saved.",
      });
    },
    onError: (error) => {
      console.error('Error marking video complete:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const markVideoComplete = (videoId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to track your progress.",
        variant: "destructive",
      });
      return;
    }
    return markCompleteMutation.mutateAsync(videoId);
  };

  const isVideoComplete = (videoId: string) => completedVideoIds.has(videoId);

  const isCategoryComplete = (category: VideoCategory) => completedCategories.has(category);

  const getCategoryProgress = (category: VideoCategory) => {
    const categoryVideos = getVideosByCategory(category);
    const completed = categoryVideos.filter(v => completedVideoIds.has(v.id)).length;
    return {
      completed,
      total: categoryVideos.length,
      percentage: categoryVideos.length > 0 ? Math.round((completed / categoryVideos.length) * 100) : 0,
    };
  };

  // Calculate overall progress
  const totalVideos = helpVideos.length;
  const completedVideos = completedVideoIds.size;
  const overallProgress = {
    completed: completedVideos,
    total: totalVideos,
    percentage: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
  };

  return {
    completedVideoIds,
    completedCategories,
    markVideoComplete,
    isVideoComplete,
    isCategoryComplete,
    getCategoryProgress,
    overallProgress,
    isLoading,
    isAuthenticated: !!user,
  };
}
