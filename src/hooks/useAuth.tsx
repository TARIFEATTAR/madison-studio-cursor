import { useAuthContext } from "@/contexts/AuthContext";

/**
 * @deprecated Use useAuthContext directly from @/contexts/AuthContext
 * This hook is kept for backward compatibility but will be removed in future versions.
 */
export function useAuth() {
  return useAuthContext();
}
