import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Check, Loader2, MessageSquare, Bold, Italic, Underline, Undo2, Redo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import QualityRating from "@/components/QualityRating";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const FONT_OPTIONS = [
  { value: 'cormorant', label: 'Cormorant Garamond', family: '"Cormorant Garamond", serif' },
  { value: 'crimson', label: 'Crimson Text', family: '"Crimson Text", serif' },
  { value: 'lato', label: 'Lato', family: '"Lato", sans-serif' },
  { value: 'inter', label: 'Inter', family: '"Inter", sans-serif' },
];

export default function ContentEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const editableRef = useRef<HTMLDivElement>(null);
  
  // Load content from route state, DB, or localStorage
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [contentId, setContentId] = useState<string | undefined>(location.state?.contentId);
  const [editableContent, setEditableContent] = useState("");
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("");
  const [productName, setProductName] = useState("");
  
  // Editor state
  const [selectedFont, setSelectedFont] = useState('cormorant');
  const [wordCount, setWordCount] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [qualityRating, setQualityRating] = useState(0);

  // Callback ref to ensure the editable div is mounted before we try to set content
  const attachEditableRef = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      editableRef.current = element;
      setIsEditorReady(true);
      console.log("[ContentEditor] Editor ref attached and ready");
    }
  }, []);
  
  // History for undo/redo
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Auto-save
  const { saveStatus, forceSave } = useAutoSave({
    content: editableContent,
    contentId,
    contentName: title,
    delay: 3000
  });

  // Load content on mount
  useEffect(() => {
    const loadContent = async () => {
      console.log("[ContentEditor] Loading content...", { 
        hasLocationState: !!location.state, 
        content: location.state?.content?.substring(0, 100)
      });

      if (location.state?.content) {
        const content = location.state.content;
        console.log("[ContentEditor] Loading from location.state, content length:", content.length);
        setEditableContent(content);
        setTitle(location.state.contentName || "Untitled Content");
        setContentType(location.state.contentType || "Blog Post");
        setProductName(location.state.productName || "Product");
        setContentId(location.state.contentId);
        setIsLoading(false);
        return;
      }

      const urlParams = new URLSearchParams(location.search);
      const idFromUrl = urlParams.get('id');
      if (idFromUrl) {
        try {
          const { data, error } = await supabase
            .from('master_content')
            .select('*')
            .eq('id', idFromUrl)
            .single();

          if (error) throw error;
          
          const content = data.full_content || "";
          setEditableContent(content);
          setTitle(data.title || "Untitled Content");
          setContentType(data.content_type || "Blog Post");
          setContentId(data.id);
          setQualityRating(data.quality_rating || 0);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("[ContentEditor] Error loading from DB:", error);
          toast({
            title: "Failed to load content",
            description: "Unable to load content from database. Please try again.",
            variant: "destructive"
          });
        }
      }

      const savedDraft = localStorage.getItem('scriptora-content-draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          const content = draft.content || "";
          setEditableContent(content);
          setTitle(draft.title || "Untitled Content");
          setContentId(draft.id);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("[ContentEditor] Error loading from localStorage:", error);
        }
      }

      console.error("[ContentEditor] No content source found");
      toast({
        title: "No content found",
        description: "No content available to edit. Redirecting to content creation...",
        variant: "destructive"
      });
      setTimeout(() => navigate("/create"), 1500);
    };

    loadContent();
  }, [location.state, location.search, navigate, toast]);

  // Set content in editor when both editor is ready and content is available
  useEffect(() => {
    if (!isEditorReady || !editableRef.current || !editableContent) return;
    
    console.log("[ContentEditor] Setting content in editor, length:", editableContent.length);
    editableRef.current.innerHTML = editableContent.replace(/\n/g, '<br>');
  }, [isEditorReady, editableContent]);

  // Calculate word count
  useEffect(() => {
    if (editableRef.current) {
      const text = editableRef.current.innerText;
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [editableContent]);

  // Update history when content changes
  useEffect(() => {
    if (!isUndoRedoRef.current && editableContent !== historyRef.current[historyIndexRef.current]) {
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(editableContent);
      
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        historyIndexRef.current++;
      }
      historyRef.current = newHistory;
    }
    isUndoRedoRef.current = false;
  }, [editableContent]);

  const htmlToPlainText = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.innerText;
  };

  const updateContentFromEditable = () => {
    if (editableRef.current) {
      const html = editableRef.current.innerHTML;
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        const plainText = htmlToPlainText(html);
        setEditableContent(plainText);
      }, 300);
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const prevContent = historyRef.current[historyIndexRef.current];
      setEditableContent(prevContent);
      if (editableRef.current) {
        editableRef.current.innerHTML = prevContent.replace(/\n/g, '<br>');
      }
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const nextContent = historyRef.current[historyIndexRef.current];
      setEditableContent(nextContent);
      if (editableRef.current) {
        editableRef.current.innerHTML = nextContent.replace(/\n/g, '<br>');
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (editableRef.current) {
      editableRef.current.focus();
      document.execCommand(command, false, value);
      updateContentFromEditable();
    }
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleH1 = () => execCommand('formatBlock', '<h1>');
  const handleH2 = () => execCommand('formatBlock', '<h2>');
  const handleH3 = () => execCommand('formatBlock', '<h3>');

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleSave = async () => {
    if (contentId) {
      const { error } = await supabase
        .from('master_content')
        .update({ 
          full_content: editableContent,
          quality_rating: qualityRating > 0 ? qualityRating : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);
      
      if (error) {
        toast({ 
          title: "Save failed", 
          description: error.message,
          variant: "destructive" 
        });
      } else {
        toast({ title: "Saved successfully" });
      }
    } else {
      await forceSave();
      toast({
        title: "Saved",
        description: "Your content has been saved successfully",
      });
    }
  };

  const handleNextToMultiply = async () => {
    if (saveStatus !== "saved") {
      await forceSave();
    }
    
    navigate("/multiply", { 
      state: { 
        content: editableContent,
        title,
        contentType,
        productName,
        contentId
      } 
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    }
  };

  // Ensure we commit the latest editor content before toggling the assistant
  const handleToggleAssistant = () => {
    if (editableRef.current) {
      const html = editableRef.current.innerHTML;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      const plainText = htmlToPlainText(html);
      setEditableContent(plainText);
    }
    setAssistantOpen((prev) => !prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#F5F1E8" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#B8956A" }} />
        <p className="text-sm" style={{ color: "#6B6662" }}>Loading your content...</p>
      </div>
    );
  }

  const currentFontFamily = FONT_OPTIONS.find(f => f.value === selectedFont)?.family || FONT_OPTIONS[0].family;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Top Toolbar - Clean & Minimal */}
      <div 
        className="border-b z-10 flex-shrink-0"
        style={{ 
          backgroundColor: "#FFFCF5",
          borderColor: "#E5E0D8"
        }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Exit Button + Font & Formatting */}
          <div className="flex items-center gap-2">
            {/* Exit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="h-9 w-9 p-0"
              title="Exit Editor"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-border/40 mx-1" />

            <Select 
              value={selectedFont} 
              onValueChange={setSelectedFont}
            >
              <SelectTrigger className="w-[180px] h-9 border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {FONT_OPTIONS.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.family }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border/40 mx-1" />

            {/* Formatting Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleBold();
              }}
              className="h-9 w-9 p-0"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleItalic();
              }}
              className="h-9 w-9 p-0"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleUnderline();
              }}
              className="h-9 w-9 p-0"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-border/40 mx-1" />

            {/* Headers */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleH1();
              }}
              className="h-9 px-3 text-sm"
              title="Heading 1"
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleH2();
              }}
              className="h-9 px-3 text-sm"
              title="Heading 2"
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleH3();
              }}
              className="h-9 px-3 text-sm"
              title="Heading 3"
            >
              H3
            </Button>
          </div>

          {/* Center: Editorial Assistant */}
          <Button
            variant={assistantOpen ? "default" : "ghost"}
            onClick={handleToggleAssistant}
            className="gap-2 h-9"
            style={{
              backgroundColor: assistantOpen ? "#B8956A" : undefined,
              color: assistantOpen ? "#FFFFFF" : undefined
            }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Editorial Assistant</span>
          </Button>

          {/* Right: Undo/Redo, Word Count, Save, Next */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-9 w-9 p-0"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-9 w-9 p-0"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            <span className="text-sm text-muted-foreground mx-2">
              {wordCount} words
            </span>

            <QualityRating 
              rating={qualityRating} 
              onRatingChange={setQualityRating} 
            />

            <Button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="gap-2 h-9 bg-gradient-to-r from-aged-brass to-antique-gold text-ink-black hover:opacity-90"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveStatus === "saved" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </Button>
            
            <Button
              onClick={handleNextToMultiply}
              className="gap-2 h-9"
              style={{
                backgroundColor: "#1A1816",
                color: "#FFFFFF"
              }}
            >
              <span>Next: Multiply</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {!assistantOpen ? (
          // Full width editor when assistant is closed
          <div className="w-full overflow-auto h-full" style={{ backgroundColor: "#F5F1E8" }}>
            <div className="max-w-4xl mx-auto py-16 px-8 md:px-16">
              <div
                ref={attachEditableRef}
                contentEditable
                onInput={updateContentFromEditable}
                onKeyDown={handleKeyDown}
                suppressContentEditableWarning
                className="w-full min-h-[calc(100vh-200px)] focus:outline-none text-lg leading-relaxed"
                style={{
                  fontFamily: currentFontFamily,
                  color: "#1A1816"
                }}
              />
            </div>
          </div>
        ) : (
          // Resizable panels when assistant is open
          <ResizablePanelGroup direction="horizontal" className="w-full h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="w-full h-full overflow-auto" style={{ backgroundColor: "#F5F1E8" }}>
                <div className="max-w-4xl mx-auto py-16 px-8 md:px-16">
                  <div
                    ref={attachEditableRef}
                    contentEditable
                    onInput={updateContentFromEditable}
                    onKeyDown={handleKeyDown}
                    suppressContentEditableWarning
                    className="w-full min-h-[calc(100vh-200px)] focus:outline-none text-lg leading-relaxed"
                    style={{
                      fontFamily: currentFontFamily,
                      color: "#1A1816"
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle 
              className="w-1 hover:w-2 transition-all"
              style={{ backgroundColor: "#D4CFC8" }}
            />
            
            <ResizablePanel defaultSize={50} minSize={25} maxSize={70}>
              <div 
                className="w-full h-full"
                style={{ 
                  backgroundColor: "#FFFCF5"
                }}
              >
                <EditorialAssistantPanel 
                  onClose={handleToggleAssistant}
                  initialContent={editableContent}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
