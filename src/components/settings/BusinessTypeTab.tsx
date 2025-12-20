import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessTypeSelector } from "./BusinessTypeSelector";
import { useBusinessType } from "@/hooks/useBusinessType";
import { Sparkles, Info } from "lucide-react";

export function BusinessTypeTab() {
  const { currentBusinessType, config, isLoading } = useBusinessType();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Business Type
          </CardTitle>
          <CardDescription>
            Your business type determines which features, vocabulary, and AI guidance 
            Madison Studio provides. Choose the option that best describes your business.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Business Type Selector */}
      <BusinessTypeSelector showDescription={true} />

      {/* Current Configuration Summary */}
      {config && !isLoading && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-4 h-4" />
              Your Configuration
            </CardTitle>
            <CardDescription>
              Based on your business type, Madison Studio has been customized for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enabled Sections */}
            <div>
              <h4 className="text-sm font-medium mb-2">Enabled Features</h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(config.enabled_sections || {})
                  .filter(([_, enabled]) => enabled)
                  .map(([section]) => (
                    <Badge key={section} variant="secondary" className="capitalize">
                      {section.replace(/_/g, ' ')}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Vocabulary */}
            <div>
              <h4 className="text-sm font-medium mb-2">Your Vocabulary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(config.vocabulary || {}).slice(0, 8).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Context */}
            {config.ai_context && (
              <div>
                <h4 className="text-sm font-medium mb-2">AI Focus</h4>
                <p className="text-sm text-muted-foreground">
                  {config.ai_context.content_focus}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Tone:</span> {config.ai_context.tone_hints}
                </p>
              </div>
            )}

            {/* Industry Terms */}
            {config.ai_context?.industry_terms && config.ai_context.industry_terms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Industry Terms Madison Knows</h4>
                <div className="flex flex-wrap gap-1">
                  {config.ai_context.industry_terms.slice(0, 12).map((term) => (
                    <Badge key={term} variant="outline" className="text-xs">
                      {term}
                    </Badge>
                  ))}
                  {config.ai_context.industry_terms.length > 12 && (
                    <Badge variant="outline" className="text-xs">
                      +{config.ai_context.industry_terms.length - 12} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
