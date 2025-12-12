import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Copy, 
  Download, 
  Archive, 
  Tag,
  ShoppingCart,
  ExternalLink,
  ArrowUpDown,
  X,
  Trash2,
  Upload,
  Loader2,
  Check
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketplaceListing {
  id: string;
  title: string;
  platform: string;
  status: string;
  platform_data: any;
  created_at: string;
  updated_at: string;
  product_id: string | null;
  external_url: string | null;
  etsy_listing_id?: number | null;
  etsy_state?: string | null;
  last_etsy_sync?: string | null;
}

export default function MarketplaceLibrary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"alphabetical" | "recent" | "status">("recent");
  const [etsyConnected, setEtsyConnected] = useState(false);
  const [pushingToEtsy, setPushingToEtsy] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganizationId) {
      fetchListings();
    }
  }, [currentOrganizationId]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .eq('is_archived', false)  // Only show non-archived listings
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error loading listings",
        description: "Could not load your marketplace listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
      
      toast({
        title: "Listing deleted",
        description: "Listing permanently deleted",
      });
      fetchListings();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: "Could not delete listing",
        variant: "destructive",
      });
    }
  };

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    const filtered = listings.filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = platformFilter === "all" || listing.platform === platformFilter;
      const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
      return matchesSearch && matchesPlatform && matchesStatus;
    });

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "recent") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });
  }, [listings, searchQuery, platformFilter, statusFilter, sortBy]);

  const hasActiveFilters = platformFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setPlatformFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  const handleDuplicate = async (listing: MarketplaceListing) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          organization_id: currentOrganizationId,
          platform: listing.platform,
          title: `${listing.title} (Copy)`,
          platform_data: listing.platform_data,
          status: 'draft',
          product_id: listing.product_id
        });

      if (error) throw error;
      
      toast({
        title: "Listing duplicated",
        description: "A copy has been created",
      });
      fetchListings();
    } catch (error) {
      console.error('Error duplicating:', error);
      toast({
        title: "Error",
        description: "Could not duplicate listing",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', listingId);

      if (error) throw error;
      
      toast({
        title: "Listing archived",
        description: "Listing moved to archive",
      });
      fetchListings();
    } catch (error) {
      console.error('Error archiving:', error);
      toast({
        title: "Error",
        description: "Could not archive listing",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = (listing: MarketplaceListing) => {
    const data = listing.platform_data;
    const csvContent = `Title,Platform,Status,Description,Tags,Price\n"${listing.title}","${listing.platform}","${listing.status}","${data.description || ''}","${(data.tags || []).join('; ')}","${data.price || ''}"\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${listing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV exported",
      description: "Listing exported successfully",
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'shopify':
        return <ShoppingCart className="w-5 h-5" />;
      case 'etsy':
        return <Tag className="w-5 h-5" />;
      case 'tiktok_shop':
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <ShoppingCart className="w-5 h-5" />;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors = {
      shopify: "bg-green-500/10 text-green-700 border-green-500/20",
      etsy: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      tiktok_shop: "bg-charcoal/10 text-charcoal/70 border-charcoal/20"
    };
    return colors[platform as keyof typeof colors] || "bg-charcoal/5 text-charcoal/60";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-charcoal/5 text-charcoal/60 border-charcoal/10",
      published: "bg-aged-brass/10 text-aged-brass border-aged-brass/20",
      archived: "bg-charcoal/5 text-charcoal/50 border-charcoal/10"
    };
    return colors[status as keyof typeof colors] || "bg-charcoal/5 text-charcoal/60";
  };

  return (
    <div className="min-h-screen bg-parchment-white">
      {/* Header */}
      <div className="border-b border-charcoal/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-ink-black">Listing Templates</h1>
              <p className="text-charcoal/70 mt-1">Pre-written listings you can export and publish to your marketplace</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="brass">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/marketplace/shopify')}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shopify Listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/marketplace/etsy')}>
                  <Tag className="w-4 h-4 mr-2" />
                  Etsy Listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/marketplace/tiktok_shop')}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  TikTok Shop Listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search and Sort Row */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/50" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-charcoal/60">Filter:</span>
            
            {/* Platform Filters */}
            <Badge
              variant="outline"
              className={platformFilter === "all" ? "cursor-pointer bg-aged-brass/10 text-aged-brass border-aged-brass/20" : "cursor-pointer hover:bg-charcoal/5"}
              onClick={() => setPlatformFilter("all")}
            >
              All Platforms
            </Badge>
            <Badge
              variant="outline"
              className={platformFilter === "shopify" ? "cursor-pointer bg-aged-brass/10 text-aged-brass border-aged-brass/20" : "cursor-pointer bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/15"}
              onClick={() => setPlatformFilter("shopify")}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Shopify
            </Badge>
            <Badge
              variant="outline"
              className={platformFilter === "etsy" ? "cursor-pointer bg-aged-brass/10 text-aged-brass border-aged-brass/20" : "cursor-pointer bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/15"}
              onClick={() => setPlatformFilter("etsy")}
            >
              <Tag className="w-3 h-3 mr-1" />
              Etsy
            </Badge>
            <Badge
              variant="outline"
              className={platformFilter === "tiktok_shop" ? "cursor-pointer bg-aged-brass/10 text-aged-brass border-aged-brass/20" : "cursor-pointer bg-charcoal/10 text-charcoal/70 border-charcoal/20 hover:bg-charcoal/15"}
              onClick={() => setPlatformFilter("tiktok_shop")}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              TikTok Shop
            </Badge>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Status Filters */}
            <Badge
              variant="outline"
              className={statusFilter === "all" ? "cursor-pointer bg-aged-brass/10 text-aged-brass border-aged-brass/20" : "cursor-pointer hover:bg-charcoal/5"}
              onClick={() => setStatusFilter("all")}
            >
              All Statuses
            </Badge>
            <Badge
              variant="outline"
              className={statusFilter === "draft" ? "cursor-pointer bg-aged-brass/10 text-aged-brass border-aged-brass/20" : "cursor-pointer bg-charcoal/5 text-charcoal/60 border-charcoal/10 hover:bg-charcoal/10"}
              onClick={() => setStatusFilter("draft")}
            >
              Draft
            </Badge>
            <Badge
              variant="outline"
              className={statusFilter === "published" ? "cursor-pointer bg-aged-brass/10 text-aged-brass border-aged-brass/20" : "cursor-pointer bg-aged-brass/5 text-aged-brass/80 border-aged-brass/15 hover:bg-aged-brass/10"}
              onClick={() => setStatusFilter("published")}
            >
              Published
            </Badge>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 gap-1 ml-2 text-charcoal/70 hover:text-charcoal"
              >
                <X className="w-3 h-3" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-charcoal/70">Loading listings...</p>
            </div>
          ) : filteredAndSortedListings.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto text-charcoal/30 mb-4" />
              <h3 className="text-lg font-semibold text-ink-black mb-2">No listings found</h3>
              <p className="text-charcoal/70 mb-6">
                {searchQuery || platformFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first marketplace listing to get started'}
              </p>
              {!searchQuery && platformFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => navigate('/marketplace')} variant="brass">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Listing
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(listing.platform)}
                        <Badge className={getPlatformBadge(listing.platform)}>
                          {listing.platform === 'shopify' ? 'Shopify' : listing.platform === 'etsy' ? 'Etsy' : 'TikTok Shop'}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/marketplace/${listing.platform}?id=${listing.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(listing)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportCSV(listing)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                          </DropdownMenuItem>
                          {listing.external_url && (
                            <DropdownMenuItem onClick={() => window.open(listing.external_url!, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on Platform
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleArchive(listing.id)}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(listing.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-semibold text-ink-black mb-2 line-clamp-2">
                      {listing.title}
                    </h3>

                    <p className="text-sm text-charcoal/70 mb-3 line-clamp-2">
                      {listing.platform_data?.description || 'No description'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-charcoal/60">
                      <Badge variant="outline" className={getStatusBadge(listing.status)}>
                        {listing.status}
                      </Badge>
                      <span>
                        Updated {new Date(listing.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
