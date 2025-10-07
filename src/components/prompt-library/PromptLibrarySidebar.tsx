import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Filter, ChevronDown, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface PromptLibrarySidebarProps {
  filters: {
    collection: string | null;
    contentType: string | null;
    scentFamily: string | null;
    pillar: string | null;
    dipWeek: number | null;
    templatesOnly: boolean;
  };
  onFilterChange: (filters: any) => void;
  promptCount: number;
}

const PromptLibrarySidebar = ({
  filters,
  onFilterChange,
  promptCount,
}: PromptLibrarySidebarProps) => {
  const { currentOrganizationId } = useOnboarding();
  const [expandedSections, setExpandedSections] = useState({
    collection: true,
    contentType: true,
    scentFamily: false,
    pillar: false,
    dipWeek: false,
  });

  // Fetch available filter options from prompts
  const { data: filterOptions } = useQuery({
    queryKey: ["prompt-filter-options", currentOrganizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("collection, content_type, scent_family, pillar_focus, dip_week")
        .eq("organization_id", currentOrganizationId!)
        .eq("is_archived", false);

      if (error) throw error;

      const collections = [...new Set(data.map(d => d.collection).filter(Boolean))];
      const contentTypes = [...new Set(data.map(d => d.content_type).filter(Boolean))];
      const scentFamilies = [...new Set(data.map(d => d.scent_family).filter(Boolean))];
      const pillars = [...new Set(data.map(d => d.pillar_focus).filter(Boolean))];
      const dipWeeks = [...new Set(data.map(d => d.dip_week).filter(Boolean))].sort((a, b) => a - b);

      return {
        collections,
        contentTypes,
        scentFamilies,
        pillars,
        dipWeeks,
      };
    },
    enabled: !!currentOrganizationId,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearFilters = () => {
    onFilterChange({
      collection: null,
      contentType: null,
      scentFamily: null,
      pillar: null,
      dipWeek: null,
      templatesOnly: false,
    });
  };

  const hasActiveFilters =
    filters.collection ||
    filters.contentType ||
    filters.scentFamily ||
    filters.pillar ||
    filters.dipWeek ||
    filters.templatesOnly;

  return (
    <aside className="w-72 border-r border-border bg-card/30 backdrop-blur-sm">
      <ScrollArea className="h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {promptCount} prompt{promptCount !== 1 ? "s" : ""} found
            </p>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full mb-4"
            >
              Clear all filters
            </Button>
          )}

          {/* Templates Only */}
          <div className="mb-6 flex items-center gap-2">
            <Checkbox
              id="templates-only"
              checked={filters.templatesOnly}
              onCheckedChange={(checked) =>
                onFilterChange({ ...filters, templatesOnly: !!checked })
              }
            />
            <label
              htmlFor="templates-only"
              className="text-sm cursor-pointer flex items-center gap-1.5"
            >
              <Star className="h-4 w-4 text-primary" />
              Templates Only
            </label>
          </div>

          <Separator className="mb-4" />

          {/* Collection Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("collection")}
              className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-primary transition-colors"
            >
              Collection
              {expandedSections.collection ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.collection && (
              <div className="space-y-2 ml-4">
                {filterOptions?.collections.map((collection) => (
                  <div key={collection} className="flex items-center gap-2">
                    <Checkbox
                      id={`collection-${collection}`}
                      checked={filters.collection === collection}
                      onCheckedChange={(checked) =>
                        onFilterChange({
                          ...filters,
                          collection: checked ? collection : null,
                        })
                      }
                    />
                    <label
                      htmlFor={`collection-${collection}`}
                      className="text-sm cursor-pointer capitalize"
                    >
                      {collection.replace("_", " ")}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Content Type Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("contentType")}
              className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-primary transition-colors"
            >
              Content Type
              {expandedSections.contentType ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.contentType && (
              <div className="space-y-2 ml-4">
                {filterOptions?.contentTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.contentType === type}
                      onCheckedChange={(checked) =>
                        onFilterChange({
                          ...filters,
                          contentType: checked ? type : null,
                        })
                      }
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm cursor-pointer capitalize"
                    >
                      {type.replace("_", " ")}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Scent Family Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("scentFamily")}
              className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-primary transition-colors"
            >
              Scent Family
              {expandedSections.scentFamily ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.scentFamily && (
              <div className="space-y-2 ml-4">
                {filterOptions?.scentFamilies.map((family) => (
                  <div key={family} className="flex items-center gap-2">
                    <Checkbox
                      id={`scent-${family}`}
                      checked={filters.scentFamily === family}
                      onCheckedChange={(checked) =>
                        onFilterChange({
                          ...filters,
                          scentFamily: checked ? family : null,
                        })
                      }
                    />
                    <label
                      htmlFor={`scent-${family}`}
                      className="text-sm cursor-pointer capitalize"
                    >
                      {family}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Pillar Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("pillar")}
              className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-primary transition-colors"
            >
              Pillar
              {expandedSections.pillar ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.pillar && (
              <div className="space-y-2 ml-4">
                {filterOptions?.pillars.map((pillar) => (
                  <div key={pillar} className="flex items-center gap-2">
                    <Checkbox
                      id={`pillar-${pillar}`}
                      checked={filters.pillar === pillar}
                      onCheckedChange={(checked) =>
                        onFilterChange({
                          ...filters,
                          pillar: checked ? pillar : null,
                        })
                      }
                    />
                    <label
                      htmlFor={`pillar-${pillar}`}
                      className="text-sm cursor-pointer capitalize"
                    >
                      {pillar}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* DIP Week Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("dipWeek")}
              className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-primary transition-colors"
            >
              DIP Week
              {expandedSections.dipWeek ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.dipWeek && (
              <div className="space-y-2 ml-4">
                {filterOptions?.dipWeeks.map((week) => (
                  <div key={week} className="flex items-center gap-2">
                    <Checkbox
                      id={`week-${week}`}
                      checked={filters.dipWeek === week}
                      onCheckedChange={(checked) =>
                        onFilterChange({
                          ...filters,
                          dipWeek: checked ? week : null,
                        })
                      }
                    />
                    <label
                      htmlFor={`week-${week}`}
                      className="text-sm cursor-pointer"
                    >
                      Week {week}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default PromptLibrarySidebar;
