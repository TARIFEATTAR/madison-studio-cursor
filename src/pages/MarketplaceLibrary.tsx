import { useState, useEffect } from "react";
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
  ExternalLink
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

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || listing.platform === platformFilter;
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

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
      case 'etsy':
        return <Tag className="w-5 h-5 text-orange-500" />;
      case 'tiktok_shop':
        return <ShoppingCart className="w-5 h-5 text-pink-500" />;
      default:
        return <ShoppingCart className="w-5 h-5" />;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors = {
      etsy: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      tiktok_shop: "bg-pink-500/10 text-pink-700 border-pink-500/20"
    };
    return colors[platform as keyof typeof colors] || "bg-gray-500/10 text-gray-700";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      published: "bg-green-500/10 text-green-700 border-green-500/20",
      archived: "bg-gray-500/10 text-gray-700 border-gray-500/20"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/10 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-parchment-white">
      {/* Header */}
      <div className="border-b border-charcoal/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-ink-black">Marketplace Library</h1>
              <p className="text-charcoal/70 mt-1">Manage all your marketplace listings</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-aged-brass hover:bg-aged-brass/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/marketplace/etsy')}>
                  <Tag className="w-4 h-4 mr-2 text-orange-500" />
                  Etsy Listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/marketplace/tiktok_shop')}>
                  <ShoppingCart className="w-4 h-4 mr-2 text-pink-500" />
                  TikTok Shop Listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/50" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="etsy">Etsy</SelectItem>
                <SelectItem value="tiktok_shop">TikTok Shop</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
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
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto text-charcoal/30 mb-4" />
              <h3 className="text-lg font-semibold text-ink-black mb-2">No listings found</h3>
              <p className="text-charcoal/70 mb-6">
                {searchQuery || platformFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first marketplace listing to get started'}
              </p>
              {!searchQuery && platformFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => navigate('/marketplace')} className="bg-aged-brass hover:bg-aged-brass/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Listing
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(listing.platform)}
                        <Badge className={getPlatformBadge(listing.platform)}>
                          {listing.platform === 'etsy' ? 'Etsy' : 'TikTok Shop'}
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
                          <DropdownMenuItem onClick={() => handleArchive(listing.id)} className="text-destructive">
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
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
