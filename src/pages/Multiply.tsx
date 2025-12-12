import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VideoHelpTrigger } from "@/components/help/VideoHelpTrigger";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Archive, ChevronDown, ChevronRight, Copy,
  Loader2, ArrowLeft, FileText, Edit
} from "lucide-react";
import { EditorialDirectorSplitScreen } from "@/components/multiply/EditorialDirectorSplitScreen";
import { DerivativeFullModal } from "@/components/amplify/DerivativeFullModal";
import { DerivativeTypeSelector } from "@/components/multiply/DerivativeTypeSelector";
import { MasterContentSelector } from "@/components/multiply/MasterContentSelector";
import { MasterContentPanel } from "@/components/multiply/MasterContentPanel";
import { DerivativeResults } from "@/components/multiply/DerivativeResults";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import fannedPagesImage from "@/assets/fanned-pages-new.jpg";
import { MasterContent, DerivativeContent, RawDerivativeResponse } from "@/types/multiply";
import { TOP_DERIVATIVE_TYPES, ADDITIONAL_DERIVATIVE_TYPES, DERIVATIVE_TYPES } from "@/constants/multiply";
import { buildSequenceEmailsFromDerivative } from "@/lib/multiplyUtils";

export default function Multiply() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrganizationId } = useOnboarding();
  const [selectedMaster, setSelectedMaster] = useState<MasterContent | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [derivatives, setDerivatives] = useState<DerivativeContent[]>([]);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [splitScreenMode, setSplitScreenMode] = useState(false);
  const [selectedDerivativeForDirector, setSelectedDerivativeForDirector] = useState<DerivativeContent | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const [saveTitle, setSaveTitle] = useState("");
  const [masterContentList, setMasterContentList] = useState<MasterContent[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  const [derivativeSaveDialogOpen, setDerivativeSaveDialogOpen] = useState(false);
  const [derivativeToSave, setDerivativeToSave] = useState<DerivativeContent | null>(null);
  const [derivativeSaveTitle, setDerivativeSaveTitle] = useState("");

  const [isSavingMaster, setIsSavingMaster] = useState(false);
  const [isSavingDerivative, setIsSavingDerivative] = useState(false);
  const saveInFlightRef = useRef(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Modal state for derivative viewing/editing
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDerivativeForModal, setSelectedDerivativeForModal] = useState<DerivativeContent | null>(null);

  // Track if we selected master via navigation
  const selectedViaNavigationRef = useRef(false);

  useEffect(() => {
    const loadMasterContent = async () => {
      if (!currentOrganizationId) return;

      // Multi-source master selection: URL → state → localStorage → fallback
      let selectedId: string | null = null;
      let selectionSource: 'url' | 'state' | 'localStorage' | 'fallback' = 'fallback';

      // 1. Check URL param
      const urlId = searchParams.get('id');
      if (urlId) {
        selectedId = urlId;
        selectionSource = 'url';
      }

      // 2. Check navigation state
      if (!selectedId && location.state?.contentId) {
        selectedId = location.state.contentId;
        selectionSource = 'state';
      }

      // 3. Check localStorage
      if (!selectedId) {
        const localId = localStorage.getItem('lastEditedMasterId');
        if (localId) {
          selectedId = localId;
          selectionSource = 'localStorage';
        }
      }

      // If we have a specific ID from url/state/localStorage, fetch it immediately
      if (selectedId && selectionSource !== 'fallback') {
        try {
          const { data, error } = await supabase
            .from('master_content')
            .select('id, title, content_type, full_content, word_count, collection')
            .eq('id', selectedId)
            .single();

          if (error) throw error;

          if (data) {
            const masterContent = {
              id: data.id,
              title: data.title || 'Untitled',
              contentType: data.content_type || 'Content',
              collection: data.collection || undefined,
              content: data.full_content || '',
              wordCount: data.word_count || 0,
              charCount: data.full_content?.length || 0,
            };

            setSelectedMaster(masterContent);
            selectedViaNavigationRef.current = true;

            // Update URL if it doesn't have ?id
            if (selectionSource !== 'url') {
              navigate(`/multiply?id=${selectedId}`, { replace: true });
            }

            toast({
              title: "Content loaded",
              description: `Loaded master: ${masterContent.title} (${masterContent.charCount} chars)`,
            });
          }
        } catch (e) {
          console.error('[Multiply] Error loading specific content:', e);
        }
      }

      // Always load the list for dropdown
      setLoadingContent(true);
      try {
        const { data, error } = await supabase
          .from('master_content')
          .select('id, title, content_type, full_content, word_count, collection')
          .eq('organization_id', currentOrganizationId)
          .eq('is_archived', false)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map(item => ({
            id: item.id,
            title: item.title || 'Untitled',
            contentType: item.content_type || 'Content',
            collection: item.collection || undefined,
            content: item.full_content || '',
            wordCount: item.word_count || 0,
            charCount: item.full_content?.length || 0,
          }));

          setMasterContentList(formatted);

          // Only auto-select from database if we didn't arrive via navigation
          if (!selectedMaster && !selectedViaNavigationRef.current) {
            setSelectedMaster(formatted[0]);
          }
        }
      } catch (e) {
        console.error('[Multiply] Error loading master content list:', e);
      } finally {
        setLoadingContent(false);
      }
    };

    loadMasterContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganizationId, searchParams]);

  // Clear derivatives when selectedMaster changes
  useEffect(() => {
    setDerivatives([]);
  }, [selectedMaster?.id]);


  const toggleTypeSelection = (typeId: string) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(typeId)) {
      newSet.delete(typeId);
    } else {
      newSet.add(typeId);
    }
    setSelectedTypes(newSet);
  };


  const selectAll = () => {
    setSelectedTypes(new Set(DERIVATIVE_TYPES.map(t => t.id)));
  };

  const generateDerivatives = async () => {
    if (selectedTypes.size === 0) {
      toast({
        title: "No derivatives selected",
        description: "Please select at least one derivative type",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMaster || !selectedMaster.content) {
      toast({
        title: "No content selected",
        description: "Please create or select master content first",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMaster.id) {
      toast({
        title: "Error",
        description: "Master content must be saved before generating derivatives",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Re-fetch latest content to ensure we have the most up-to-date version
      const { data: latestContent, error: fetchError } = await supabase
        .from('master_content')
        .select('id, title, content_type, full_content, word_count, collection')
        .eq('id', selectedMaster.id)
        .single();

      if (fetchError) {
        console.error('[Multiply] Error fetching latest content:', fetchError);
        throw new Error('Failed to fetch latest content');
      }

      const contentId = selectedMaster.id;
      const masterContentToUse = latestContent.full_content || selectedMaster.content;

      console.log('[Multiply] Invoking repurpose-content edge function:', {
        masterContentId: contentId,
        derivativeTypes: Array.from(selectedTypes),
        contentLength: masterContentToUse?.length || 0,
        hasCollection: !!selectedMaster.collection
      });

      const { data, error } = await supabase.functions.invoke('repurpose-content', {
        body: {
          masterContentId: contentId,
          derivativeTypes: Array.from(selectedTypes),
          masterContent: {
            full_content: masterContentToUse,
            collection: selectedMaster.collection,
          }
        }
      });

      console.log('[Multiply] Edge function response:', {
        hasError: !!error,
        hasData: !!data,
        errorMessage: error?.message,
        errorContext: error?.context,
        dataSuccess: data?.success,
        derivativesCount: data?.derivatives?.length
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate derivatives');

      const newDerivatives: DerivativeContent[] = [];
      const newExpandedTypes = new Set<string>();

      data.derivatives.forEach((derivative: RawDerivativeResponse) => {
        const typeId = derivative.asset_type || '';
        const isSequenceType = typeId.includes('email_') && (typeId.includes('3part') || typeId.includes('5part') || typeId.includes('7part'));
        const sequenceEmails = isSequenceType ? buildSequenceEmailsFromDerivative(derivative) : [];

        // Defensive check: verify master_content_id matches
        if (derivative.master_content_id && derivative.master_content_id !== selectedMaster.id) {
          console.error('[Multiply] Derivative master_content_id mismatch!', {
            derivativeId: derivative.id,
            derivativeMasterId: derivative.master_content_id,
            selectedMasterId: selectedMaster.id
          });
        }

        newDerivatives.push({
          id: derivative.id,
          typeId,
          content: derivative.generated_content,
          status: (derivative.approval_status || 'pending') as "pending" | "approved" | "rejected",
          charCount: derivative.generated_content.length,
          isSequence: isSequenceType && sequenceEmails.length > 0,
          sequenceEmails: sequenceEmails.length > 0 ? sequenceEmails : undefined,
          platformSpecs: derivative.platform_specs,
          asset_type: derivative.asset_type,
          generated_content: derivative.generated_content,
          master_content_id: derivative.master_content_id,
        });

        newExpandedTypes.add(typeId);
      });

      setDerivatives((prev) => [...prev, ...newDerivatives]);
      setExpandedTypes(newExpandedTypes);
      setSelectedTypes(new Set());

      toast({
        title: "Derivatives Generated",
        description: `Successfully generated ${newDerivatives.length} derivative${newDerivatives.length !== 1 ? 's' : ''}`,
      });
    } catch (error: unknown) {
      console.error('Error generating derivatives:', error);

      // Enhanced error handling - extract detailed error message
      let errorMessage = "Failed to generate derivatives. Please try again.";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (err.message) errorMessage = err.message;

      // Try to parse structured error from edge function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorContext = (error as any).context;
      if (errorContext?.body) {
        try {
          const parsed = typeof errorContext.body === 'string'
            ? JSON.parse(errorContext.body)
            : errorContext.body;
          if (parsed.error) {
            errorMessage = parsed.error;
          } else if (parsed.message) {
            errorMessage = parsed.message;
          }
        } catch (e) {
          console.error('Error parsing backend error:', e);
        }
      }

      // Handle specific error types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errMessage = (error as any).message || '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errStatus = (error as any).context?.status;

      if (errMessage.includes('Failed to send a request') || errMessage.includes('NetworkError')) {
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (errMessage.includes('GEMINI_API_KEY') || errorMessage.includes('GEMINI_API_KEY')) {
        errorMessage = "AI service is not properly configured (missing Gemini API key). Please contact support.";
      } else if (errMessage.includes('429') || errStatus === 429) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (errMessage.includes('402') || errStatus === 402) {
        errorMessage = "Payment required. Please add AI credits to your workspace.";
      } else if (errMessage.includes('401') || errStatus === 401) {
        errorMessage = "Authentication failed. Please sign out and sign back in.";
      } else if (errMessage.includes('404') || errStatus === 404) {
        errorMessage = "Content not found. Please refresh the page and try again.";
      }

      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleExpanded = (typeId: string) => {
    const newSet = new Set(expandedTypes);
    if (newSet.has(typeId)) {
      newSet.delete(typeId);
    } else {
      newSet.add(typeId);
    }
    setExpandedTypes(newSet);
  };

  const handleOpenModal = (derivative: DerivativeContent) => {
    setSelectedDerivativeForModal(derivative);
    setModalOpen(true);
  };

  const handleSaveEdit = async (newContent: string) => {
    if (!selectedDerivativeForModal) return;

    try {
      // Update database
      const { error } = await supabase
        .from('derivative_assets')
        .update({ generated_content: newContent })
        .eq('id', selectedDerivativeForModal.id);

      if (error) throw error;

      // Update local state
      setDerivatives(prev =>
        prev.map(d =>
          d.id === selectedDerivativeForModal.id
            ? { ...d, content: newContent, generated_content: newContent, charCount: newContent.length }
            : d
        )
      );

      // Update modal state
      setSelectedDerivativeForModal(prev =>
        prev ? { ...prev, content: newContent, generated_content: newContent } : null
      );

      toast({
        title: "Changes saved",
        description: "Your edits have been saved to the database.",
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error saving changes",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveDerivative = async () => {
    if (!selectedDerivativeForModal) return;

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ approval_status: 'approved' })
        .eq('id', selectedDerivativeForModal.id);

      if (error) throw error;

      setDerivatives(prev =>
        prev.map(d =>
          d.id === selectedDerivativeForModal.id
            ? { ...d, status: 'approved' }
            : d
        )
      );

      setSelectedDerivativeForModal(prev =>
        prev ? { ...prev, status: 'approved' } : null
      );

      toast({
        title: "Derivative approved",
        description: "The derivative has been marked as approved.",
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error approving derivative",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectDerivative = async () => {
    if (!selectedDerivativeForModal) return;

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ approval_status: 'rejected' })
        .eq('id', selectedDerivativeForModal.id);

      if (error) throw error;

      setDerivatives(prev =>
        prev.map(d =>
          d.id === selectedDerivativeForModal.id
            ? { ...d, status: 'rejected' }
            : d
        )
      );

      setSelectedDerivativeForModal(prev =>
        prev ? { ...prev, status: 'rejected' } : null
      );

      toast({
        title: "Derivative rejected",
        description: "The derivative has been marked as rejected.",
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error rejecting derivative",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleScheduleDerivative = () => {
    // Schedule functionality handled by ScheduleButton component
  };

  const handleArchiveDerivative = async () => {
    if (!selectedDerivativeForModal) return;

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ is_archived: true })
        .eq('id', selectedDerivativeForModal.id);

      if (error) throw error;

      setDerivatives(prev =>
        prev.filter(d => d.id !== selectedDerivativeForModal.id)
      );

      setModalOpen(false);
      setSelectedDerivativeForModal(null);

      toast({
        title: "Derivative archived",
        description: "The derivative has been archived.",
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error archiving derivative",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDerivative = async () => {
    if (!selectedDerivativeForModal) return;

    if (!confirm('Are you sure you want to delete this derivative? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .delete()
        .eq('id', selectedDerivativeForModal.id);

      if (error) throw error;

      setDerivatives(prev =>
        prev.filter(d => d.id !== selectedDerivativeForModal.id)
      );

      setModalOpen(false);
      setSelectedDerivativeForModal(null);

      toast({
        title: "Derivative deleted",
        description: "The derivative has been permanently deleted.",
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error deleting derivative",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const openDirector = (derivative: DerivativeContent) => {
    setSelectedDerivativeForDirector(derivative);
    setSplitScreenMode(true);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Content copied successfully",
    });
  };

  const handleSaveToLibrary = () => {
    setSaveTitle(selectedMaster!.title);
    setSaveDialogOpen(true);
  };

  const saveToLibrary = async () => {
    if (!selectedMaster || saveInFlightRef.current) return;

    saveInFlightRef.current = true;
    setIsSavingMaster(true);

    try {
      const { error } = await supabase
        .from('master_content')
        .update({ title: saveTitle })
        .eq('id', selectedMaster.id);

      if (error) throw error;

      toast({
        title: "Saved to library",
        description: "Master content has been updated",
      });

      setSaveDialogOpen(false);
      setSelectedMaster({ ...selectedMaster, title: saveTitle });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSavingMaster(false);
      saveInFlightRef.current = false;
    }
  };

  const saveDerivativeToDatabase = async () => {
    if (!derivativeToSave || saveInFlightRef.current) return;

    saveInFlightRef.current = true;
    setIsSavingDerivative(true);

    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({
          platform_specs: {
            ...derivativeToSave.platformSpecs,
            title: derivativeSaveTitle
          }
        })
        .eq('id', derivativeToSave.id);

      if (error) throw error;

      toast({
        title: "Derivative saved",
        description: "Derivative has been updated",
      });

      setDerivativeSaveDialogOpen(false);
      setDerivativeToSave(null);
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSavingDerivative(false);
      saveInFlightRef.current = false;
    }
  };

  // Filter derivatives by selected master content ID
  const filteredDerivatives = derivatives.filter(d => {
    // Since derivatives might not have master_content_id stored, we'll show all for now
    // In production, you'd filter by: d.master_content_id === selectedMaster?.id
    return true;
  });

  const derivativesByType = filteredDerivatives.reduce((acc, d) => {
    if (!acc[d.typeId]) acc[d.typeId] = [];
    acc[d.typeId].push(d);
    return acc;
  }, {} as Record<string, DerivativeContent[]>);

  if (splitScreenMode && selectedDerivativeForDirector) {
    return (
      <EditorialDirectorSplitScreen
        derivative={selectedDerivativeForDirector}
        derivatives={derivatives}
        onClose={() => {
          setSplitScreenMode(false);
          setSelectedDerivativeForDirector(null);
        }}
        onUpdateDerivative={(updated) => {
          setDerivatives(derivatives.map(d =>
            d.id === updated.id ? updated : d
          ));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          {selectedMaster && selectedViaNavigationRef.current && (
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/editor', {
                    state: {
                      contentId: selectedMaster.id,
                      content: selectedMaster.content,
                      contentName: selectedMaster.title,
                      contentType: selectedMaster.contentType,
                      collection: selectedMaster.collection
                    }
                  });
                }}
                className="text-aged-brass hover:text-aged-brass/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              <span className="text-sm text-muted-foreground">
                Editing: {selectedMaster.title}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-4xl">Multiply</h1>
            <VideoHelpTrigger videoId="what-is-multiply" variant="icon" />
          </div>
          <p className="text-muted-foreground">Transform master content into multiple formats</p>
        </div>

        {/* Master Content Selector - Full Width */}
        <MasterContentSelector
          loadingContent={loadingContent}
          selectedMaster={selectedMaster}
          masterContentList={masterContentList}
          onSelectMaster={setSelectedMaster}
        />

        {/* Two-Column Resizable Layout */}
        <div className="hidden md:block">
          <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
            {/* Left Panel - Master Content */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <MasterContentPanel
                selectedMaster={selectedMaster}
                isSavingMaster={isSavingMaster}
                onSaveToLibrary={handleSaveToLibrary}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Derivative Selection & Results */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-2xl">Derivative Editions</h2>
                    <VideoHelpTrigger videoId="understanding-derivatives" variant="icon" />
                  </div>

                  {/* Generated Derivatives - Show Above Selector */}
                  <DerivativeResults
                    derivativesByType={derivativesByType}
                    derivativeTypes={DERIVATIVE_TYPES}
                    expandedTypes={expandedTypes}
                    onToggleExpanded={toggleExpanded}
                    onOpenModal={handleOpenModal}
                    onCopyToClipboard={copyToClipboard}
                    onOpenDirector={openDirector}
                    selectedMaster={selectedMaster}
                    onSaveDerivative={(deriv, title) => {
                      setDerivativeToSave(deriv);
                      setDerivativeSaveTitle(title);
                      setDerivativeSaveDialogOpen(true);
                    }}
                  />

                  {/* Derivative Type Selector - Below Generated Results */}
                  <div className="space-y-4">
                    <Separator />

                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-xl">
                        {Object.keys(derivativesByType).length > 0 ? "Generate More Derivatives" : "Select Derivative Types"}
                      </h3>
                      <VideoHelpTrigger videoId="understanding-derivatives" variant="icon" />
                    </div>

                    {Object.keys(derivativesByType).length === 0 && (
                      <div className="text-center py-8">
                        <img src={fannedPagesImage} alt="No derivatives" className="w-20 h-20 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium text-lg mb-2">No Derivatives Yet</h3>
                        <p className="text-sm text-muted-foreground">Generate channel-specific versions of your master content</p>
                      </div>
                    )}

                    <DerivativeTypeSelector
                      topTypes={TOP_DERIVATIVE_TYPES}
                      additionalTypes={ADDITIONAL_DERIVATIVE_TYPES}
                      selectedTypes={selectedTypes}
                      onToggleType={toggleTypeSelection}
                      onSelectAll={selectAll}
                      onGenerate={generateDerivatives}
                      isGenerating={isGenerating}
                      showMoreOptions={showMoreOptions}
                      onToggleMoreOptions={setShowMoreOptions}
                    />
                  </div>
                </div>
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile/Tablet Vertical Layout */}
        <div className="md:hidden space-y-6">
          {/* Master Content */}
          {selectedMaster && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl">Master Content</h2>
                <Button onClick={handleSaveToLibrary} disabled={isSavingMaster} size="sm" variant="outline">
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">{selectedMaster.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedMaster.contentType && <Badge variant="secondary">{selectedMaster.contentType}</Badge>}
                  {selectedMaster.collection && <Badge variant="outline">{selectedMaster.collection}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{selectedMaster.wordCount} words · {selectedMaster.charCount} characters</p>
                <p className="text-sm line-clamp-6">{selectedMaster.content}</p>
              </div>
            </Card>
          )}

          {/* Derivative Selector & Results - Mobile */}
          <Card className="p-4 space-y-4">
            <h2 className="font-serif text-xl">Derivative Editions</h2>

            <div className="space-y-3">
              <p className="text-sm font-medium">MOST POPULAR</p>
              <div className="grid grid-cols-1 gap-3">
                {TOP_DERIVATIVE_TYPES.map((type) => (
                  <Card
                    key={type.id}
                    onClick={() => toggleTypeSelection(type.id)}
                    className={`p-3 cursor-pointer ${selectedTypes.has(type.id) ? "ring-2 ring-brass" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedTypes.has(type.id)} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{type.name}</h4>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                {showMoreOptions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                MORE OPTIONS
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="grid grid-cols-1 gap-3">
                  {ADDITIONAL_DERIVATIVE_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      onClick={() => toggleTypeSelection(type.id)}
                      className={`p-3 cursor-pointer ${selectedTypes.has(type.id) ? "ring-2 ring-brass" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selectedTypes.has(type.id)} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{type.name}</h4>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="w-full">Select All</Button>
              <Button
                onClick={generateDerivatives}
                disabled={isGenerating || selectedTypes.size === 0}
                className="gap-2 w-full"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {isGenerating ? "Generating..." : `Generate ${selectedTypes.size} Derivative${selectedTypes.size !== 1 ? "s" : ""}`}
              </Button>
            </div>

            {/* Mobile Results */}
            {Object.keys(derivativesByType).length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium">Generated Derivatives</h3>
                {Object.entries(derivativesByType).map(([typeId, derivs]) => {
                  const type = DERIVATIVE_TYPES.find(t => t.id === typeId);
                  if (!type) return null;
                  const isExpanded = expandedTypes.has(typeId);
                  return (
                    <div key={typeId} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpanded(typeId)}
                        className="w-full p-3 flex items-center justify-between hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          {type.icon && (
                            <type.icon className="w-5 h-5" style={{ color: type.iconColor }} strokeWidth={1} />
                          )}
                          <div className="text-left">
                            <p className="font-medium text-sm">{type.name}</p>
                            <p className="text-xs text-muted-foreground">{derivs.length} generated</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {isExpanded && (
                        <div className="p-3 space-y-2 bg-muted/20">
                          {derivs.map((deriv) => (
                            <Card key={deriv.id} className="p-3">
                              <div className="flex justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">{deriv.status}</Badge>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenModal(deriv)}
                                  >
                                    <FileText className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(deriv.content)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => openDirector(deriv)}>
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs line-clamp-3">{deriv.content}</p>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Save Master Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Library</DialogTitle>
            <DialogDescription>Update the title for this master content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={saveTitle} onChange={(e) => setSaveTitle(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveToLibrary} disabled={isSavingMaster}>
                {isSavingMaster ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Derivative Dialog */}
      <Dialog open={derivativeSaveDialogOpen} onOpenChange={setDerivativeSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Derivative</DialogTitle>
            <DialogDescription>Update the title for this derivative</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={derivativeSaveTitle} onChange={(e) => setDerivativeSaveTitle(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDerivativeSaveDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveDerivativeToDatabase} disabled={isSavingDerivative}>
                {isSavingDerivative ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Derivative Detail Modal */}
      <DerivativeFullModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        derivative={selectedDerivativeForModal ? {
          id: selectedDerivativeForModal.id,
          asset_type: selectedDerivativeForModal.asset_type || selectedDerivativeForModal.typeId,
          generated_content: selectedDerivativeForModal.generated_content || selectedDerivativeForModal.content,
          approval_status: selectedDerivativeForModal.status,
          platform_specs: selectedDerivativeForModal.platformSpecs,
        } : null}
        label={selectedDerivativeForModal ?
          DERIVATIVE_TYPES.find(t => t.id === selectedDerivativeForModal.typeId)?.name || ''
          : ''}
        onApprove={handleApproveDerivative}
        onReject={handleRejectDerivative}
        onEdit={handleSaveEdit}
        onCopy={() => selectedDerivativeForModal && copyToClipboard(selectedDerivativeForModal.content)}
        onSchedule={handleScheduleDerivative}
        onApproveAndSchedule={handleScheduleDerivative}
        onArchive={handleArchiveDerivative}
        onDelete={handleDeleteDerivative}
      />
    </div>
  );
}
