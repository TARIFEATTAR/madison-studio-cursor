import { useState } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { BrandStudio } from "./BrandStudio";
import { BrandKnowledgeCenter } from "@/components/onboarding/BrandKnowledgeCenter";
import { BrandKnowledgeManager } from "./BrandKnowledgeManager";
import { BrandKnowledgeDebugPanel } from "./BrandKnowledgeDebugPanel";
import { ChevronDown, FileText, Settings2 } from "lucide-react";

export function BrandGuidelinesTab() {
  const { currentOrganizationId } = useOnboarding();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-8">
      {/* Main Brand Studio */}
      <BrandStudio />

      {/* Advanced Tools Toggle */}
      {currentOrganizationId && (
        <div className="border-t border-stone/20 pt-8 mt-16">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal transition-colors mx-auto"
          >
            <Settings2 className="w-4 h-4" />
            Advanced Tools
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-8 space-y-8">
              {/* Document Upload */}
              <div className="p-6 bg-parchment/30 rounded-lg border border-stone/20">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-brass" />
                  <h3 className="font-medium text-ink">Document Upload</h3>
                </div>
                <p className="text-sm text-charcoal/60 mb-4">
                  Upload PDFs, TXT, or Markdown files with your brand guidelines
                </p>
                <BrandKnowledgeCenter organizationId={currentOrganizationId} />
              </div>

              {/* Knowledge Manager */}
              <BrandKnowledgeManager />

              {/* Debug Panel */}
              <BrandKnowledgeDebugPanel organizationId={currentOrganizationId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
