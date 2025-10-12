import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Sparkles, Mail, Instagram, Twitter, Tag, MessageSquare, FileText, Save, CheckCircle2, XCircle } from "lucide-react";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";

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

interface EditorialDirectorSplitScreenProps {
  derivative: DerivativeContent;
  derivatives: DerivativeContent[];
  onClose: () => void;
  onUpdateDerivative: (derivative: DerivativeContent) => void;
}

const DERIVATIVE_ICONS = {
  instagram: Instagram,
  email: Mail,
  twitter: Twitter,
  product: Tag,
  sms: MessageSquare,
  pinterest: FileText,
};

const DERIVATIVE_LABELS = {
  instagram: "Instagram",
  email: "Email",
  twitter: "Twitter",
  product: "Product Description",
  sms: "SMS",
  pinterest: "Pinterest",
};

const DERIVATIVE_COLORS = {
  instagram: "#E4405F",
  email: "#B8956A",
  twitter: "#1DA1F2",
  product: "#3A4A3D",
  sms: "#6B2C3E",
  pinterest: "#E60023",
};

const CHAR_LIMITS = {
  instagram: 2200,
  email: 2000,
  twitter: 280,
  product: 500,
  sms: 160,
  pinterest: 500,
};

export function EditorialDirectorSplitScreen({
  derivative,
  derivatives,
  onClose,
  onUpdateDerivative,
}: EditorialDirectorSplitScreenProps) {
  const [editedContent, setEditedContent] = useState(derivative.content);
  const [selectedDerivativeId, setSelectedDerivativeId] = useState(derivative.id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedDerivative = derivatives.find(d => d.id === selectedDerivativeId) || derivative;
  const Icon = DERIVATIVE_ICONS[selectedDerivative.typeId as keyof typeof DERIVATIVE_ICONS] || FileText;
  const label = DERIVATIVE_LABELS[selectedDerivative.typeId as keyof typeof DERIVATIVE_LABELS] || selectedDerivative.typeId;
  const color = DERIVATIVE_COLORS[selectedDerivative.typeId as keyof typeof DERIVATIVE_COLORS] || "#B8956A";
  const charLimit = CHAR_LIMITS[selectedDerivative.typeId as keyof typeof CHAR_LIMITS];
  const charCount = editedContent.length;

  const handleSave = () => {
    onUpdateDerivative({
      ...selectedDerivative,
      content: editedContent,
      charCount: editedContent.length,
    });
  };

  const handleApprove = () => {
    onUpdateDerivative({
      ...selectedDerivative,
      content: editedContent,
      charCount: editedContent.length,
      status: "approved",
    });
  };

  const handleReject = () => {
    onUpdateDerivative({
      ...selectedDerivative,
      status: "rejected",
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.target.selectionStart;
    setEditedContent(e.target.value);
    
    // Preserve cursor position after state update
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = cursorPosition;
        textareaRef.current.selectionEnd = cursorPosition;
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 border-b flex items-center justify-between px-6 z-10" style={{ backgroundColor: "#FFFCF5", borderColor: "#D4CFC8" }}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ color: "#6B6560" }}
          >
            <X className="w-4 h-4 mr-2" />
            Exit Editor
          </Button>
        </div>
        
        <h1 className="text-lg font-serif font-semibold" style={{ color: "#1A1816" }}>
          Edit Derivatives
        </h1>

        <div className="w-24" /> {/* Spacer for centering */}
      </div>

      {/* Main Content Area */}
      <div className="flex w-full pt-14">
        {/* Left Panel - Derivatives Editor */}
        <div className="flex-1 overflow-y-auto border-r" style={{ borderColor: "#D4CFC8" }}>
          <div className="p-6 max-w-3xl">
            <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
              Review and refine your channel-specific content with the Editorial Director
            </p>

            {/* Derivative Selector */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className="gap-2"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Badge>
                <Badge variant="outline" style={{ borderColor: "#D4CFC8", color: "#6B6560" }}>
                  {selectedDerivative.status.charAt(0).toUpperCase() + selectedDerivative.status.slice(1)}
                </Badge>
              </div>

              {/* Content Editor */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: "#1A1816" }}>
                      Content
                    </label>
                    <span 
                      className="text-xs"
                      style={{ 
                        color: charLimit && charCount > charLimit ? "#DC2626" : "#A8A39E" 
                      }}
                    >
                      {charCount}{charLimit && `/${charLimit}`} chars
                    </span>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={handleContentChange}
                    className="min-h-64 font-sans"
                    style={{ backgroundColor: "#FFFCF5" }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    size="sm"
                    style={{ borderColor: "#D4CFC8", color: "#6B6560" }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  {selectedDerivative.status === "pending" && (
                    <>
                      <Button
                        onClick={handleApprove}
                        variant="outline"
                        size="sm"
                        style={{ borderColor: "#3A4A3D", color: "#3A4A3D" }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={handleReject}
                        variant="outline"
                        size="sm"
                        style={{ borderColor: "#6B2C3E", color: "#6B2C3E" }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Other Derivatives List */}
            {derivatives.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#1A1816" }}>
                  Other Derivatives
                </h3>
                <div className="space-y-2">
                  {derivatives.filter(d => d.id !== selectedDerivativeId).map((d) => {
                    const DIcon = DERIVATIVE_ICONS[d.typeId as keyof typeof DERIVATIVE_ICONS] || FileText;
                    const dLabel = DERIVATIVE_LABELS[d.typeId as keyof typeof DERIVATIVE_LABELS] || d.typeId;
                    const dColor = DERIVATIVE_COLORS[d.typeId as keyof typeof DERIVATIVE_COLORS] || "#B8956A";

                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDerivativeId(d.id);
                          setEditedContent(d.content);
                        }}
                        className="w-full p-3 rounded-lg border text-left hover:shadow-sm transition-all"
                        style={{ backgroundColor: "#FFFCF5", borderColor: "#D4CFC8" }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="gap-1.5"
                            style={{ backgroundColor: `${dColor}15`, color: dColor }}
                          >
                            <DIcon className="w-3.5 h-3.5" />
                            {dLabel}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: "#D4CFC8", color: "#A8A39E" }}
                          >
                            {d.status}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Editorial Director */}
        <div className="w-96 xl:w-[450px] overflow-hidden" style={{ backgroundColor: "#FFFCF5" }}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b" style={{ borderColor: "#D4CFC8" }}>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(184, 149, 106, 0.1)" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "#B8956A" }} />
                </div>
                <div>
                  <h2 className="font-serif font-semibold" style={{ color: "#1A1816" }}>
                    Editorial Director
                  </h2>
                  <p className="text-xs" style={{ color: "#6B6560" }}>Strategic Counsel</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="gap-1.5"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </Badge>
                <span className="text-xs" style={{ color: "#A8A39E" }}>
                  {charCount}{charLimit && `/${charLimit}`} chars
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <EditorialAssistantPanel
                onClose={() => {}}
                initialContent={editedContent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
