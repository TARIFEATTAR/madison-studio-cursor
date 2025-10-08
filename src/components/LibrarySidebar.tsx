import { useState, useMemo } from "react";

import { ChevronRight, Star, Clock, ChevronDown, Folder } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { useWeekNames } from "@/hooks/useWeekNames";
import { useProducts } from "@/hooks/useProducts";
import { getCollectionIcon, normalizeCollectionName } from "@/utils/collectionIcons";
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
  const { collections: brandCollections } = useCollections();
  const { getWeekName } = useWeekNames();
  const { products } = useProducts();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    collections: false,
    contentTypes: true,
    dipWeeks: false,
  });
  const [expandedCollections, setExpandedCollections] = useState<string[]>(['cadence']);
  

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCollection = (collection: string) => {
    setExpandedCollections(prev => 
      prev.includes(collection) 
        ? prev.filter(c => c !== collection)
        : [...prev, collection]
    );
  };

  const handleFilterClick = (filterType: string, value: string | number, scentFamily?: string) => {
    const currentValue = activeFilters[filterType as keyof typeof activeFilters];
    
    if (filterType === "collection" && scentFamily) {
      // Clicking a scent family
      if (currentValue === value && activeFilters.scentFamily === scentFamily) {
        // Deselect scent family
        const newFilters = { ...activeFilters };
        delete newFilters.collection;
        delete newFilters.scentFamily;
        onFilterChange(newFilters);
      } else {
        // Select scent family
        onFilterChange({
          ...activeFilters,
          collection: value as string,
          scentFamily,
        });
      }
    } else if (currentValue === value) {
      // Deselect if clicking the same filter
      const newFilters = { ...activeFilters };
      delete newFilters[filterType as keyof typeof activeFilters];
      if (filterType === "collection") {
        delete newFilters.scentFamily;
      }
      onFilterChange(newFilters);
    } else {
      // Select new filter
      const newFilters = {
        ...activeFilters,
        [filterType]: value,
      };
      if (filterType === "collection") {
        delete newFilters.scentFamily;
      }
      onFilterChange(newFilters);
    }
  };

  // Group products by collection and scent family
  const collectionHierarchy = useMemo(() => {
    const hierarchy: Record<string, { count: number; scentFamilies: Record<string, number> }> = {};
    
    products.forEach(product => {
      const collection = normalizeCollectionName(product.collection);
      if (!hierarchy[collection]) {
        hierarchy[collection] = { count: 0, scentFamilies: {} };
      }
      hierarchy[collection].count++;
      
      if (product.scentFamily) {
        const scentFamily = product.scentFamily;
        hierarchy[collection].scentFamilies[scentFamily] = 
          (hierarchy[collection].scentFamilies[scentFamily] || 0) + 1;
      }
    });
    
    return hierarchy;
  }, [products]);

  const collections = brandCollections.map(col => ({
    name: col.name,
    key: col.name.toLowerCase().replace(/\s+/g, '_'),
    icon: Folder,
  }));

  const dipWeeks = [
    { number: 1, name: getWeekName(1) },
    { number: 2, name: getWeekName(2) },
    { number: 3, name: getWeekName(3) },
    { number: 4, name: getWeekName(4) },
  ];

  const isActive = (filterType: string, value: string | number, scentFamily?: string) => {
    if (scentFamily) {
      return activeFilters[filterType as keyof typeof activeFilters] === value && activeFilters.scentFamily === scentFamily;
    }
    return activeFilters[filterType as keyof typeof activeFilters] === value;
  };

  const getCollectionCount = (collectionKey: string) => {
    return (counts.prompts?.byCollection?.[collectionKey] || 0) +
           (counts.outputs?.byCollection?.[collectionKey] || 0) +
           (counts.masterContent?.byCollection?.[collectionKey] || 0) +
           (counts.derivatives?.byCollection?.[collectionKey] || 0);
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
            className="flex items-center justify-between cursor-pointer hover:bg-stone-beige/50 rounded-md px-2 py-1.5 transition-colors"
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
              <SidebarMenu>
                {contentTypeMapping.map((type) => {
                  const typeCount = getContentTypeCount(type.keys);
                  const isTypeActive = type.keys.some(key => activeFilters.contentType === key);

                  return (
                    <SidebarMenuItem key={type.name}>
                      <SidebarMenuButton
                        className={cn(
                          "h-9 px-2 rounded-md transition-all",
                          isTypeActive && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium"
                        )}
                        onClick={() => handleFilterClick("contentType", type.keys[0])}
                      >
                        <type.icon className="w-4 h-4" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-sm">{type.name}</span>
                            {typeCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
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

        {/* BY COLLECTION */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel
            className="flex items-center justify-between cursor-pointer hover:bg-stone-beige/50 rounded-md px-2 py-1.5 transition-colors"
            onClick={() => toggleSection("collections")}
          >
            <span className="text-xs font-medium text-deep-charcoal uppercase tracking-wide">
              {!collapsed && "By Collection"}
            </span>
            {!collapsed && (
              <ChevronRight
                className={cn(
                  "w-3 h-3 transition-transform text-deep-charcoal",
                  expandedSections.collections && "rotate-90"
                )}
              />
            )}
          </SidebarGroupLabel>

          {expandedSections.collections && (
            <SidebarGroupContent>
              <SidebarMenu>
                {collections.map((collection) => {
                  const CollectionIcon = getCollectionIcon(collection.key) || collection.icon;
                  const collectionCount = getCollectionCount(collection.key);
                  const isCollectionActive = activeFilters.collection === collection.key;

                  return (
                    <SidebarMenuItem key={collection.key}>
                      <SidebarMenuButton
                        className={cn(
                          "group flex items-center justify-between h-9 px-2 rounded-md transition-all",
                          isCollectionActive && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium"
                        )}
                        onClick={() => handleFilterClick("collection", collection.key)}
                      >
                        <div className="flex items-center gap-2">
                          {!collapsed && (
                            <span className="text-sm">{collection.name}</span>
                          )}
                        </div>
                        {!collapsed && collectionCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {collectionCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* BY DIP WEEK */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel
            className="flex items-center justify-between cursor-pointer hover:bg-stone-beige/50 rounded-md px-2 py-1.5 transition-colors"
            onClick={() => toggleSection("dipWeeks")}
          >
            <span className="text-xs font-medium text-deep-charcoal uppercase tracking-wide">
              {!collapsed && "By DIP Week"}
            </span>
            {!collapsed && (
              <ChevronRight
                className={cn(
                  "w-3 h-3 transition-transform text-deep-charcoal",
                  expandedSections.dipWeeks && "rotate-90"
                )}
              />
            )}
          </SidebarGroupLabel>

          {expandedSections.dipWeeks && (
            <SidebarGroupContent>
              <SidebarMenu>
                {dipWeeks.map((week) => {
                  const weekCount = (counts.prompts.byDipWeek[week.number] || 0) + 
                                      (counts.outputs.byDipWeek[week.number] || 0) + 
                                      (counts.masterContent.byDipWeek[week.number] || 0);
                  const isWeekActive = activeFilters.dipWeek === week.number;

                  return (
                    <SidebarMenuItem key={week.number}>
                      <SidebarMenuButton
                        className={cn(
                          "h-9 px-2 rounded-md transition-all",
                          isWeekActive && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium"
                        )}
                        onClick={() => handleFilterClick("dipWeek", week.number)}
                      >
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-sm">
                              Week {week.number}: {week.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {weekCount}
                            </Badge>
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
          <SidebarGroupLabel className="px-2 py-1.5">
            <span className="text-xs font-medium text-deep-charcoal uppercase tracking-wide">
              {!collapsed && "Quick Access"}
            </span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    "h-9 px-2 rounded-md transition-all",
                    activeFilters.quickAccess === "favorites" && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium"
                  )}
                  onClick={() => handleFilterClick("quickAccess", "favorites")}
                >
                  <Star className="w-4 h-4" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm">Favorites</span>
                      <Badge variant="secondary" className="text-xs">
                        {counts.favorites}
                      </Badge>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    "h-9 px-2 rounded-md transition-all",
                    activeFilters.quickAccess === "recent" && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium"
                  )}
                  onClick={() => handleFilterClick("quickAccess", "recent")}
                >
                  <Clock className="w-4 h-4" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm">Recent</span>
                      <Badge variant="secondary" className="text-xs">
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
