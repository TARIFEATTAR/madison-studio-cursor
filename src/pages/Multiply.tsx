import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, Archive, Mail, MessageSquare, Tag,
  FileText, CheckCircle2, XCircle, ChevronDown, ChevronRight, Copy, 
  Calendar, Edit, Loader2, AlertCircle, Video, Bookmark 
} from "lucide-react";
import { EditorialDirectorSplitScreen } from "@/components/multiply/EditorialDirectorSplitScreen";
import { SavePromptDialog } from "@/components/prompt-library/SavePromptDialog";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import fannedPagesImage from "@/assets/fanned-pages-new.png";
import ticketIcon from "@/assets/ticket-icon.png";
import envelopeIcon from "@/assets/envelope-icon.png";
import instagramIcon from "@/assets/instagram-icon-clean.png";

// Derivative type definitions
interface DerivativeType {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  charLimit?: number;
  isSequence?: boolean;
  iconImage?: string; // For custom image icons
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

// Top 3 most common derivatives (shown first for easier decision making)
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

// Additional derivatives (shown below with separation)
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

// Combined array for processing
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

  // Load master content from database
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
          
          // Auto-select the most recent if none selected
          if (!selectedMaster && !location.state?.contentId) {
            setSelectedMaster(formatted[0]);
          }
        }
      } catch (e) {
        console.error('Error loading master content:', e);
        toast({
          title: "Error loading content",
          description: "Failed to load your master content",
          variant: "destructive"
        });
      } finally {
        setLoadingContent(false);
      }
    };

    loadMasterContent();
  }, [currentOrganizationId]);

  // Check for content from navigation state (from ContentEditor)
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
      
      // Clear navigation state
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
      // Use selectedMaster.id as the content ID
      const contentId = selectedMaster.id;
      
      console.log('Calling repurpose-content with:', {
        masterContentId: contentId,
        derivativeTypes: Array.from(selectedTypes),
        organizationId: currentOrganizationId
      });

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

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate derivatives');
      }

      console.log('Successfully generated derivatives:', data.derivatives);

      // Parse and display derivatives
      const newDerivatives: DerivativeContent[] = [];
      const newExpandedTypes = new Set<string>();

      data.derivatives.forEach((derivative: any) => {
        const typeId = derivative.asset_type;
        const isSequence = typeId.includes('email_') && (typeId.includes('3part') || typeId.includes('5part') || typeId.includes('7part'));
        
        if (isSequence && derivative.platform_specs?.emails) {
          // Email sequence derivative
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
          });
        } else {
          // Regular derivative
          newDerivatives.push({
            id: derivative.id,
            typeId,
            content: derivative.generated_content,
            status: derivative.approval_status,
            charCount: derivative.generated_content.length,
          });
        }

        newExpandedTypes.add(typeId);
      });

      setDerivatives([...derivatives, ...newDerivatives]);
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

  const updateDerivativeStatus = (id: string, status: "approved" | "rejected") => {
    setDerivatives(derivatives.map(d => 
      d.id === id ? { ...d, status } : d
    ));
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Content copied successfully",
    });
  };

  const handleSaveToLibrary = () => {
    setSaveTitle(selectedMaster.title);
    setSaveDialogOpen(true);
  };

  const saveToLibrary = () => {
    const library = JSON.parse(localStorage.getItem('scriptora-library') || '[]');
    library.unshift({
      id: Date.now().toString(),
      title: saveTitle,
      content: selectedMaster.content,
      contentTypeId: selectedMaster.contentType,
      collectionId: selectedMaster.collection,
      wordCount: selectedMaster.wordCount,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('scriptora-library', JSON.stringify(library));
    
    toast({
      title: "Content saved to The Archives!",
      description: "Your master content has been saved successfully",
    });
    
    setSaveDialogOpen(false);
  };

  // Group derivatives by type
  const derivativesByType = derivatives.reduce((acc, derivative) => {
    if (!acc[derivative.typeId]) {
      acc[derivative.typeId] = [];
    }
    acc[derivative.typeId].push(derivative);
    return acc;
  }, {} as Record<string, DerivativeContent[]>);

  const getTypeInfo = (typeId: string) => {
    return DERIVATIVE_TYPES.find(t => t.id === typeId);
  };

  if (splitScreenMode && selectedDerivativeForDirector) {
    return (
      <EditorialDirectorSplitScreen
        derivative={selectedDerivativeForDirector}
        derivatives={derivatives}
        onClose={() => setSplitScreenMode(false)}
        onUpdateDerivative={(updated) => {
          setDerivatives(derivatives.map(d => 
            d.id === updated.id ? updated : d
          ));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold leading-tight mb-1" style={{ color: "#1A1816" }}>
            Repurpose Content
          </h1>
          <p className="text-lg leading-tight" style={{ color: "#6B6560" }}>
            Transform master content into channel-specific derivatives
          </p>
        </div>

        {/* User Content Alert */}
        {userContent && (
          <Alert className="mb-6" style={{ backgroundColor: "rgba(184, 149, 106, 0.1)", borderColor: "#B8956A" }}>
            <Sparkles className="h-5 w-5" style={{ color: "#B8956A" }} />
            <AlertDescription>
              <div className="font-medium" style={{ color: "#1A1816" }}>
                Using your recently created content
              </div>
              <div className="text-sm" style={{ color: "#6B6560" }}>
                Saved from the editor
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Master Content Selector */}
        {!loadingContent && masterContentList.length > 0 && (
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2" style={{ color: "#1A1816" }}>
              Select Master Content:
            </Label>
            <Select 
              value={selectedMaster?.id || masterContentList[0].id} 
              onValueChange={(value) => {
                const selected = masterContentList.find(m => m.id === value);
                if (selected) setSelectedMaster(selected);
              }}
            >
              <SelectTrigger className="w-full max-w-lg" style={{ backgroundColor: "#FFFCF5" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {masterContentList.map(content => (
                  <SelectItem key={content.id} value={content.id}>{content.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {loadingContent && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#B8956A" }} />
          </div>
        )}

        {!loadingContent && masterContentList.length === 0 && !selectedMaster && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No master content found. Please create content in the Forge first.
              <Link to="/forge" className="ml-2 underline">Go to Forge</Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Area */}
        {selectedMaster ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Master Content Panel (2/5) */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-serif font-bold mb-4" style={{ color: "#1A1816" }}>
              Master Content
            </h2>
            <Card className="sticky top-6 border" style={{ backgroundColor: "#FFFCF5", borderColor: "#D4CFC8" }}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge 
                      variant="secondary" 
                      className="mb-2"
                      style={{ backgroundColor: "rgba(184, 149, 106, 0.1)", color: "#B8956A" }}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {selectedMaster.contentType}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {/* Removed confusing "Template" button - master content is finished, not a prompt template */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveToLibrary}
                      style={{ borderColor: "#D4CFC8", color: "#6B6560" }}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-serif font-semibold mb-2" style={{ color: "#1A1816" }}>
                    {selectedMaster.title}
                  </h3>
                  {selectedMaster.collection && (
                    <Badge 
                      variant="outline" 
                      className="mb-3"
                      style={{ borderColor: "#D4CFC8", color: "#6B6560" }}
                    >
                      {selectedMaster.collection}
                    </Badge>
                  )}
                  <div 
                    className="max-h-96 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "#6B6560" }}
                  >
                    {selectedMaster.content}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Stats */}
                <div className="flex gap-4 text-xs" style={{ color: "#A8A39E" }}>
                  <span>{selectedMaster.wordCount} words</span>
                  <span>{selectedMaster.charCount} characters</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Derivatives Panel (3/5) */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-serif font-bold mb-4" style={{ color: "#1A1816" }}>
              Derivative Editions
            </h2>

            {/* Empty State or Generated Derivatives */}
            {Object.keys(derivativesByType).length === 0 ? (
              <Card className="mb-6 border" style={{ backgroundColor: "#FFFCF5", borderColor: "#D4CFC8" }}>
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    <img 
                      src={fannedPagesImage} 
                      alt="Fanned pages illustration" 
                      className="w-40 h-40 object-contain opacity-80"
                    />
                  </div>
                  <h3 className="text-lg font-serif font-semibold mb-2" style={{ color: "#1A1816" }}>
                    No Derivatives Yet
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
                    Generate channel-specific versions of your master content
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3 mb-6">
                {Object.entries(derivativesByType).map(([typeId, typeDerivatives]) => {
                  const typeInfo = getTypeInfo(typeId);
                  if (!typeInfo) return null;
                  const isExpanded = expandedTypes.has(typeId);
                  const Icon = typeInfo.icon;

                  return (
                    <Card key={typeId} className="border" style={{ backgroundColor: "#FFFCF5", borderColor: "#D4CFC8" }}>
                      <button
                        onClick={() => toggleExpanded(typeId)}
                        className="w-full p-4 flex items-center justify-between hover:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" style={{ color: "#6B6560" }} />
                          ) : (
                            <ChevronRight className="w-5 h-5" style={{ color: "#6B6560" }} />
                          )}
                          <Badge 
                            variant="secondary" 
                            className="gap-2"
                            style={{ backgroundColor: `${typeInfo.iconColor}15`, color: typeInfo.iconColor }}
                          >
                            {typeInfo.iconImage ? (
                              <img src={typeInfo.iconImage} alt="" className="w-6 h-6 object-contain" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                            {typeInfo.name}
                          </Badge>
                          <span className="text-sm" style={{ color: "#A8A39E" }}>
                            {typeDerivatives.length} version{typeDerivatives.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          {typeDerivatives.map((derivative) => (
                            <div 
                              key={derivative.id} 
                              className="p-4 rounded-lg border"
                              style={{ backgroundColor: "#F5F1E8", borderColor: "#D4CFC8" }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <Badge
                                  variant={
                                    derivative.status === "approved" ? "default" :
                                    derivative.status === "rejected" ? "destructive" :
                                    "secondary"
                                  }
                                  className="gap-1"
                                >
                                  {derivative.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                                  {derivative.status === "rejected" && <XCircle className="w-3 h-3" />}
                                  {derivative.status === "pending" && <AlertCircle className="w-3 h-3" />}
                                  {derivative.status.charAt(0).toUpperCase() + derivative.status.slice(1)}
                                </Badge>
                                <span 
                                  className="text-xs"
                                  style={{ 
                                    color: typeInfo.charLimit && derivative.charCount > typeInfo.charLimit ? "#DC2626" : "#A8A39E" 
                                  }}
                                >
                                  {derivative.charCount}
                                  {typeInfo.charLimit && `/${typeInfo.charLimit}`} chars
                                </span>
                              </div>

                              {derivative.isSequence && derivative.sequenceEmails && derivative.sequenceEmails.length > 0 ? (
                                <div className="space-y-2 mb-4">
                                  {derivative.sequenceEmails.slice(0, 3).map((email) => (
                                    <div
                                      key={email.id}
                                      className="p-3 rounded-md border"
                                      style={{ borderColor: "#D4CFC8", backgroundColor: "#FFFCF5" }}
                                    >
                                      <div className="text-sm font-medium mb-1" style={{ color: "#1A1816" }}>
                                        Email {email.sequenceNumber}{email.subject ? ` — ${email.subject}` : ""}
                                      </div>
                                      <div className="text-sm text-muted-foreground line-clamp-3" style={{ color: "#6B6560" }}>
                                        {email.content || email.preview || "No content available"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm mb-4 whitespace-pre-wrap" style={{ color: "#6B6560" }}>
                                  {derivative.content || "No content available"}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => openDirector(derivative)}
                                  style={{ backgroundColor: "#1A1816", color: "#FFFCF5" }}
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Director
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(derivative.content)}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy
                                </Button>
                                {derivative.status === "pending" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateDerivativeStatus(derivative.id, "approved")}
                                      style={{ borderColor: "#3A4A3D", color: "#3A4A3D" }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateDerivativeStatus(derivative.id, "rejected")}
                                      style={{ borderColor: "#6B2C3E", color: "#6B2C3E" }}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {derivative.status === "approved" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <Link to="/schedule">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      Schedule
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Derivative Type Selector */}
            <Card className="mb-6 border" style={{ backgroundColor: "#FFFCF5", borderColor: "#D4CFC8" }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold mb-1" style={{ color: "#1A1816" }}>
                      {Object.keys(derivativesByType).length > 0 ? 'Generate More Derivatives' : 'Select derivative types to generate:'}
                    </h3>
                    <p className="text-sm" style={{ color: "#6B6560" }}>
                      Most common options shown first
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      style={{ color: "#6B6560" }}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAll}
                      style={{ color: "#6B6560" }}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                {/* Top 3 Most Common */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1" style={{ backgroundColor: "#D4CFC8" }} />
                    <span className="text-xs font-medium px-3" style={{ color: "#A8A39E" }}>
                      START HERE - MOST COMMON USE CASES
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#D4CFC8" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {TOP_DERIVATIVE_TYPES.map((type) => {
                      const isSelected = selectedTypes.has(type.id);
                      const Icon = type.icon;

                      return (
                        <button
                          key={type.id}
                          onClick={() => toggleTypeSelection(type.id)}
                          className="p-4 rounded-lg border-2 transition-all text-left hover:shadow-md"
                          style={{
                            backgroundColor: isSelected ? "#FFFCF5" : "#F5F1E8",
                            borderColor: isSelected ? "#B8956A" : "#D4CFC8",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox checked={isSelected} className="mt-1" />
                          <div className="flex-1 min-w-0">
                            {type.iconImage ? (
                              <div className="w-12 h-12 flex items-center justify-center mb-3">
                                <img src={type.iconImage} alt="" className="w-10 h-10 object-contain" />
                              </div>
                            ) : Icon ? (
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                style={{ backgroundColor: `${type.iconColor}15` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: type.iconColor }} />
                              </div>
                            ) : null}
                            <h4 className="font-semibold mb-1" style={{ color: "#1A1816" }}>
                              {type.name}
                            </h4>
                            <p className="text-xs mb-2" style={{ color: "#6B6560" }}>
                              {type.description}
                            </p>
                            {type.charLimit && (
                              <p className="text-xs" style={{ color: "#A8A39E" }}>
                                Max: {type.charLimit} chars
                              </p>
                            )}
                          </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Options */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1" style={{ backgroundColor: "#D4CFC8" }} />
                    <span className="text-xs font-medium px-3" style={{ color: "#A8A39E" }}>
                      SPECIALIZED FORMATS
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#D4CFC8" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
                    {ADDITIONAL_DERIVATIVE_TYPES.map((type) => {
                    const isSelected = selectedTypes.has(type.id);
                    const Icon = type.icon;

                    return (
                      <button
                        key={type.id}
                        onClick={() => toggleTypeSelection(type.id)}
                        className="p-4 rounded-lg border-2 transition-all text-left hover:shadow-md"
                        style={{
                          backgroundColor: isSelected ? "#FFFCF5" : "#F5F1E8",
                          borderColor: isSelected ? "#B8956A" : "#D4CFC8",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected} className="mt-1" />
                          <div className="flex-1 min-w-0">
                            {type.iconImage ? (
                              <div className="w-12 h-12 flex items-center justify-center mb-3">
                                <img src={type.iconImage} alt="" className="w-10 h-10 object-contain" />
                              </div>
                            ) : Icon ? (
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                style={{ backgroundColor: `${type.iconColor}15` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: type.iconColor }} />
                              </div>
                            ) : null}
                            <h4 className="font-semibold mb-1" style={{ color: "#1A1816" }}>
                              {type.name}
                            </h4>
                            <p className="text-xs mb-2" style={{ color: "#6B6560" }}>
                              {type.description}
                            </p>
                            {type.charLimit && (
                              <p className="text-xs" style={{ color: "#A8A39E" }}>
                                Max: {type.charLimit} chars
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={generateDerivatives}
                    disabled={selectedTypes.size === 0 || isGenerating}
                    style={{ 
                      backgroundColor: selectedTypes.size > 0 ? "#B8956A" : "#D4CFC8",
                      color: "#FFFCF5"
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate {selectedTypes.size > 0 ? `${selectedTypes.size} ` : ''}Derivative{selectedTypes.size !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
        ) : null}
      </div>

      {/* Save to Library Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent style={{ backgroundColor: "#FFFCF5" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#1A1816" }}>Save to Library</DialogTitle>
            <DialogDescription style={{ color: "#6B6560" }}>
              This will save your content to The Archives
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="content-name" className="mb-2" style={{ color: "#1A1816" }}>
                Content Name
              </Label>
              <Input
                id="content-name"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter content name..."
                style={{ backgroundColor: "#F5F1E8" }}
              />
            </div>

            <div>
              <Label className="mb-2" style={{ color: "#6B6560" }}>Preview</Label>
              <div 
                className="p-3 rounded-lg border text-sm"
                style={{ backgroundColor: "#F5F1E8", borderColor: "#D4CFC8", color: "#6B6560" }}
              >
                {selectedMaster?.content ? selectedMaster.content.split('\n').slice(0, 2).join('\n') + '...' : 'No content'}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              style={{ borderColor: "#D4CFC8", color: "#6B6560" }}
            >
              Cancel
            </Button>
            <Button
              onClick={saveToLibrary}
              style={{ backgroundColor: "#B8956A", color: "#FFFCF5" }}
            >
              <Archive className="w-4 h-4 mr-2" />
              Save to Library
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Prompt Template Dialog */}
      {selectedMaster && (
        <SavePromptDialog
          open={savePromptDialogOpen}
          onOpenChange={setSavePromptDialogOpen}
          promptText={selectedMaster.content}
          suggestedTitle={selectedMaster.title}
        />
      )}
    </div>
  );
}
