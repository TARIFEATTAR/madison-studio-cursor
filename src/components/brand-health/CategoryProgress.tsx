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

  // Create prioritized list: filter incomplete/missing, sort by severity then importance
  const categoriesNeedingAttention = CATEGORIES
    .map(category => ({
      ...category,
      status: getCategoryStatus(category),
    }))
    .filter(c => c.status !== "complete") // Only show items needing work
    .sort((a, b) => {
      // First sort by status severity (missing before incomplete)
      const statusOrder = { missing: 0, incomplete: 1, complete: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then by category importance (already in correct order in CATEGORIES array)
      return 0;
    });

  return (
    <div className="space-y-4">
      {categoriesNeedingAttention.map((category, index) => {
        const priorityNumber = index + 1;
        
        return (
          <div key={category.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Priority Number Badge */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-aged-brass/10 border border-aged-brass/30 flex items-center justify-center">
                <span className="text-xs font-semibold text-aged-brass">
                  {priorityNumber}
                </span>
              </div>
              
              {/* Status Icon */}
              {category.status === "missing" && (
                <Circle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              {category.status === "incomplete" && (
                <AlertCircle className="w-4 h-4 text-aged-brass flex-shrink-0" />
              )}
              
              <span className="text-sm text-charcoal/80">{category.label}</span>
            </div>
            
            {/* Status text on right */}
            <span className={`text-xs font-medium ${
              category.status === "missing" ? "text-red-600" : "text-aged-brass"
            }`}>
              {category.status === "missing" ? "Missing" : "Incomplete"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
