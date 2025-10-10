import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Check, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentEditor } from "@/components/ContentEditor";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function ContentEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load content from route state, DB, or localStorage
  const [isLoading, setIsLoading] = useState(true);
  const [contentId, setContentId] = useState<string | undefined>(location.state?.contentId);
  const [editableContent, setEditableContent] = useState("");
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("");
  const [productName, setProductName] = useState("");
  
  // UI state
  const [assistantOpen, setAssistantOpen] = useState(false);
  
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
      // Priority 1: Route state (coming from ForgeNew)
      if (location.state?.content) {
        setEditableContent(location.state.content);
        setTitle(location.state.contentName || "Untitled Content");
        setContentType(location.state.contentType || "Blog Post");
        setProductName(location.state.productName || "Product");
        setContentId(location.state.contentId);
        setIsLoading(false);
        return;
      }

      // Priority 2: Database (if we have contentId in URL params)
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
          
          setEditableContent(data.full_content || "");
          setTitle(data.title || "Untitled Content");
          setContentType(data.content_type || "Blog Post");
          setContentId(data.id);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Error loading from DB:", error);
        }
      }

      // Priority 3: localStorage backup
      const savedDraft = localStorage.getItem('scriptora-content-draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setEditableContent(draft.content || "");
          setTitle(draft.title || "Untitled Content");
          setContentId(draft.id);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Error loading from localStorage:", error);
        }
      }

      // No content found - redirect to create
      toast({
        title: "No content found",
        description: "Redirecting to content creation...",
        variant: "destructive"
      });
      setTimeout(() => navigate("/create"), 1500);
    };

    loadContent();
  }, [location.state, location.search, navigate, toast]);

  const handleSave = async () => {
    await forceSave();
    toast({
      title: "Saved",
      description: "Your content has been saved successfully",
    });
  };

  const handleNextToMultiply = async () => {
    // Ensure content is saved before proceeding
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F1E8" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#B8956A" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Top Toolbar */}
      <div 
        className="border-b sticky top-0 z-10 flex-shrink-0"
        style={{ 
          backgroundColor: "#FFFCF5",
          borderColor: "#D4CFC8"
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/create")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Brief</span>
          </Button>

          {/* Center: Content type badge */}
          <Badge 
            variant="outline" 
            className="text-base"
            style={{
              borderColor: "#D4CFC8",
              color: "#6B6560"
            }}
          >
            {contentType}
          </Badge>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Editorial Assistant Toggle */}
            <Button
              variant={assistantOpen ? "default" : "outline"}
              onClick={() => setAssistantOpen(!assistantOpen)}
              className="gap-2"
              style={{
                borderColor: assistantOpen ? undefined : "#D4CFC8",
                backgroundColor: assistantOpen ? "#B8956A" : undefined,
                color: assistantOpen ? "#FFFFFF" : "#6B6560"
              }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Editorial Assistant</span>
            </Button>

            {/* Save Button */}
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="gap-2 min-w-[100px]"
              style={{
                borderColor: saveStatus === "saved" ? "#22C55E" : "#D4CFC8",
                backgroundColor: saveStatus === "saved" ? "#22C55E" : undefined,
                color: saveStatus === "saved" ? "#FFFFFF" : undefined
              }}
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </Button>
            
            {/* Next: Multiply */}
            <Button
              onClick={handleNextToMultiply}
              variant="brass"
              className="gap-2 bg-gradient-to-r from-aged-brass to-antique-gold text-ink-black"
            >
              <span>Next: Multiply</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Area - Full width or 50% when assistant is open */}
        <motion.div
          animate={{ width: assistantOpen ? "50%" : "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-auto"
        >
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Content"
                className="w-full text-4xl font-serif mb-4 bg-transparent border-none focus:outline-none focus:border-b-2 pb-2"
                style={{
                  color: "#1A1816",
                  borderColor: "#B8956A"
                }}
              />

              {/* Metadata */}
              <div className="flex items-center gap-3 mb-8 flex-wrap">
                <span 
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "#F5F1E8",
                    color: "#6B6560"
                  }}
                >
                  {productName}
                </span>
                <span 
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "#F5F1E8",
                    color: "#6B6560"
                  }}
                >
                  {editableContent.split(/\s+/).length} words
                </span>
                <span 
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "#B8956A",
                    color: "#1A1816"
                  }}
                >
                  Draft
                </span>
              </div>

              {/* Full-Screen Editor Component */}
              <ContentEditor
                content={editableContent}
                onChange={setEditableContent}
                placeholder="Your content will appear here..."
                initialFullScreen={true}
                onAssistantToggle={setAssistantOpen}
              />
            </div>
          </div>
        </motion.div>

        {/* Editorial Assistant Panel - Slides in from right */}
        <AnimatePresence>
          {assistantOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-1/2 h-full overflow-hidden"
              style={{ 
                borderLeft: "1px solid #D4CFC8",
                backgroundColor: "#FFFCF5"
              }}
            >
              <EditorialAssistantPanel 
                onClose={() => setAssistantOpen(false)}
                initialContent={editableContent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
