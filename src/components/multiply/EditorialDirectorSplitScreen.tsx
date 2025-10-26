import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Sparkles, Mail, Instagram, Twitter, Tag, MessageSquare, FileText, Save, CheckCircle2, XCircle, Maximize2, Minimize2 } from "lucide-react";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AUTOSAVE_CONFIG } from "@/config/autosaveConfig";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedSequenceEmails, setEditedSequenceEmails] = useState(
    derivative.sequenceEmails || []
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-save with standard delay
  const { saveStatus, lastSavedAt } = useAutoSave({
    content: editedContent,
    contentId: selectedDerivativeId,
    contentName: `Derivative ${selectedDerivativeId}`,
    delay: AUTOSAVE_CONFIG.STANDARD_DELAY
  });

  const selectedDerivative = derivatives.find(d => d.id === selectedDerivativeId) || derivative;
  const Icon = DERIVATIVE_ICONS[selectedDerivative.typeId as keyof typeof DERIVATIVE_ICONS] || FileText;
  const label = DERIVATIVE_LABELS[selectedDerivative.typeId as keyof typeof DERIVATIVE_LABELS] || selectedDerivative.typeId;
  const color = DERIVATIVE_COLORS[selectedDerivative.typeId as keyof typeof DERIVATIVE_COLORS] || "#B8956A";
  const charLimit = CHAR_LIMITS[selectedDerivative.typeId as keyof typeof CHAR_LIMITS];
  const charCount = editedContent.length;
  const isSequence = selectedDerivative.isSequence && selectedDerivative.sequenceEmails;

  const handleSave = () => {
    onUpdateDerivative({
      ...selectedDerivative,
      content: editedContent,
      charCount: editedContent.length,
      sequenceEmails: isSequence ? editedSequenceEmails : undefined,
    });
  };

  const handleApprove = () => {
    onUpdateDerivative({
      ...selectedDerivative,
      content: editedContent,
      charCount: editedContent.length,
      status: "approved",
      sequenceEmails: isSequence ? editedSequenceEmails : undefined,
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

  const handleSequenceEmailChange = (emailId: string, field: 'subject' | 'preview' | 'content', value: string) => {
    setEditedSequenceEmails(prev =>
      prev.map(email =>
        email.id === emailId
          ? { ...email, [field]: value, charCount: field === 'content' ? value.length : email.charCount }
          : email
      )
    );
  };

  useEffect(() => {
    if (selectedDerivative.sequenceEmails) {
      setEditedSequenceEmails(selectedDerivative.sequenceEmails);
    }
  }, [selectedDerivativeId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b" style={{ backgroundColor: "#FFFCF5", borderColor: "#D4CFC8" }}>
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ color: "#6B6560" }}
          >
            <X className="w-4 h-4 mr-2" />
            Exit Editor
          </Button>
          <AutosaveIndicator 
            saveStatus={saveStatus} 
            lastSavedAt={lastSavedAt}
          />
        </div>
        
        <h1 className="text-lg font-serif font-semibold" style={{ color: "#1A1816" }}>
          Edit Derivatives
        </h1>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ color: "#6B6560" }}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Main Content Area - Fixed 60/40 Split */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Derivatives Editor (60% width) */}
        <div 
          className={`${isExpanded ? 'flex-1' : 'flex-1'} overflow-y-auto border-r py-4 sm:py-6 px-2 sm:px-4`} 
          style={{ borderColor: "#D4CFC8" }}
        >
          <div className="max-w-5xl mx-auto">
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

              {/* Content Editor - Email Sequence or Regular */}
              {isSequence ? (
                <div className="space-y-4">
                  <Accordion type="multiple" defaultValue={editedSequenceEmails.map(e => e.id)} className="space-y-3">
                    {editedSequenceEmails.map((email, index) => (
                      <AccordionItem 
                        key={email.id} 
                        value={email.id}
                        className="border rounded-lg overflow-hidden"
                        style={{ borderColor: "#D4CFC8", backgroundColor: "#FFFCF5" }}
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" style={{ borderColor: "#B8956A", color: "#B8956A" }}>
                                Email {email.sequenceNumber}
                              </Badge>
                              <span className="text-sm font-medium" style={{ color: "#1A1816" }}>
                                {email.subject || 'Untitled'}
                              </span>
                            </div>
                            <span className="text-xs" style={{ color: "#A8A39E" }}>
                              {email.charCount} chars
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 space-y-4">
                          <div>
                            <Label className="text-sm font-medium mb-2" style={{ color: "#1A1816" }}>
                              Subject Line
                            </Label>
                            <Input
                              value={email.subject}
                              onChange={(e) => handleSequenceEmailChange(email.id, 'subject', e.target.value)}
                              placeholder="Enter subject line..."
                              className="mt-1"
                              style={{ backgroundColor: "#F5F1E8" }}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-2" style={{ color: "#1A1816" }}>
                              Preview Text
                            </Label>
                            <Input
                              value={email.preview}
                              onChange={(e) => handleSequenceEmailChange(email.id, 'preview', e.target.value)}
                              placeholder="Enter preview text..."
                              className="mt-1"
                              style={{ backgroundColor: "#F5F1E8" }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium" style={{ color: "#1A1816" }}>
                                Email Body
                              </Label>
                              <span className="text-xs" style={{ color: "#A8A39E" }}>
                                {email.charCount} chars
                              </span>
                            </div>
                            <Textarea
                              value={email.content}
                              onChange={(e) => handleSequenceEmailChange(email.id, 'content', e.target.value)}
                              className={isExpanded ? "min-h-96" : "min-h-64"}
                              style={{ backgroundColor: "#F5F1E8" }}
                              placeholder="Write your email content..."
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
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
              ) : (
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
                      className={isExpanded ? "min-h-96 font-sans" : "min-h-64 font-sans"}
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
              )}
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

        {/* Right Panel - Editorial Director (fills remaining space) */}
        {!isExpanded && (
          <div 
            className="w-[500px] overflow-hidden flex flex-col"
            style={{ backgroundColor: "#FFFCF5" }}
          >
            {/* Panel Header */}
            <div 
              className="px-4 py-3 border-b" 
              style={{ borderColor: "#D4CFC8", backgroundColor: "rgba(184, 149, 106, 0.05)" }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(184, 149, 106, 0.1)" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "#B8956A" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif font-semibold text-sm sm:text-base" style={{ color: "#1A1816" }}>
                    Editorial Director
                  </h2>
                  <p className="text-xs" style={{ color: "#A8A39E" }}>
                    <Icon className="w-3 h-3 inline mr-1" style={{ color }} />
                    {label} • {charCount} chars
                  </p>
                </div>
              </div>
            </div>

            {/* Assistant Panel */}
            <div className="flex-1 overflow-hidden">
              <EditorialAssistantPanel
                onClose={onClose}
                initialContent={editedContent}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
