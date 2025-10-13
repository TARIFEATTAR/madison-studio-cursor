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
  
  // Derivative save dialog states
  const [derivativeSaveDialogOpen, setDerivativeSaveDialogOpen] = useState(false);
  const [derivativeToSave, setDerivativeToSave] = useState<DerivativeContent | null>(null);
  const [derivativeSaveTitle, setDerivativeSaveTitle] = useState("");

  // Save state guards
  const [isSavingMaster, setIsSavingMaster] = useState(false);
  const [isSavingDerivative, setIsSavingDerivative] = useState(false);
  const saveInFlightRef = useRef(false);

  
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

      setDerivatives((prev) => {
        const enrichedDerivatives = newDerivatives.map(d => {
          // Client-side fallback parser for email sequences
          if ((d.asset_type === 'email_3part' || d.asset_type === 'email_5part' || d.asset_type === 'email_7part') 
              && (!d.platformSpecs?.emails || d.platformSpecs.emails.length === 0)) {
            const emailMatches = d.generated_content?.match(/EMAIL\s+\d+:?\s*[\r\n]+SUBJECT:?\s*(.+?)[\r\n]+PREVIEW:?\s*(.+?)[\r\n]+BODY:?\s*([\s\S]+?)(?=EMAIL\s+\d+:|$)/gi);
            if (emailMatches && emailMatches.length > 0) {
              const emails = emailMatches.map((match: string) => {
                const subjectMatch = match.match(/SUBJECT:?\s*(.+)/i);
                const previewMatch = match.match(/PREVIEW:?\s*(.+)/i);
                const bodyMatch = match.match(/BODY:?\s*([\s\S]+)/i);
                return {
                  id: `${d.id}-email-${emails.length + 1}`,
                  sequenceNumber: emails.length + 1,
                  subject: subjectMatch?.[1]?.trim() || '',
                  preview: previewMatch?.[1]?.trim() || '',
                  content: bodyMatch?.[1]?.trim() || '',
                  charCount: (bodyMatch?.[1]?.trim() || '').length,
                };
              });
              return {
                ...d,
                sequenceEmails: emails,
                platformSpecs: { ...d.platformSpecs, emails, emailCount: emails.length }
              };
            }
          }
          return d;
        });
        return [...prev, ...enrichedDerivatives];
      });
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
    setSaveTitle(selectedMaster!.title);
    setSaveDialogOpen(true);
  };

  const saveToLibrary = async () => {
    if (saveInFlightRef.current || isSavingMaster) {
      return;
    }

    saveInFlightRef.current = true;
    setIsSavingMaster(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save content",
          variant: "destructive"
        });
        saveInFlightRef.current = false;
        setIsSavingMaster(false);
        return;
      }
      
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (!orgMember) {
        toast({
          title: "No organization found",
          description: "Please join or create an organization first",
          variant: "destructive"
        });
        saveInFlightRef.current = false;
        setIsSavingMaster(false);
        return;
      }
      
      const { data: existing } = await supabase
        .from('master_content')
        .select('id')
        .eq('title', saveTitle)
        .eq('organization_id', orgMember.organization_id)
        .maybeSingle();
      
      if (existing) {
        toast({
          title: "Title already exists",
          description: "Please choose a different title",
          variant: "destructive"
        });
        saveInFlightRef.current = false;
        setIsSavingMaster(false);
        return;
      }

      const wordCount = selectedMaster!.content.split(/\s+/).filter(Boolean).length;
      
      const { error } = await supabase
        .from('master_content')
        .insert([{
          title: saveTitle,
          full_content: selectedMaster!.content,
          content_type: selectedMaster!.contentType,
          collection: selectedMaster!.collection as any,
          word_count: wordCount,
          organization_id: orgMember.organization_id,
          created_by: user.id,
          status: 'draft'
        }]);
      
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Title already exists",
            description: "A content with this title already exists",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        saveInFlightRef.current = false;
        setIsSavingMaster(false);
        return;
      }
      
      toast({
        title: "Content saved to The Archives!",
        description: "Your master content has been saved successfully",
      });
      
      setSaveDialogOpen(false);
      localStorage.removeItem('multiply-derivatives-draft');
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        title: "Error saving content",
        description: error.message || "Failed to save content",
        variant: "destructive"
      });
    } finally {
      saveInFlightRef.current = false;
      setIsSavingMaster(false);
    }
  };

  const saveDerivativeToDatabase = async () => {
    if (!derivativeToSave) return;

    if (saveInFlightRef.current || isSavingDerivative) {
      return;
    }

    saveInFlightRef.current = true;
    setIsSavingDerivative(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save derivatives",
          variant: "destructive"
        });
        saveInFlightRef.current = false;
        setIsSavingDerivative(false);
        return;
      }
      
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (!orgMember) {
        toast({
          title: "No organization found",
          description: "Please join or create an organization first",
          variant: "destructive"
        });
        saveInFlightRef.current = false;
        setIsSavingDerivative(false);
        return;
      }

      const platformSpecs = derivativeToSave.sequenceEmails
        ? {
            ...derivativeToSave.platformSpecs,
            emails: derivativeToSave.sequenceEmails,
            emailCount: derivativeToSave.sequenceEmails.length,
            title: derivativeSaveTitle,
          }
        : { ...derivativeToSave.platformSpecs, title: derivativeSaveTitle };

      const insertData: any = {
        asset_type: derivativeToSave.typeId,
        generated_content: derivativeToSave.content,
        platform_specs: platformSpecs,
        approval_status: 'draft',
        created_by: user.id,
        organization_id: orgMember.organization_id,
        master_content_id: selectedMaster?.id || null,
      };

      const { error } = await supabase
        .from('derivative_assets')
        .insert([insertData]);
      
      if (error) {
        console.error('Error saving derivative:', error);
        toast({
          title: "Error saving derivative",
          description: error.message || "Failed to save derivative",
          variant: "destructive"
        });
        saveInFlightRef.current = false;
        setIsSavingDerivative(false);
        return;
      }
      
      toast({
        title: "Derivative saved to The Archives!",
        description: "Your derivative has been saved successfully",
      });
      
      setDerivativeSaveDialogOpen(false);
      setDerivativeToSave(null);
      setDerivativeSaveTitle("");
      localStorage.removeItem('multiply-derivatives-draft');
    } catch (error: any) {
      console.error('Error saving derivative:', error);
      toast({
        title: "Error saving derivative",
        description: error.message || "Failed to save derivative",
        variant: "destructive"
      });
    } finally {
      saveInFlightRef.current = false;
      setIsSavingDerivative(false);
    }
  };

  // Auto-save derivatives to localStorage
  useEffect(() => {
    if (derivatives.length > 0 && selectedMaster) {
      localStorage.setItem(
        "multiply-derivatives-draft",
        JSON.stringify({
          derivatives,
          masterContent: selectedMaster,
          timestamp: Date.now(),
        })
      );
    }
  }, [derivatives, selectedMaster]);

  // Restore derivatives draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("multiply-derivatives-draft");
    if (draft) {
      try {
        const { derivatives: draftDerivatives, masterContent, timestamp } = JSON.parse(draft);
        if (Date.now() - timestamp < 86400000) {
          toast({
            title: "Restored previous derivatives",
            description: "Click to clear drafts",
          });
          setDerivatives(draftDerivatives);
          setSelectedMaster(masterContent);
        } else {
          localStorage.removeItem("multiply-derivatives-draft");
        }
      } catch (error) {
        console.error("Error restoring draft:", error);
        localStorage.removeItem("multiply-derivatives-draft");
      }
    }
  }, []);

  
  const derivativesByType = derivatives.reduce((acc, d) => {
    if (!acc[d.typeId]) acc[d.typeId] = [];
    acc[d.typeId].push(d);
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
      
      
      <div className="container mx-auto px-4 py-8">
        
        
        {selectedMaster && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleSaveToLibrary}
              disabled={isSavingMaster}
              className="gap-2"
            >
              <Archive className="w-4 h-4" />
              {isSavingMaster ? "Saving..." : "Save to Library"}
            </Button>
          </div>
        )}

        
        
        
      </div>

      {/* Master Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Library</DialogTitle>
            <DialogDescription>
              Give your master content a name before saving to The Archives
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="save-title">Title</Label>
              <Input
                id="save-title"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter content title"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                disabled={isSavingMaster}
              >
                Cancel
              </Button>
              <Button onClick={saveToLibrary} disabled={isSavingMaster}>
                {isSavingMaster ? "Saving..." : "Save to Library"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Derivative Save Dialog */}
      <Dialog open={derivativeSaveDialogOpen} onOpenChange={setDerivativeSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Derivative</DialogTitle>
            <DialogDescription>
              Give your derivative content a name before saving
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="derivative-save-title">Title</Label>
              <Input
                id="derivative-save-title"
                value={derivativeSaveTitle}
                onChange={(e) => setDerivativeSaveTitle(e.target.value)}
                placeholder="Enter derivative title"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDerivativeSaveDialogOpen(false);
                  setDerivativeToSave(null);
                }}
                disabled={isSavingDerivative}
              >
                Cancel
              </Button>
              <Button onClick={saveDerivativeToDatabase} disabled={isSavingDerivative}>
                {isSavingDerivative ? "Saving..." : "Save Derivative"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
