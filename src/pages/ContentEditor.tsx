import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentEditor } from "@/components/ContentEditor";

export default function ContentEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { content, contentType, productName, contentName } = location.state || {
    content: "",
    contentType: "Blog Post",
    productName: "Product",
    contentName: "Untitled Content"
  };

  const [editableContent, setEditableContent] = useState(content);
  const [title, setTitle] = useState(contentName);

  const handleSave = () => {
    console.log("Saving content:", { title, content: editableContent });
  };

  const handleNextToMultiply = () => {
    navigate("/multiply", { 
      state: { 
        content: editableContent,
        title,
        contentType,
        productName 
      } 
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Top Bar */}
      <div 
        className="border-b sticky top-0 z-10"
        style={{ 
          backgroundColor: "#FFFCF5",
          borderColor: "#D4CFC8"
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/create")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Brief</span>
          </Button>

          <div className="flex items-center gap-3">
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
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              className="gap-2"
              style={{
                borderColor: "#D4CFC8"
              }}
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </Button>
            
            <Button
              onClick={handleNextToMultiply}
              className="gap-2"
              style={{
                background: "linear-gradient(to-right, #B8956A, #D4AF85)",
                color: "#1A1816"
              }}
            >
              <span>Next: Multiply</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left Panel - Editor */}
        <div className="flex-1 p-8 overflow-auto" style={{ maxWidth: "60%" }}>
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

            {/* Editor */}
            <div 
              className="rounded-lg border p-6"
              style={{
                backgroundColor: "#FFFCF5",
                borderColor: "#D4CFC8"
              }}
            >
              <ContentEditor
                content={editableContent}
                onChange={setEditableContent}
                placeholder="Your content will appear here..."
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Assistant */}
        <div 
          className="w-[40%] border-l overflow-hidden flex-col"
          style={{ 
            borderColor: "#D4CFC8",
            backgroundColor: "#1A1816"
          }}
        >
          <div className="p-6">
            <h3 className="text-xl font-serif mb-4" style={{ color: "#F5F1E8" }}>
              Editorial Assistant
            </h3>
            <p className="text-sm" style={{ color: "#A8A39E" }}>
              Your AI-powered editing assistant is here to help you refine your content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
