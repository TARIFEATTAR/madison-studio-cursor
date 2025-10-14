import { ALL_DELIVERABLES, DeliverableFormat } from "./deliverableFormats";
import { LucideIcon } from "lucide-react";

export interface LibraryContentType {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
}

/**
 * Generate library content types dynamically from deliverable formats
 * This ensures the Library page filters match what users can create on /create
 */
export const libraryContentTypes: LibraryContentType[] = ALL_DELIVERABLES.map(
  (deliverable: DeliverableFormat) => ({
    id: deliverable.value,
    name: deliverable.label,
    icon: deliverable.icon,
    category: deliverable.description,
  })
);

/**
 * Get content type by ID for lookup purposes
 */
export function getLibraryContentType(id: string): LibraryContentType | undefined {
  return libraryContentTypes.find((type) => type.id === id);
}
