import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Sparkles, Mail, Instagram, Twitter, Tag, MessageSquare, FileText, Save, CheckCircle2, XCircle, Maximize2, Minimize2, GripVertical } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedSequenceEmails, setEditedSequenceEmails] = useState(
    derivative.sequenceEmails || []
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Draggable window state
  const [windowPosition, setWindowPosition] = useState({ x: window.innerWidth - 500, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  // Resizable window state
  const [windowSize, setWindowSize] = useState({ width: 450, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

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

  // Draggable window handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragHandleRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - windowPosition.x,
        y: e.clientY - windowPosition.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isResizing) {
      const maxX = Math.max(0, window.innerWidth - windowSize.width - 20);
      const maxY = Math.max(56, window.innerHeight - windowSize.height - 20);
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, maxX));
      const newY = Math.max(56, Math.min(e.clientY - dragStart.y, maxY));
      setWindowPosition({ x: newX, y: newY });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: windowSize.width,
      height: windowSize.height,
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !resizeDirection) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    let newX = windowPosition.x;
    let newY = windowPosition.y;

    const minWidth = 350;
    const maxWidth = 800;
    const minHeight = 400;
    const maxHeight = window.innerHeight - 140;

    // Handle horizontal resizing
    if (resizeDirection.includes('right')) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
      // Constrain to screen bounds
      newWidth = Math.min(newWidth, window.innerWidth - windowPosition.x - 20);
    } else if (resizeDirection.includes('left')) {
      const proposedWidth = resizeStart.width - deltaX;
      newWidth = Math.max(minWidth, Math.min(maxWidth, proposedWidth));
      const widthDiff = resizeStart.width - newWidth;
      newX = Math.max(0, windowPosition.x - widthDiff);
      // Adjust width if position is constrained
      if (windowPosition.x - widthDiff < 0) {
        newWidth = resizeStart.width + windowPosition.x;
        newX = 0;
      }
    }

    // Handle vertical resizing
    if (resizeDirection.includes('bottom')) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
      // Constrain to screen bounds
      newHeight = Math.min(newHeight, window.innerHeight - windowPosition.y - 20);
    } else if (resizeDirection.includes('top')) {
      const proposedHeight = resizeStart.height - deltaY;
      newHeight = Math.max(minHeight, Math.min(maxHeight, proposedHeight));
      const heightDiff = resizeStart.height - newHeight;
      newY = Math.max(56, windowPosition.y - heightDiff); // 56 = header height
      // Adjust height if position is constrained
      if (windowPosition.y - heightDiff < 56) {
        newHeight = resizeStart.height + (windowPosition.y - 56);
        newY = 56;
      }
    }

    setWindowSize({ width: newWidth, height: newHeight });
    if (newX !== windowPosition.x || newY !== windowPosition.y) {
      setWindowPosition({ x: newX, y: newY });
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, windowPosition, windowSize, isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeDirection, resizeStart, windowPosition]);

  // Clamp position on window resize and when size changes
  useEffect(() => {
    const onResize = () => {
      setWindowPosition(prev => {
        const maxX = Math.max(0, window.innerWidth - windowSize.width - 20);
        const maxY = Math.max(56, window.innerHeight - windowSize.height - 20);
        return {
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(56, Math.min(prev.y, maxY)),
        };
      });
    };

    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [windowSize]);

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

      {/* Main Content Area */}
      <div className="flex w-full pt-14">
        {/* Left Panel - Derivatives Editor */}
        <div className={`${isExpanded ? 'flex-1' : 'flex-1'} overflow-y-auto border-r`} style={{ borderColor: "#D4CFC8" }}>
          <div className={`p-6 ${isExpanded ? 'max-w-none' : 'max-w-3xl'}`}>
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

        {/* Right Panel - Editorial Director (Draggable & Resizable Window) */}
        {!isExpanded && (
          <div 
            className="fixed rounded-lg shadow-2xl overflow-hidden border-2"
            style={{ 
              backgroundColor: "#FFFCF5",
              borderColor: "#B8956A",
              left: `${windowPosition.x}px`,
              top: `${windowPosition.y}px`,
              width: `${windowSize.width}px`,
              height: `${windowSize.height}px`,
              zIndex: 60,
              cursor: isDragging ? 'grabbing' : 'default'
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Resize handles - thicker for better UX */}
            {/* Top edge */}
            <div 
              className="absolute top-0 left-2 right-2 h-2 hover:bg-primary/10 cursor-ns-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, 'top')}
            />
            {/* Right edge */}
            <div 
              className="absolute top-2 right-0 bottom-2 w-2 hover:bg-primary/10 cursor-ew-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            />
            {/* Bottom edge */}
            <div 
              className="absolute bottom-0 left-2 right-2 h-2 hover:bg-primary/10 cursor-ns-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
            />
            {/* Left edge */}
            <div 
              className="absolute top-2 left-0 bottom-2 w-2 hover:bg-primary/10 cursor-ew-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            />
            {/* Top-left corner */}
            <div 
              className="absolute top-0 left-0 w-4 h-4 hover:bg-primary/10 cursor-nwse-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, 'top-left')}
            />
            {/* Top-right corner */}
            <div 
              className="absolute top-0 right-0 w-4 h-4 hover:bg-primary/10 cursor-nesw-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, 'top-right')}
            />
            {/* Bottom-right corner */}
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 hover:bg-primary/10 cursor-nwse-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
            />
            {/* Bottom-left corner */}
            <div 
              className="absolute bottom-0 left-0 w-4 h-4 hover:bg-primary/10 cursor-nesw-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
            />

            <div className="h-full flex flex-col">
              <div 
                ref={dragHandleRef}
                className="p-4 border-b cursor-grab active:cursor-grabbing select-none" 
                style={{ borderColor: "#D4CFC8", backgroundColor: "rgba(184, 149, 106, 0.05)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: "#B8956A" }} />
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(184, 149, 106, 0.1)" }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: "#B8956A" }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif font-semibold" style={{ color: "#1A1816" }}>
                      Editorial Director
                    </h2>
                    <p className="text-xs" style={{ color: "#6B6560" }}>Drag to move • Resize from edges</p>
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
        )}
      </div>
    </div>
  );
}
