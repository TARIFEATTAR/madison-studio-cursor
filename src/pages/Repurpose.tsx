import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, MoreVertical, Search, Mail, Instagram, Twitter, Package, MessageSquare } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DerivativeGridCard } from "@/components/amplify/DerivativeGridCard";
import { DerivativeFullModal } from "@/components/amplify/DerivativeFullModal";
import { MasterContentCard } from "@/components/amplify/MasterContentCard";

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
  email_3part: Mail,
  email_5part: Mail,
  email_7part: Mail,
};

const DERIVATIVE_LABELS = {
  email: "Email Newsletter",
  instagram: "Instagram Carousel",
  twitter: "Twitter Thread",
  product: "Product Description",
  sms: "SMS Message",
  email_3part: "3-Part Email Sequence",
  email_5part: "5-Part Email Sequence",
  email_7part: "7-Part Email Sequence",
};

const PLATFORM_MAPPING: Record<string, string> = {
  email: "Email",
  instagram: "Instagram",
  twitter: "Twitter",
  product: "LinkedIn",
  sms: "SMS",
  email_3part: "Email",
  email_5part: "Email",
  email_7part: "Email",
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDerivative, setSelectedDerivative] = useState<DerivativeAsset | null>(null);
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

  const handleOpenModal = (derivative: DerivativeAsset) => {
    setSelectedDerivative(derivative);
    setModalOpen(true);
  };

  const handleApprove = async (derivativeId?: string) => {
    const id = derivativeId || selectedDerivative?.id;
    if (!id) return;

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ approval_status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      setDerivatives(prev =>
        prev.map(d => d.id === id ? { ...d, approval_status: 'approved' } : d)
      );

      if (selectedDerivative?.id === id) {
        setSelectedDerivative(prev => prev ? { ...prev, approval_status: 'approved' } : null);
      }

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

  const handleScheduleDerivative = () => {
    if (!selectedDerivative) return;
    setDerivativeToSchedule(selectedDerivative);
    setScheduleModalOpen(true);
  };

  const handleApproveAndSchedule = async () => {
    if (!selectedDerivative) return;
    await handleApprove(selectedDerivative.id);
    setDerivativeToSchedule(selectedDerivative);
    setScheduleModalOpen(true);
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

  const handleReject = async (derivativeId?: string) => {
    const id = derivativeId || selectedDerivative?.id;
    if (!id) return;

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ approval_status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      setDerivatives(prev =>
        prev.map(d => d.id === id ? { ...d, approval_status: 'rejected' } : d)
      );

      if (selectedDerivative?.id === id) {
        setSelectedDerivative(prev => prev ? { ...prev, approval_status: 'rejected' } : null);
      }

      toast({
        title: "Asset rejected",
        description: "View in Rejected tab if needed.",
      });
      setModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error rejecting asset",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async (newContent: string) => {
    if (!selectedDerivative) return;

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ generated_content: newContent })
        .eq('id', selectedDerivative.id);

      if (error) throw error;

      setDerivatives(prev =>
        prev.map(d => d.id === selectedDerivative.id ? { ...d, generated_content: newContent } : d)
      );

      setSelectedDerivative(prev => prev ? { ...prev, generated_content: newContent } : null);

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

  const handleCopyContent = () => {
    if (!selectedDerivative) return;
    
    navigator.clipboard.writeText(selectedDerivative.generated_content);
    toast({
      title: "Content copied",
      description: `${DERIVATIVE_LABELS[selectedDerivative.asset_type as keyof typeof DERIVATIVE_LABELS]} copied to clipboard.`,
    });
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
        description: "Master content has been moved to Portfolio.",
      });
    } catch (error: any) {
      toast({
        title: "Error archiving content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleArchiveDerivative = async () => {
    if (!selectedDerivative) return;

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ is_archived: true })
        .eq('id', selectedDerivative.id);

      if (error) throw error;

      setDerivatives(prev => prev.filter(d => d.id !== selectedDerivative.id));
      setModalOpen(false);

      toast({
        title: "Asset archived",
        description: "Derivative has been moved to Portfolio.",
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
          description: "Content and its derivatives have been permanently deleted.",
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
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-foreground">Amplify</h1>
            <p className="text-sm text-muted-foreground">One voice, every channel</p>
          </div>
        </div>

        {/* Master Content Section - Compact Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif text-foreground">Master Content</h2>
            {selectedMaster && (
              <Badge variant="outline" className="text-xs">
                {masterContents.length} total
              </Badge>
            )}
          </div>

          {loading ? (
            <Card className="p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </Card>
          ) : masterContents.length === 0 ? (
            <Card className="p-6 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Ready to Amplify</p>
              <Button onClick={() => navigate("/forge")}>Create in Composer</Button>
            </Card>
          ) : (
            <>
              {/* Compact Search + Sort */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="week">By Week</SelectItem>
                    <SelectItem value="title">A-Z</SelectItem>
                    <SelectItem value="type">By Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Master Content Grid */}
              {sortedContent.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No matches found</p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {sortedContent.map((master) => (
                    <MasterContentCard
                      key={master.id}
                      content={master}
                      isSelected={selectedMaster?.id === master.id}
                      onClick={() => handleSelectMaster(master)}
                      onArchive={() => handleArchiveMaster(master.id)}
                      onDelete={() => confirmDelete('master', master.id, master.title)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Derivatives Section */}
        <div className="space-y-4">
          {selectedMaster ? (
            <>
              {/* Compact Selected Content Header */}
              <div className="flex items-start justify-between gap-4 p-4 bg-muted/20 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-serif text-foreground">Derivative Assets</h2>
                    <Badge variant="outline" className="text-xs">
                      {selectedMaster.content_type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{selectedMaster.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {selectedMaster.full_content}
                  </p>
                </div>
                {derivatives.length > 0 && (
                  <div className="flex flex-col items-end gap-1 min-w-[100px]">
                    <div className="text-xs text-muted-foreground">Progress</div>
                    <div className="text-lg font-semibold">{approvedCount}/{derivatives.length}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-600">✓{approvedCount}</span>
                      <span className="text-orange-600">◷{pendingCount}</span>
                      <span className="text-muted-foreground">✕{rejectedCount}</span>
                    </div>
                  </div>
                )}
              </div>

              {derivatives.length === 0 ? (
                <Card className="p-8 text-center space-y-4">
                  <p className="text-muted-foreground">
                    No derivatives generated for this content yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generate derivatives using Composer's Master Content mode.
                  </p>
                </Card>
              ) : (
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
                  <TabsList className="bg-muted">
                    <TabsTrigger value="all" className="relative">
                      All ({derivatives.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="relative">
                      <span className="flex items-center gap-2">
                        {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-antique-gold" />}
                        Pending ({pendingCount})
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="relative">
                      <span className="flex items-center gap-2">
                        {approvedCount > 0 && <span className="w-2 h-2 rounded-full bg-forest-ink" />}
                        Approved ({approvedCount})
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                      Rejected ({rejectedCount})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={statusFilter} className="space-y-4">
                    {filteredDerivatives.length === 0 ? (
                      <Card className="p-8 text-center">
                        <p className="text-muted-foreground">No {statusFilter} derivatives</p>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDerivatives.map((derivative) => (
                          <DerivativeGridCard
                            key={derivative.id}
                            derivative={derivative}
                            label={DERIVATIVE_LABELS[derivative.asset_type as keyof typeof DERIVATIVE_LABELS] || derivative.asset_type}
                            isScheduled={!!scheduledDerivatives[derivative.id]}
                            onClick={() => handleOpenModal(derivative)}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Select content from the left to view its derivatives
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Full-Screen Modal */}
      <DerivativeFullModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        derivative={selectedDerivative}
        label={selectedDerivative ? DERIVATIVE_LABELS[selectedDerivative.asset_type as keyof typeof DERIVATIVE_LABELS] : ''}
        isScheduled={selectedDerivative ? !!scheduledDerivatives[selectedDerivative.id] : false}
        scheduledDate={selectedDerivative && scheduledDerivatives[selectedDerivative.id]?.scheduled_date}
        onApprove={() => handleApprove()}
        onReject={() => handleReject()}
        onEdit={handleSaveEdit}
        onCopy={handleCopyContent}
        onSchedule={handleScheduleDerivative}
        onApproveAndSchedule={handleApproveAndSchedule}
        onArchive={handleArchiveDerivative}
        onDelete={() => selectedDerivative && confirmDelete('derivative', selectedDerivative.id)}
        onViewCalendar={
          selectedDerivative && scheduledDerivatives[selectedDerivative.id]
            ? () => handleViewOnCalendar(scheduledDerivatives[selectedDerivative.id].scheduled_date)
            : undefined
        }
      />

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
  );
};

export default Repurpose;
