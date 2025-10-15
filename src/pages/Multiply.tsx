import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, Archive, Mail, MessageSquare, Tag,
  FileText, CheckCircle2, XCircle, ChevronDown, ChevronRight, Copy, 
  Calendar, Edit, Loader2, AlertCircle, Video, Bookmark 
} from "lucide-react";
import { EditorialDirectorSplitScreen } from "@/components/multiply/EditorialDirectorSplitScreen";
import { SavePromptDialog } from "@/components/prompt-library/SavePromptDialog";
import { ScheduleButton } from "@/components/forge/ScheduleButton";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import fannedPagesImage from "@/assets/fanned-pages-new.png";
import ticketIcon from "@/assets/ticket-icon.png";
import envelopeIcon from "@/assets/envelope-icon.png";
import instagramIcon from "@/assets/instagram-icon-clean.png";

interface DerivativeType {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  charLimit?: number;
  isSequence?: boolean;
  iconImage?: string;
}

interface DerivativeContent {
  id: string;
  typeId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  charCount: number;
  isSequence?: boolean;
  sequenceEmails?: {
    id: string;
    sequenceNumber: number;
    subject: string;
    preview: string;
    content: string;
    charCount: number;
  }[];
  platformSpecs?: any;
  asset_type?: string;
  generated_content?: string;
}

interface MasterContent {
  id: string;
  title: string;
  contentType: string;
  collection?: string;
  content: string;
  wordCount: number;
  charCount: number;
}

const TOP_DERIVATIVE_TYPES: DerivativeType[] = [
  {
    id: "email_3part",
    name: "3-Part Email Series",
    description: "Sequential email nurture campaign",
    icon: Mail,
    iconImage: envelopeIcon,
    iconColor: "#8B7355",
    isSequence: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Instagram posts and captions",
    icon: null,
    iconImage: instagramIcon,
    iconColor: "#E4405F",
    charLimit: 2200,
  },
  {
    id: "product",
    name: "Product Description",
    description: "Product page descriptions",
    icon: Tag,
    iconImage: ticketIcon,
    iconColor: "#3A4A3D",
    charLimit: 500,
  },
];

const ADDITIONAL_DERIVATIVE_TYPES: DerivativeType[] = [
  {
    id: "email",
    name: "Email",
    description: "Newsletter-style email",
    icon: Mail,
    iconColor: "#B8956A",
    charLimit: 2000,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    description: "Pinterest pin descriptions",
    icon: FileText,
    iconColor: "#E60023",
    charLimit: 500,
  },
  {
    id: "sms",
    name: "SMS",
    description: "SMS marketing messages",
    icon: MessageSquare,
    iconColor: "#6B2C3E",
    charLimit: 160,
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "TikTok video scripts",
    icon: Video,
    iconColor: "#000000",
    charLimit: 300,
  },
  {
    id: "email_5part",
    name: "5-Part Email Series",
    description: "Extended email sequence",
    icon: Mail,
    iconColor: "#A0826D",
    isSequence: true,
  },
  {
    id: "email_7part",
    name: "7-Part Email Series",
    description: "Comprehensive email journey",
    icon: Mail,
    iconColor: "#6B5D52",
    isSequence: true,
  },
];

const DERIVATIVE_TYPES = [...TOP_DERIVATIVE_TYPES, ...ADDITIONAL_DERIVATIVE_TYPES];

