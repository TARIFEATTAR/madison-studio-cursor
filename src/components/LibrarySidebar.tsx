import { useState } from "react";

import { ChevronRight, Star, Clock } from "lucide-react";
import { contentTypeMapping } from "@/utils/contentTypeMapping";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LibrarySidebarProps {
  onFilterChange: (filters: {
    collection?: string | null;
    contentType?: string | null;
    dipWeek?: number | null;
    quickAccess?: "favorites" | "recent" | null;
    scentFamily?: string | null;
  }) => void;
  activeFilters: {
    collection?: string | null;
    contentType?: string | null;
    dipWeek?: number | null;
    quickAccess?: "favorites" | "recent" | null;
    scentFamily?: string | null;
  };
  counts: {
    prompts: {
      total: number;
      byCollection: Record<string, number>;
      byContentType: Record<string, number>;
      byDipWeek: Record<number, number>;
    };
    outputs: {
      total: number;
      byCollection: Record<string, number>;
      byContentType: Record<string, number>;
      byDipWeek: Record<number, number>;
    };
    masterContent: {
      total: number;
      byCollection: Record<string, number>;
      byContentType: Record<string, number>;
      byDipWeek: Record<number, number>;
    };
    derivatives: {
      total: number;
      byCollection: Record<string, number>;
      byContentType: Record<string, number>;
      byDipWeek: Record<number, number>;
    };
    favorites: number;
    recent: number;
  };
}

export function LibrarySidebar({ onFilterChange, activeFilters, counts }: LibrarySidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contentTypes: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterClick = (filterType: string, value: string | number) => {
    const currentValue = activeFilters[filterType as keyof typeof activeFilters];
    
    if (currentValue === value) {
      // Deselect if clicking the same filter
      const newFilters = { ...activeFilters };
      delete newFilters[filterType as keyof typeof activeFilters];
      onFilterChange(newFilters);
    } else {
      // Select new filter
      const newFilters = {
        ...activeFilters,
        [filterType]: value,
      };
      onFilterChange(newFilters);
    }
  };

  const getContentTypeCount = (keys: string[]) => {
    let total = 0;
    keys.forEach(key => {
      total += (counts.prompts?.byContentType?.[key] || 0) +
               (counts.outputs?.byContentType?.[key] || 0) +
               (counts.masterContent?.byContentType?.[key] || 0) +
               (counts.derivatives?.byContentType?.[key] || 0);
    });
    return total;
  };

  return (
    <Sidebar
      className={cn(
        "border-r border-border/40 bg-soft-ivory transition-all duration-200 top-20 h-[calc(100vh-5rem)]",
        collapsed ? "w-14" : "w-60"
      )}
      collapsible="icon"
    >
      <SidebarContent className="p-4">
        {/* BY CONTENT TYPE */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="flex items-center justify-between cursor-pointer hover:bg-stone-beige/50 rounded-md px-2 py-1.5 transition-colors mb-1.5"
            onClick={() => toggleSection("contentTypes")}
          >
            <span className="text-xs font-medium text-deep-charcoal uppercase tracking-wide">
              {!collapsed && "By Content Type"}
            </span>
            {!collapsed && (
              <ChevronRight
                className={cn(
                  "w-3 h-3 transition-transform text-deep-charcoal",
                  expandedSections.contentTypes && "rotate-90"
                )}
              />
            )}
          </SidebarGroupLabel>

          {expandedSections.contentTypes && (
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1.5">
                {contentTypeMapping.map((type) => {
                  const typeCount = getContentTypeCount(type.keys);
                  const isTypeActive = type.keys.some(key => activeFilters.contentType === key);

                  return (
                    <SidebarMenuItem key={type.name}>
                      <SidebarMenuButton
                        className={cn(
                          "min-h-10 px-2 py-1.5 rounded-md transition-all flex items-center gap-3 hover:bg-stone-beige/50",
                          isTypeActive && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium"
                        )}
                        onClick={() => handleFilterClick("contentType", type.keys[0])}
                      >
                        <type.icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-sm leading-tight">{type.name}</span>
                            {typeCount > 0 && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                {typeCount}
                              </Badge>
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* QUICK ACCESS - Always Visible */}
        <SidebarGroup className="mt-6 border-t border-border/40 pt-4">
          <SidebarGroupLabel className="px-2 py-1.5 mb-1.5">
            <span className="text-xs font-medium text-deep-charcoal uppercase tracking-wide">
              {!collapsed && "Quick Access"}
            </span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    "min-h-10 px-2 py-1.5 rounded-md transition-all flex items-center gap-3 hover:bg-stone-beige/50",
                    activeFilters.quickAccess === "favorites" && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium"
                  )}
                  onClick={() => handleFilterClick("quickAccess", "favorites")}
                >
                  <Star className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm leading-tight">Favorites</span>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {counts.favorites}
                      </Badge>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    "min-h-10 px-2 py-1.5 rounded-md transition-all flex items-center gap-3 hover:bg-stone-beige/50",
                    activeFilters.quickAccess === "recent" && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium"
                  )}
                  onClick={() => handleFilterClick("quickAccess", "recent")}
                >
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm leading-tight">Recent</span>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {counts.recent}
                      </Badge>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
