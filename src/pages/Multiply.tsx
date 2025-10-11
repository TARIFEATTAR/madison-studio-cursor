import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Sparkles, Archive, Mail, Instagram, Tag, MessageSquare, 
  FileText, CheckCircle2, XCircle, ChevronDown, ChevronRight, Copy, 
  Calendar, Edit, Loader2, AlertCircle, Video 
} from "lucide-react";
import { EditorialDirectorSplitScreen } from "@/components/multiply/EditorialDirectorSplitScreen";
import fannedPagesImage from "@/assets/fanned-pages.png";

// Derivative type definitions
interface DerivativeType {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  charLimit?: number;
  isSequence?: boolean;
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
    iconColor: "#8B7355",
    isSequence: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Instagram posts and captions",
    icon: Instagram,
    iconColor: "#E4405F",
    charLimit: 2200,
  },
  {
    id: "product",
    name: "Product Description",
    description: "Product page descriptions",
    icon: Tag,
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

// Sample master content for fallback
const SAMPLE_CONTENT: MasterContent = {
  id: "sample-1",
  title: "Noir de Nuit: The Art of Evening Fragrance",
  contentType: "Blog Post",
  collection: "sparkles Signature Collection",
  content: `There's a particular magic that descends as daylight fades—when the world softens, and evening unveils its mysteries.

Noir de Nuit was born from this enchantment. Our master perfumer spent two years perfecting a composition that captures the essence of twilight: black currant and pink pepper create an intriguing opening, while Turkish rose and jasmine sambac unfold like secrets whispered in candlelight.

The heart is where the fragrance truly reveals its character. Iris adds a powdery elegance, while the florals deepen and darken as evening progresses. These rare ingredients were sourced from heritage suppliers—the rose from family farms in Turkey, the jasmine from traditional growers in India.

As Noir de Nuit settles into its base, precious oud and sandalwood emerge, wrapped in golden amber. This is a fragrance of depth and mystery, designed for those who understand that true luxury whispers rather than shouts.

Noir de Nuit is part of our Signature Fragrance collection, where each scent tells a story of craftsmanship and rare beauty. Available in 50ml and 100ml editions, presented in our signature black lacquer bottle.`,
  wordCount: 189,
  charCount: 1140,
};

export default function Multiply() {
  const { toast } = useToast();
  const [selectedMaster, setSelectedMaster] = useState<MasterContent>(SAMPLE_CONTENT);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [derivatives, setDerivatives] = useState<DerivativeContent[]>([]);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [splitScreenMode, setSplitScreenMode] = useState(false);
  const [selectedDerivativeForDirector, setSelectedDerivativeForDirector] = useState<DerivativeContent | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [userContent, setUserContent] = useState<MasterContent | null>(null);

  // Check for recent content from localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem('scriptora-saved-content');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          const recent = parsed[0];
          setUserContent({
            id: recent.id || 'user-1',
            title: recent.title || 'Untitled',
            contentType: recent.contentType || 'Content',
            collection: recent.collection,
            content: recent.content || '',
            wordCount: recent.wordCount || 0,
            charCount: recent.content?.length || 0,
          });
          setSelectedMaster({
            id: recent.id || 'user-1',
            title: recent.title || 'Untitled',
            contentType: recent.contentType || 'Content',
            collection: recent.collection,
            content: recent.content || '',
            wordCount: recent.wordCount || 0,
            charCount: recent.content?.length || 0,
          });
        }
      } catch (e) {
        console.error('Error parsing saved content:', e);
      }
    }
  }, []);

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
    if (selectedTypes.size === 0) return;

    setIsGenerating(true);

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newDerivatives: DerivativeContent[] = [];
    const newExpandedTypes = new Set<string>();

    selectedTypes.forEach(typeId => {
      const type = DERIVATIVE_TYPES.find(t => t.id === typeId);
      if (!type) return;

      // Generate sample content based on type
      let content = "";
      if (typeId === "instagram") {
        content = `${selectedMaster.title}\n\nExperience the perfect balance of tradition and innovation. Our master perfumers have crafted something truly special.\n\n#Fragrance #Luxury #Artisan #Scent ✨`;
      } else if (typeId === "twitter") {
        content = "Discover the art of scent with our latest collection. Each fragrance tells a story of craftsmanship and tradition. 🌿✨";
      } else if (typeId === "email") {
        content = `Subject: A whisper from the past, for you.\n\nPreview: Step into a story that spans centuries.\n\nWelcome to our world. We believe that true artistry often speaks softly, revealing its depth to those who listen closely.\n\nLike the scent of incense that lingers long after a ceremony, certain impressions stay with us. Here at our atelier, we craft fragrances not just to be worn, but to resonate, to tell a story that unfolds on your skin.`;
      } else if (typeId === "sms") {
        content = "New fragrance alert! Experience our latest creation. Shop now: scriptora.com";
      } else if (typeId === "product") {
        content = `${selectedMaster.title} - A sophisticated composition that captures the essence of modern luxury. Thoughtfully crafted with ethically sourced ingredients.`;
      } else if (typeId === "pinterest") {
        content = "Experience the artistry of fine fragrance. Each scent in our collection tells a unique story of craftsmanship, tradition, and rare beauty. Discover your signature scent.";
      }

      newDerivatives.push({
        id: `derivative-${typeId}-${Date.now()}`,
        typeId,
        content,
        status: "pending",
        charCount: content.length,
      });

      newExpandedTypes.add(typeId);
    });

    setDerivatives([...derivatives, ...newDerivatives]);
    setExpandedTypes(newExpandedTypes);
    setSelectedTypes(new Set());
    setIsGenerating(false);

    toast({
      title: "Derivatives Generated",
      description: `Successfully generated ${newDerivatives.length} derivative${newDerivatives.length !== 1 ? 's' : ''}`,
    });
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

        {/* Master Content Selector (only if no user content) */}
        {!userContent && (
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2" style={{ color: "#1A1816" }}>
              Master Content:
            </Label>
            <Select value={selectedMaster.id} onValueChange={(value) => setSelectedMaster(SAMPLE_CONTENT)}>
              <SelectTrigger className="w-full max-w-lg" style={{ backgroundColor: "#FFFCF5" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SAMPLE_CONTENT.id}>{SAMPLE_CONTENT.title}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Main Content Area */}
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
                      className="w-32 h-32 object-contain opacity-80"
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
                            <Icon className="w-4 h-4" />
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

                              <p className="text-sm mb-4 whitespace-pre-wrap" style={{ color: "#6B6560" }}>
                                {derivative.content}
                              </p>

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
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                style={{ backgroundColor: `${type.iconColor}15` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: type.iconColor }} />
                              </div>
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
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                              style={{ backgroundColor: `${type.iconColor}15` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: type.iconColor }} />
                            </div>
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
                {selectedMaster.content.split('\n').slice(0, 2).join('\n')}...
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
    </div>
  );
}
