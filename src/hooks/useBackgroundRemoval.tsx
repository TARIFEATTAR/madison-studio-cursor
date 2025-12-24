/**
 * useBackgroundRemoval Hook
 * 
 * Provides background removal functionality using the remove-background edge function.
 * Handles loading states, errors, and saving to library.
 */

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface RemoveBackgroundOptions {
  imageUrl: string;
  saveToLibrary?: boolean;
  onSuccess?: (result: BackgroundRemovalResult) => void;
  onError?: (error: Error) => void;
}

interface BackgroundRemovalResult {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  savedImageId?: string;
  provider?: string;
  error?: string;
}

interface UseBackgroundRemovalReturn {
  removeBackground: (options: RemoveBackgroundOptions) => Promise<BackgroundRemovalResult | null>;
  isRemoving: boolean;
  error: string | null;
  result: BackgroundRemovalResult | null;
  reset: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useBackgroundRemoval(): UseBackgroundRemovalReturn {
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  const [result, setResult] = useState<BackgroundRemovalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (options: RemoveBackgroundOptions): Promise<BackgroundRemovalResult> => {
      const response = await supabase.functions.invoke("remove-background", {
        body: {
          imageUrl: options.imageUrl,
          userId: user?.id,
          organizationId: orgId,
          saveToLibrary: options.saveToLibrary ?? false,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Background removal failed");
      }

      return response.data as BackgroundRemovalResult;
    },
    onSuccess: (data, variables) => {
      setResult(data);
      setError(null);

      if (data.success) {
        // Invalidate generated images query if saved
        if (variables.saveToLibrary && data.savedImageId) {
          queryClient.invalidateQueries({ queryKey: ["generated-images"] });
        }

        variables.onSuccess?.(data);
      } else {
        const errorMsg = data.error || "Background removal failed";
        setError(errorMsg);
        variables.onError?.(new Error(errorMsg));
      }
    },
    onError: (err: Error, variables) => {
      const errorMsg = err.message || "Background removal failed";
      setError(errorMsg);
      setResult(null);
      variables.onError?.(err);
    },
  });

  const removeBackground = useCallback(
    async (options: RemoveBackgroundOptions): Promise<BackgroundRemovalResult | null> => {
      setError(null);
      setResult(null);

      try {
        return await mutation.mutateAsync(options);
      } catch {
        return null;
      }
    },
    [mutation]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    removeBackground,
    isRemoving: mutation.isPending,
    error,
    result,
    reset,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE HELPER FOR ONE-OFF USE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simple function to remove background from an image URL.
 * Use this for one-off operations where you don't need the full hook.
 */
export async function removeBackgroundFromUrl(
  imageUrl: string,
  options?: {
    userId?: string;
    organizationId?: string;
    saveToLibrary?: boolean;
  }
): Promise<BackgroundRemovalResult> {
  const response = await supabase.functions.invoke("remove-background", {
    body: {
      imageUrl,
      userId: options?.userId,
      organizationId: options?.organizationId,
      saveToLibrary: options?.saveToLibrary ?? false,
    },
  });

  if (response.error) {
    return {
      success: false,
      error: response.error.message || "Background removal failed",
    };
  }

  return response.data as BackgroundRemovalResult;
}

export default useBackgroundRemoval;

























