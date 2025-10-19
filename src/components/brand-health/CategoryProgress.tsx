import { CheckCircle2, AlertCircle, Circle } from "lucide-react";

interface CategoryProgressProps {
  gapAnalysis: {
    missing_components: string[];
    incomplete_areas: string[];
    strengths?: string[];
  };
}

const CATEGORIES = [
  { id: "identity", label: "Core Identity", keywords: ["mission", "vision", "values", "personality"] },
  { id: "voice", label: "Voice & Tone", keywords: ["voice", "tone", "spectrum", "guidelines"] },
  { id: "collections", label: "Collections", keywords: ["collection", "transparency"] },
  { id: "products", label: "Products", keywords: ["product", "scent", "formulation"] },
  { id: "content", label: "Content Types", keywords: ["template", "blog", "email", "social"] },
  { id: "audience", label: "Audience", keywords: ["audience", "persona", "demographic"] },
];

export function CategoryProgress({ gapAnalysis }: CategoryProgressProps) {
  const getCategoryStatus = (category: typeof CATEGORIES[0]) => {
    const allIssues = [...gapAnalysis.missing_components, ...gapAnalysis.incomplete_areas];
    const hasIssue = allIssues.some(issue => 
      category.keywords.some(keyword => issue.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (!hasIssue) return "complete";
    
    const isMissing = gapAnalysis.missing_components.some(issue =>
      category.keywords.some(keyword => issue.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    return isMissing ? "missing" : "incomplete";
  };

  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => {
        const status = getCategoryStatus(category);
        
        return (
          <div key={category.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status === "complete" && (
                <CheckCircle2 className="w-4 h-4 text-forest-ink flex-shrink-0" />
              )}
              {status === "incomplete" && (
                <AlertCircle className="w-4 h-4 text-aged-brass flex-shrink-0" />
              )}
              {status === "missing" && (
                <Circle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span className="text-sm text-charcoal/80">{category.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {status === "complete" && (
                <span className="text-xs text-forest-ink font-medium">Complete</span>
              )}
              {status === "incomplete" && (
                <span className="text-xs text-aged-brass font-medium">Incomplete</span>
              )}
              {status === "missing" && (
                <span className="text-xs text-red-600 font-medium">Missing</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