export default function Multiply() {
  const { toast } = useToast();
  const location = useLocation();
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
  const [userContent, setUserContent] = useState<MasterContent | null>(null);
  const [savePromptDialogOpen, setSavePromptDialogOpen] = useState(false);
  const [masterContentList, setMasterContentList] = useState<MasterContent[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  
  const [derivativeSaveDialogOpen, setDerivativeSaveDialogOpen] = useState(false);
  const [derivativeToSave, setDerivativeToSave] = useState<DerivativeContent | null>(null);
  const [derivativeSaveTitle, setDerivativeSaveTitle] = useState("");

  const [isSavingMaster, setIsSavingMaster] = useState(false);
  const [isSavingDerivative, setIsSavingDerivative] = useState(false);
  const saveInFlightRef = useRef(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    const loadMasterContent = async () => {
      if (!currentOrganizationId) return;
      
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
          
          if (!selectedMaster && !location.state?.contentId) {
            setSelectedMaster(formatted[0]);
          }
        }
      } catch (e) {
        console.error('Error loading master content:', e);
      } finally {
        setLoadingContent(false);
      }
    };

    loadMasterContent();
  }, [currentOrganizationId]);

  useEffect(() => {
    if (location.state?.contentId) {
      const contentData = {
        id: location.state.contentId,
        title: location.state.title || 'Untitled',
        contentType: location.state.contentType || 'Content',
        collection: location.state.collection,
        content: location.state.content || '',
        wordCount: location.state.content ? location.state.content.split(/\s+/).filter(Boolean).length : 0,
        charCount: location.state.content?.length || 0,
      };
      setUserContent(contentData);
      setSelectedMaster(contentData);
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  const deselectAll = () => {
    setSelectedTypes(new Set());
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

    setIsGenerating(true);

    try {
      const contentId = selectedMaster.id;
      
      const { data, error } = await supabase.functions.invoke('repurpose-content', {
        body: {
          masterContentId: contentId,
          derivativeTypes: Array.from(selectedTypes),
          masterContent: {
            full_content: selectedMaster.content,
            collection: selectedMaster.collection,
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate derivatives');

      const newDerivatives: DerivativeContent[] = [];
      const newExpandedTypes = new Set<string>();

      data.derivatives.forEach((derivative: any) => {
        const typeId = derivative.asset_type;
        const isSequence = typeId.includes('email_') && (typeId.includes('3part') || typeId.includes('5part') || typeId.includes('7part'));
        
        if (isSequence && derivative.platform_specs?.emails) {
          const sequenceEmails = derivative.platform_specs.emails.map((email: any, index: number) => ({
            id: `${derivative.id}-email-${index + 1}`,
            sequenceNumber: index + 1,
            subject: email.subject || '',
            preview: email.preview || '',
            content: email.body || '',
            charCount: (email.body || '').length,
          }));

          newDerivatives.push({
            id: derivative.id,
            typeId,
            content: derivative.generated_content,
            status: derivative.approval_status,
            charCount: derivative.generated_content.length,
            isSequence: true,
            sequenceEmails,
            platformSpecs: derivative.platform_specs,
            asset_type: derivative.asset_type,
            generated_content: derivative.generated_content,
          });
        } else {
          newDerivatives.push({
            id: derivative.id,
            typeId,
            content: derivative.generated_content,
            status: derivative.approval_status,
            charCount: derivative.generated_content.length,
            platformSpecs: derivative.platform_specs,
            asset_type: derivative.asset_type,
            generated_content: derivative.generated_content,
          });
        }

        newExpandedTypes.add(typeId);
      });

      setDerivatives((prev) => [...prev, ...newDerivatives]);
      setExpandedTypes(newExpandedTypes);
      setSelectedTypes(new Set());

      toast({
        title: "Derivatives Generated",
        description: `Successfully generated ${newDerivatives.length} derivative${newDerivatives.length !== 1 ? 's' : ''}`,
      });
    } catch (error: any) {
      console.error('Error generating derivatives:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate derivatives. Please try again.",
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
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSavingDerivative(false);
      saveInFlightRef.current = false;
    }
  };

  const derivativesByType = derivatives.reduce((acc, d) => {
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
          <h1 className="font-serif text-4xl mb-2">Multiply</h1>
          <p className="text-muted-foreground">Transform master content into multiple formats</p>
        </div>

        {/* Master Content Selector - Full Width */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium whitespace-nowrap">Master Content:</Label>
            {loadingContent ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Select value={selectedMaster?.id || ""} onValueChange={(id) => {
                const content = masterContentList.find(c => c.id === id);
                if (content) setSelectedMaster(content);
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select master content..." />
                </SelectTrigger>
                <SelectContent>
                  {masterContentList.map((content) => (
                    <SelectItem key={content.id} value={content.id}>
                      {content.title} ({content.wordCount} words)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </Card>

        {/* Two-Column Resizable Layout */}
        <div className="hidden md:block">
          <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
            {/* Left Panel - Master Content */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-2xl">Master Content</h2>
                  {selectedMaster && (
                    <Button onClick={handleSaveToLibrary} disabled={isSavingMaster} size="sm" variant="outline" className="gap-2">
                      <Archive className="w-4 h-4" />
                      {isSavingMaster ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>
                
                {selectedMaster ? (
                  <Card className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 border-b space-y-2">
                      <h3 className="font-semibold text-lg">{selectedMaster.title}</h3>
                      <div className="flex gap-2">
                        {selectedMaster.contentType && (
                          <Badge variant="secondary">{selectedMaster.contentType}</Badge>
                        )}
                        {selectedMaster.collection && (
                          <Badge variant="outline">{selectedMaster.collection}</Badge>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{selectedMaster.wordCount} words</span>
                        <span>{selectedMaster.charCount} characters</span>
                      </div>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-4">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedMaster.content}</p>
                      </div>
                    </ScrollArea>
                  </Card>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select master content from dropdown above</p>
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Derivative Selection & Results */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <h2 className="font-serif text-2xl">Derivative Editions</h2>

                  {/* Empty State or Derivative Selector */}
                  {Object.keys(derivativesByType).length === 0 && (
                    <div className="text-center py-8">
                      <img src={fannedPagesImage} alt="No derivatives" className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium text-lg mb-2">No Derivatives Yet</h3>
                      <p className="text-sm text-muted-foreground">Generate channel-specific versions of your master content</p>
                    </div>
                  )}

                  {/* Derivative Type Selector */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Select derivative types to generate:</h3>
                    
                    {/* Most Popular */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">MOST POPULAR</p>
                      <div className="grid grid-cols-3 gap-3">
                        {TOP_DERIVATIVE_TYPES.map((type) => (
                          <Card 
                            key={type.id} 
                            onClick={() => toggleTypeSelection(type.id)} 
                            className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedTypes.has(type.id) ? "ring-2 ring-brass bg-brass/5" : ""}`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <Checkbox checked={selectedTypes.has(type.id)} className="mt-1" />
                                {type.iconImage ? (
                                  <img src={type.iconImage} alt={type.name} className="w-8 h-8" />
                                ) : type.icon && (
                                  <type.icon className="w-8 h-8" style={{ color: type.iconColor }} />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{type.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">{type.description}</p>
                                {type.charLimit && (
                                  <p className="text-xs text-muted-foreground mt-1">Max: {type.charLimit} chars</p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* More Options - Collapsible */}
                    <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {showMoreOptions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        MORE OPTIONS
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <div className="grid grid-cols-3 gap-3">
                          {ADDITIONAL_DERIVATIVE_TYPES.map((type) => (
                            <Card 
                              key={type.id} 
                              onClick={() => toggleTypeSelection(type.id)} 
                              className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedTypes.has(type.id) ? "ring-2 ring-brass bg-brass/5" : ""}`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <Checkbox checked={selectedTypes.has(type.id)} className="mt-1" />
                                  {type.iconImage ? (
                                    <img src={type.iconImage} alt={type.name} className="w-8 h-8" />
                                  ) : type.icon && (
                                    <type.icon className="w-8 h-8" style={{ color: type.iconColor }} />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{type.name}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{type.description}</p>
                                  {type.charLimit && (
                                    <p className="text-xs text-muted-foreground mt-1">Max: {type.charLimit} chars</p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4">
                      <Button variant="outline" size="sm" onClick={selectAll}>
                        Select All
                      </Button>
                      <Button 
                        onClick={generateDerivatives} 
                        disabled={isGenerating || selectedTypes.size === 0} 
                        size="lg" 
                        className="gap-2"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        {isGenerating ? "Generating..." : `Generate ${selectedTypes.size} Derivative${selectedTypes.size !== 1 ? "s" : ""}`}
                      </Button>
                    </div>
                  </div>

                  {/* Generated Results */}
                  {Object.keys(derivativesByType).length > 0 && (
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="font-serif text-xl">Generated Derivatives</h3>
                      <div className="space-y-4">
                        {Object.entries(derivativesByType).map(([typeId, derivs]) => {
                          const type = DERIVATIVE_TYPES.find(t => t.id === typeId);
                          if (!type) return null;

                          const Icon = type.icon;
                          const isExpanded = expandedTypes.has(typeId);

                          return (
                            <div key={typeId} className="border rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleExpanded(typeId)}
                                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {type.iconImage ? (
                                    <img src={type.iconImage} alt={type.name} className="w-6 h-6" />
                                  ) : Icon ? (
                                    <Icon className="w-6 h-6" style={{ color: type.iconColor }} />
                                  ) : null}
                                  <div className="text-left">
                                    <h3 className="font-medium">{type.name}</h3>
                                    <p className="text-sm text-muted-foreground">{derivs.length} generated</p>
                                  </div>
                                </div>
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </button>

                              {isExpanded && (
                                <div className="p-4 space-y-3 bg-muted/20">
                                  {derivs.map((deriv) => (
                                    <Card key={deriv.id} className="p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <Badge variant={deriv.status === "approved" ? "default" : deriv.status === "rejected" ? "destructive" : "secondary"}>
                                            {deriv.status === "approved" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {deriv.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                            {deriv.status}
                                          </Badge>
                                          <span className="text-sm text-muted-foreground">
                                            {deriv.charCount} chars
                                            {type.charLimit && ` / ${type.charLimit}`}
                                          </span>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(deriv.content)}>
                                            <Copy className="w-4 h-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => openDirector(deriv)}>
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <ScheduleButton
                                            contentTitle={type.name}
                                            contentType={deriv.asset_type || type.id}
                                            variant="ghost"
                                            size="sm"
                                            derivativeAsset={{
                                              id: deriv.id,
                                              master_content_id: selectedMaster?.id || '',
                                              asset_type: deriv.asset_type || type.id,
                                              generated_content: deriv.generated_content || deriv.content,
                                              platform_specs: deriv.platformSpecs || {}
                                            }}
                                            masterContent={selectedMaster ? {
                                              id: selectedMaster.id,
                                              title: selectedMaster.title,
                                              content_type: selectedMaster.contentType
                                            } : undefined}
                                          />
                                          <Button variant="ghost" size="sm" onClick={() => {
                                            setDerivativeToSave(deriv);
                                            setDerivativeSaveTitle(type.name);
                                            setDerivativeSaveDialogOpen(true);
                                          }}>
                                            <Archive className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      {deriv.isSequence && deriv.sequenceEmails ? (
                                        <div className="space-y-2">
                                          {deriv.sequenceEmails.map((email) => (
                                            <div key={email.id} className="p-3 bg-background rounded border">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">Email {email.sequenceNumber}</Badge>
                                                <span className="text-sm font-medium">{email.subject}</span>
                                              </div>
                                              <p className="text-sm text-muted-foreground line-clamp-2">{email.content}</p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm whitespace-pre-wrap line-clamp-4">{deriv.content}</p>
                                      )}
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                          {type.iconImage ? (
                            <img src={type.iconImage} alt={type.name} className="w-5 h-5" />
                          ) : type.icon && (
                            <type.icon className="w-5 h-5" style={{ color: type.iconColor }} />
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
    </div>
  );
}
