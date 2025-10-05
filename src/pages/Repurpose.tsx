import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Edit, FileText, Mail, Instagram, Twitter, Package, MessageSquare, Copy, MoreVertical, Search, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScheduleModal } from "@/components/calendar/ScheduleModal";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MasterContent {
  id: string;
  title: string;
  content_type: string;
  full_content: string;
  word_count: number;
  collection: string | null;
  dip_week: number | null;
  pillar_focus: string | null;
  created_at: string;
}

interface DerivativeAsset {
  id: string;
  master_content_id: string;
  asset_type: string;
  generated_content: string;
  platform_specs: any;
  approval_status: string;
  created_at: string;
}

const DERIVATIVE_ICONS = {
  email: Mail,
  instagram: Instagram,
  twitter: Twitter,
  product: Package,
  sms: MessageSquare,
};

const DERIVATIVE_LABELS = {
  email: "Email Newsletter",
  instagram: "Instagram Carousel",
  twitter: "Twitter Thread",
  product: "Product Description",
  sms: "SMS Message",
};

const PLATFORM_MAPPING: Record<string, string> = {
  email: "Email",
  instagram: "Instagram",
  twitter: "Twitter",
  product: "LinkedIn",
  sms: "SMS"
};

const Repurpose = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [masterContents, setMasterContents] = useState<MasterContent[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<MasterContent | null>(null);
  const [derivatives, setDerivatives] = useState<DerivativeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<DerivativeAsset | null>(null);
  const [editingDerivative, setEditingDerivative] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'master' | 'derivative', id: string, title?: string } | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [derivativeToSchedule, setDerivativeToSchedule] = useState<DerivativeAsset | null>(null);
  const [scheduledDerivatives, setScheduledDerivatives] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchMasterContents();
  }, []);

  const fetchMasterContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('master_content')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMasterContents(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDerivatives = async (masterContentId: string) => {
    try {
      const { data, error } = await supabase
        .from('derivative_assets')
        .select('*')
        .eq('master_content_id', masterContentId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDerivatives(data || []);
      
      // Fetch scheduling status for derivatives
      if (data && data.length > 0) {
        fetchScheduledStatus(data.map(d => d.id));
      }
    } catch (error: any) {
      toast({
        title: "Error loading derivatives",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchScheduledStatus = async (derivativeIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_content')
        .select('derivative_id, scheduled_date, scheduled_time, platform, id')
        .in('derivative_id', derivativeIds)
        .neq('status', 'cancelled');

      if (error) throw error;

      const statusMap: Record<string, any> = {};
      data?.forEach(item => {
        if (item.derivative_id) {
          statusMap[item.derivative_id] = item;
        }
      });
      setScheduledDerivatives(statusMap);
    } catch (error: any) {
      console.error("Error fetching scheduled status:", error);
    }
  };

  // Auto-select master from URL (?master=ID) and load its derivatives
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const masterId = params.get('master');

    if (masterContents.length === 0) return;

    if (masterId) {
      const found = masterContents.find(m => m.id === masterId) || null;
      if (found && found.id !== selectedMaster?.id) {
        setSelectedMaster(found);
        fetchDerivatives(masterId);
      }
    } else if (!selectedMaster) {
      // Default to the most recent master content
      const first = masterContents[0];
      setSelectedMaster(first);
      fetchDerivatives(first.id);
    }
  }, [location.search, masterContents]);

  const handleSelectMaster = (master: MasterContent) => {
    setSelectedMaster(master);
    fetchDerivatives(master.id);
  };

  const handleApprove = async (derivativeId: string) => {
    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ approval_status: 'approved' })
        .eq('id', derivativeId);

      if (error) throw error;

      setDerivatives(prev =>
        prev.map(d => d.id === derivativeId ? { ...d, approval_status: 'approved' } : d)
      );

      toast({
        title: "Asset approved",
        description: "This derivative has been approved.",
      });
    } catch (error: any) {
      toast({
        title: "Error approving asset",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleScheduleDerivative = (derivative: DerivativeAsset) => {
    setDerivativeToSchedule(derivative);
    setScheduleModalOpen(true);
  };

  const handleApproveAndSchedule = async (derivative: DerivativeAsset) => {
    await handleApprove(derivative.id);
    handleScheduleDerivative(derivative);
  };

  const handleScheduleSuccess = () => {
    if (selectedMaster) {
      fetchDerivatives(selectedMaster.id);
    }
    toast({
      title: "Success",
      description: "Derivative scheduled successfully",
    });
  };

  const handleViewOnCalendar = (scheduleDate: string) => {
    navigate(`/calendar?date=${scheduleDate}`);
  };

  const handleReject = async (derivativeId: string) => {
    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ approval_status: 'rejected' })
        .eq('id', derivativeId);

      if (error) throw error;

      setDerivatives(prev =>
        prev.map(d => d.id === derivativeId ? { ...d, approval_status: 'rejected' } : d)
      );

      toast({
        title: "Asset rejected",
        description: "View in Rejected tab if needed.",
      });
    } catch (error: any) {
      toast({
        title: "Error rejecting asset",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (derivative: DerivativeAsset) => {
    setEditingDerivative(derivative.id);
    setEditedContent(derivative.generated_content);
  };

  const handleSaveEdit = async (derivativeId: string) => {
    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ generated_content: editedContent })
        .eq('id', derivativeId);

      if (error) throw error;

      setDerivatives(prev =>
        prev.map(d => d.id === derivativeId ? { ...d, generated_content: editedContent } : d)
      );

      setEditingDerivative(null);

      toast({
        title: "Changes saved",
        description: "Your edits have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving changes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCopyContent = (content: string, assetType: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Content copied",
      description: `${DERIVATIVE_LABELS[assetType as keyof typeof DERIVATIVE_LABELS]} copied to clipboard.`,
    });
  };

  const handlePreview = (derivative: DerivativeAsset) => {
    setPreviewContent(derivative);
    setPreviewOpen(true);
  };

  const handleArchiveMaster = async (masterId: string) => {
    try {
      const { error } = await supabase
        .from('master_content')
        .update({ is_archived: true })
        .eq('id', masterId);

      if (error) throw error;

      setMasterContents(prev => prev.filter(m => m.id !== masterId));
      
      if (selectedMaster?.id === masterId) {
        const nextMaster = masterContents.find(m => m.id !== masterId);
        if (nextMaster) {
          setSelectedMaster(nextMaster);
          fetchDerivatives(nextMaster.id);
        } else {
          setSelectedMaster(null);
          setDerivatives([]);
        }
      }

      toast({
        title: "Content archived",
        description: "Master content has been moved to the Archive.",
      });
    } catch (error: any) {
      toast({
        title: "Error archiving content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleArchiveDerivative = async (derivativeId: string) => {
    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ is_archived: true })
        .eq('id', derivativeId);

      if (error) throw error;

      setDerivatives(prev => prev.filter(d => d.id !== derivativeId));

      toast({
        title: "Asset archived",
        description: "Derivative has been moved to the Archive.",
      });
    } catch (error: any) {
      toast({
        title: "Error archiving asset",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (type: 'master' | 'derivative', id: string, title?: string) => {
    setItemToDelete({ type, id, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'master') {
        // Delete master content and its derivatives will cascade
        const { error } = await supabase
          .from('master_content')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;

        setMasterContents(prev => prev.filter(m => m.id !== itemToDelete.id));
        
        if (selectedMaster?.id === itemToDelete.id) {
          const nextMaster = masterContents.find(m => m.id !== itemToDelete.id);
          if (nextMaster) {
            setSelectedMaster(nextMaster);
            fetchDerivatives(nextMaster.id);
          } else {
            setSelectedMaster(null);
            setDerivatives([]);
          }
        }

        toast({
          title: "Content deleted",
          description: "Master content and its derivatives have been permanently deleted.",
        });
      } else {
        // Delete derivative
        const { error } = await supabase
          .from('derivative_assets')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;

        setDerivatives(prev => prev.filter(d => d.id !== itemToDelete.id));

        toast({
          title: "Asset deleted",
          description: "Derivative has been permanently deleted.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error deleting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const approvedCount = derivatives.filter(d => d.approval_status === 'approved').length;
  const pendingCount = derivatives.filter(d => d.approval_status === 'pending').length;
  const rejectedCount = derivatives.filter(d => d.approval_status === 'rejected').length;
  
  const filteredDerivatives = derivatives.filter(d => {
    if (statusFilter === "rejected") return d.approval_status === 'rejected';
    if (statusFilter === "pending") return d.approval_status === 'pending';
    if (statusFilter === "approved") return d.approval_status === 'approved';
    // "all" tab excludes rejected items by default
    return d.approval_status !== 'rejected';
  });

  const getStatusBorderColor = (status: string) => {
    if (status === 'approved') return 'border-l-4 border-l-green-500 bg-green-500/5';
    if (status === 'pending') return 'border-l-4 border-l-orange-500 bg-orange-500/5';
    if (status === 'rejected') return 'border-l-4 border-l-muted bg-muted/20 opacity-60';
    return '';
  };

  // Filter master content by search query
  const searchFilteredContent = masterContents.filter(master => {
    const query = searchQuery.toLowerCase();
    return (
      master.title.toLowerCase().includes(query) ||
      master.content_type.toLowerCase().includes(query) ||
      (master.collection?.toLowerCase() || "").includes(query) ||
      (master.pillar_focus?.toLowerCase() || "").includes(query)
    );
  });

  // Sort filtered content
  const sortedContent = [...searchFilteredContent].sort((a, b) => {
    switch(sortBy) {
      case "oldest": 
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "week": 
        return (a.dip_week || 999) - (b.dip_week || 999);
      case "title": 
        return a.title.localeCompare(b.title);
      case "type": 
        return a.content_type.localeCompare(b.content_type);
      default: // "newest"
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Group sorted content by content type
  const groupedContent = sortedContent.reduce((groups, master) => {
    const key = master.content_type || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(master);
    return groups;
  }, {} as Record<string, MasterContent[]>);

  // Get group keys in alphabetical order
  const groupKeys = Object.keys(groupedContent).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading master content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-foreground">Content Repurposing</h1>
        <p className="text-muted-foreground">
          Transform master content into multi-channel derivative assets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Master Content List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-serif text-foreground">Master Content</h2>
          
          {masterContents.length === 0 ? (
            <Card className="p-6 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No master content yet</p>
              <Button onClick={() => navigate('/forge')}>Create in Forge</Button>
            </Card>
          ) : (
            <>
              {/* Search & Sort Controls */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, type, collection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="week">By Week</SelectItem>
                    <SelectItem value="title">By Title (A-Z)</SelectItem>
                    <SelectItem value="type">By Content Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grouped Content */}
              {sortedContent.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">No matches found. Try different keywords.</p>
                </Card>
              ) : (
                <Accordion type="multiple" defaultValue={groupKeys.slice(0, 2)} className="space-y-2">
                  {groupKeys.map((groupKey) => (
                    <AccordionItem key={groupKey} value={groupKey} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{groupKey}</span>
                          <Badge variant="secondary" className="text-xs">
                            {groupedContent[groupKey].length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-3 pb-4">
                        {groupedContent[groupKey].map((master) => (
                          <Card
                            key={master.id}
                            className={`p-4 transition-all hover:shadow-glow ${
                              selectedMaster?.id === master.id ? 'border-primary shadow-glow' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div 
                                className="flex-1 space-y-2 cursor-pointer"
                                onClick={() => handleSelectMaster(master)}
                              >
                                <h3 className="font-medium text-foreground">{master.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">{master.content_type}</Badge>
                                  {master.dip_week && (
                                    <Badge variant="secondary">Week {master.dip_week}</Badge>
                                  )}
                                  {master.word_count && (
                                    <Badge variant="outline">{master.word_count} words</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(master.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-background">
                                  <DropdownMenuItem onClick={() => handleArchiveMaster(master.id)}>
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => confirmDelete('master', master.id, master.title)}
                                    className="text-destructive"
                                  >
                                    Delete Permanently
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </Card>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </>
          )}
        </div>

        {/* Derivatives Section */}
        <div className="lg:col-span-2 space-y-4">
          {selectedMaster ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif text-foreground">Derivative Assets</h2>
              </div>

              <Card className="p-6 bg-muted/20">
                <div className="space-y-3">
                  <h3 className="font-serif text-lg text-foreground">{selectedMaster.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {selectedMaster.full_content}
                  </p>
                  <div className="flex gap-2 pt-2">
                    {selectedMaster.collection && (
                      <Badge variant="outline">{selectedMaster.collection}</Badge>
                    )}
                    {selectedMaster.pillar_focus && (
                      <Badge variant="outline">{selectedMaster.pillar_focus}</Badge>
                    )}
                  </div>
                  {derivatives.length > 0 && (
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Approval Progress</span>
                        <span className="font-medium">{approvedCount}/{derivatives.length}</span>
                      </div>
                      <Progress value={(approvedCount / derivatives.length) * 100} />
                      <div className="flex gap-4 text-xs pt-2">
                        <span className="text-green-600">✓ {approvedCount} Approved</span>
                        <span className="text-orange-600">◷ {pendingCount} Pending</span>
                        <span className="text-muted-foreground">✕ {rejectedCount} Rejected</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {derivatives.length === 0 ? (
                <Card className="p-8 text-center space-y-4">
                  <p className="text-muted-foreground">
                    No derivatives generated for this content yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generate derivatives from the Forge using Master Content mode.
                  </p>
                </Card>
              ) : (
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
                  <TabsList className="bg-muted">
                    <TabsTrigger value="all">All ({derivatives.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
                  </TabsList>

                  <TabsContent value={statusFilter} className="space-y-4">
                    {filteredDerivatives.length === 0 ? (
                      <Card className="p-8 text-center">
                        <p className="text-muted-foreground">No {statusFilter} derivatives</p>
                      </Card>
                    ) : (
                      filteredDerivatives.map((derivative) => {
                    const Icon = DERIVATIVE_ICONS[derivative.asset_type as keyof typeof DERIVATIVE_ICONS] || FileText;
                    const isEditing = editingDerivative === derivative.id;

                        return (
                          <Card key={derivative.id} className={`p-6 space-y-4 ${getStatusBorderColor(derivative.approval_status)}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-primary" />
                                <div>
                                  <h3 className="font-medium text-foreground">
                                    {DERIVATIVE_LABELS[derivative.asset_type as keyof typeof DERIVATIVE_LABELS]}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(derivative.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  derivative.approval_status === 'approved'
                                    ? 'default'
                                    : derivative.approval_status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {derivative.approval_status}
                              </Badge>
                            </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              rows={8}
                              className="font-mono text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveEdit(derivative.id)}>
                                Save Changes
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingDerivative(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-muted/50 p-4 rounded-md">
                              <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                                {derivative.generated_content}
                              </p>
                            </div>

                            {/* Scheduling Status Badge */}
                            {scheduledDerivatives[derivative.id] && (
                              <div className="bg-primary/10 border border-primary/30 rounded-md p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    Scheduled for {format(new Date(scheduledDerivatives[derivative.id].scheduled_date), "MMM d, yyyy")}
                                    {scheduledDerivatives[derivative.id].scheduled_time && 
                                      ` at ${scheduledDerivatives[derivative.id].scheduled_time}`
                                    }
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewOnCalendar(scheduledDerivatives[derivative.id].scheduled_date)}
                                >
                                  View on Calendar
                                </Button>
                              </div>
                            )}

                            <div className="flex gap-2 items-center flex-wrap">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleCopyContent(derivative.generated_content, derivative.asset_type)}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy Content
                              </Button>
                              
                              {derivative.approval_status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleScheduleDerivative(derivative)}
                                  >
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    Schedule
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveAndSchedule(derivative)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve & Schedule
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(derivative.id)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}

                              {derivative.approval_status === 'approved' && !scheduledDerivatives[derivative.id] && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleScheduleDerivative(derivative)}
                                >
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Schedule
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-background">
                                  <DropdownMenuItem onClick={() => handlePreview(derivative)}>
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(derivative)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  {!scheduledDerivatives[derivative.id] && (
                                    <DropdownMenuItem onClick={() => handleScheduleDerivative(derivative)}>
                                      <CalendarIcon className="h-4 w-4 mr-2" />
                                      Schedule
                                    </DropdownMenuItem>
                                  )}
                                  {derivative.approval_status === 'approved' && (
                                    <DropdownMenuItem onClick={() => handleReject(derivative.id)}>
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  )}
                                  {derivative.approval_status === 'rejected' && (
                                    <DropdownMenuItem onClick={() => handleApprove(derivative.id)}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleArchiveDerivative(derivative.id)}>
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => confirmDelete('derivative', derivative.id)}
                                    className="text-destructive"
                                  >
                                    Delete Permanently
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </>
                        )}
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Select master content from the left to view its derivatives
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewContent && DERIVATIVE_LABELS[previewContent.asset_type as keyof typeof DERIVATIVE_LABELS]}
            </DialogTitle>
            <DialogDescription>Full preview of generated content</DialogDescription>
          </DialogHeader>
          {previewContent && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-6 rounded-md">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {previewContent.generated_content}
                </pre>
              </div>
              {previewContent.platform_specs && Object.keys(previewContent.platform_specs).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Platform Details</h4>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <pre className="text-xs text-muted-foreground">
                      {JSON.stringify(previewContent.platform_specs, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'master' ? (
                <>
                  This will permanently delete "{itemToDelete.title}" and all its derivative assets. 
                  This action cannot be undone.
                </>
              ) : (
                <>
                  This will permanently delete this derivative asset. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        derivativeAsset={derivativeToSchedule}
        masterContent={selectedMaster}
        onSuccess={handleScheduleSuccess}
      />
      </div>
    </div>
  );
};

export default Repurpose;
