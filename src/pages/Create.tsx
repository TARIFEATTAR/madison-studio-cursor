import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lightbulb, FileText, PenTool, X, Send, Loader2, Upload, Search, ChevronDown, ChevronUp } from "lucide-react";
import penNibIcon from "@/assets/pen-nib-icon-new.png";
import { createRoot } from "react-dom/client";
import ScriptoraLoadingAnimation from "@/components/forge/ScriptoraLoadingAnimation";
import { TransitionLoader } from "@/components/forge/TransitionLoader";
import { BrandKnowledgeIndicator } from "@/components/forge/BrandKnowledgeIndicator";
import { stripMarkdown } from "@/utils/forgeHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useProducts } from "@/hooks/useProducts";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBrandContext } from "@/hooks/useBrandContext";
import { useToast } from "@/hooks/use-toast";
import { generateSmartName } from "@/lib/promptNaming";
import { detectCategory } from "@/lib/promptCategorization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorksheetUpload } from "@/components/forge/WorksheetUpload";
import { VideoHelpTrigger } from "@/components/help/VideoHelpTrigger";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DELIVERABLE_CATEGORIES, getDeliverableByValue } from "@/config/deliverableFormats";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function Create() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrganizationId } = useOnboarding();
  const { products, loading: productsLoading } = useProducts();
  const { userName } = useUserProfile();
  const { brandName } = useBrandContext(currentOrganizationId);
  const { toast } = useToast();

  
  // Form state
  const [product, setProduct] = useState("");
  const [productData, setProductData] = useState<any>(null);
  const [format, setFormat] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("brand-voice");
  const [additionalContext, setAdditionalContext] = useState("");

  // Load prompt from navigation state if present
  useEffect(() => {
    if (location.state?.prompt) {
      const prompt = location.state.prompt;
      const fieldMappings = location.state?.fieldMappings;
      
      if (fieldMappings) {
        // Smart mapping: populate individual fields
        if (fieldMappings.product) setProduct(fieldMappings.product);
        if (fieldMappings.format) setFormat(fieldMappings.format);
        if (fieldMappings.audience) setAudience(fieldMappings.audience);
        if (fieldMappings.goal) setGoal(fieldMappings.goal);
        if (fieldMappings.additionalContext) {
          setAdditionalContext(fieldMappings.additionalContext);
        } else {
          // Fallback to full prompt text if no specific mapping
          setAdditionalContext(prompt.prompt_text);
        }
        
        toast({
          title: "Template loaded with smart mapping",
          description: `"${prompt.title}" fields auto-populated`,
        });
      } else {
        // Legacy/simple templates: map best-effort and prefill
        // 1) Try full_brief from additional_context
        if (prompt.additional_context?.full_brief) {
          const brief = prompt.additional_context.full_brief;
          if (brief.product_id) setProduct(brief.product_id);
          if (brief.deliverable_format) setFormat(brief.deliverable_format);
          if (brief.target_audience) setAudience(brief.target_audience);
          if (brief.content_goal) setGoal(brief.content_goal);
          if (brief.style_overlay) setStyle(brief.style_overlay);
          if (brief.additional_context) setAdditionalContext(brief.additional_context);
        } else {
          // 2) Map legacy content_type → current deliverable value keys
          const contentTypeValueMap: Record<string, string> = {
            email: 'email_campaign',
            social: 'social_media_post',
            blog: 'blog_article',
            product: 'product_description',
            visual: 'image_prompt'
          };
          if (prompt.content_type && contentTypeValueMap[prompt.content_type]) {
            setFormat(contentTypeValueMap[prompt.content_type]);
          }
          // 3) Always drop the template text into Additional Editorial Direction
          if (prompt.prompt_text) setAdditionalContext(prompt.prompt_text);
        }
        // Surface it to the user and open Advanced Options so they see the text
        setAdvancedOptionsOpen(true);
        toast({
          title: 'Template loaded',
          description: `"${prompt.title}" applied. Edit details in Advanced Options.`,
        });
      }
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Handle URL param for worksheet upload
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('upload') === 'true') {
      setUploadDialogOpen(true);
    }
  }, [location.search]);
  
  // Dialog state
  const [thinkModeExpanded, setThinkModeExpanded] = useState(false);
  const [thinkModeInput, setThinkModeInput] = useState("");
  const [thinkModeMessages, setThinkModeMessages] = useState<Array<{id: string, role: string, content: string}>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showTransitionLoader, setShowTransitionLoader] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [formatPickerOpen, setFormatPickerOpen] = useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);

  const handleSubmit = () => {
    // Only format is required
    if (!format) {
      toast({
        title: "Format required",
        description: "Please select a deliverable format to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Auto-generate name like Image Studio does
    const contentName = generateSmartName({
      deliverable_format: format,
      product_name: productData?.name,
      style_overlay: style,
      goal: goal
    });
    
    // Directly generate content with auto-name
    handleGenerateContent(contentName);
  };

  const handleGenerateContent = async (contentName: string) => {
      const briefData = {
        productId: product && product !== "none" ? product : null,
        productData: product && product !== "none" ? productData : null,
        deliverableFormat: format,
        targetAudience: audience,
        contentGoal: goal,
        styleOverlay: style,
        additionalContext,
        contentName,
        timestamp: Date.now()
      };
    
    localStorage.setItem('madison-content-brief', JSON.stringify(briefData));
    setIsGenerating(true);
    
    // Show loading overlay
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'generating-loader';
    document.body.appendChild(loadingDiv);
    
    // Render the loader component immediately
    const loaderRoot = createRoot(loadingDiv);
    loaderRoot.render(<ScriptoraLoadingAnimation />);

    try {
      // Build AI prompt from brief fields
    const promptParts = [
      product && product !== "none" && `Product: ${product}`,
      `Format: ${format}`,
      audience && `Target Audience: ${audience}`,
      goal && `Content Goal: ${goal}`,
      additionalContext && `\nAdditional Direction: ${additionalContext}`
    ].filter(Boolean).join('\n');

      // Add blog-specific requirements if blog format is selected
      let blogRequirements = '';
      if (format === 'blog_article') {
        blogRequirements = `

BLOG POST REQUIREMENTS:
- Target Length: 1200-1500 words minimum (this is critical - do not write shorter articles)
- Structure: Use three-act structure throughout:
  * ACT I (15%): Opening hook that establishes emotional context and makes the reader lean in
  * ACT II (70%): Core exploration with 2-3 H2 subheadings, concrete examples, evidence, and narrative flow
  * ACT III (15%): Synthesis with key takeaway and clear call to reflection
- Include substantive, researched content with depth and insight
- Maintain narrative flow and brand voice throughout
- Use proper H2 headers (##) for main sections
- Provide concrete examples and avoid surface-level commentary

CRITICAL: This must be a full-length blog article of 1200-1500 words. Do not summarize or abbreviate.`;
      }

      const fullPrompt = `${promptParts}${blogRequirements}\n\n[EXECUTE THIS BRIEF IMMEDIATELY. OUTPUT ONLY THE FINAL COPY. NO QUESTIONS OR ANALYSIS.]`;

      // ENHANCED AUTO-SAVE: Capture rich metadata for intelligent reuse
      try {
        // Generate smart name
        const autoGeneratedName = generateSmartName({
          deliverable_format: format,
          product_name: productData?.name,
          style_overlay: style,
          goal: goal
        });

        // Detect category using client-side rules
        const category = detectCategory({
          deliverable_format: format,
          goal: goal,
          audience: audience,
          style_overlay: style,
          custom_instructions: additionalContext
        });

        // Build additional context object
        const additionalContextObj = {
          full_brief: {
            product_id: product && product !== "none" ? product : null,
            deliverable_format: format,
            target_audience: audience,
            content_goal: goal,
            style_overlay: style,
            additional_context: additionalContext
          },
          generated_at: new Date().toISOString()
        };

        // Save prompt with rich metadata (cast to any to avoid type issues during migration)
        const promptData: any = {
          // Existing required fields
          title: autoGeneratedName,
          prompt_text: fullPrompt,
          content_type: format.toLowerCase().includes('email') ? 'email' :
                        format.toLowerCase().includes('social') ? 'social' :
                        format.toLowerCase().includes('blog') ? 'blog' :
                        format.toLowerCase().includes('product') ? 'product' : 'other',
          collection: "auto_saved",
          organization_id: currentOrganizationId,
          is_template: false,
          times_used: 1,
          
          // NEW: Rich metadata for intelligent reuse
          product_id: product && product !== "none" ? product : null,
          deliverable_format: format,
          audience: audience,
          goal: goal,
          style_overlay: style,
          custom_instructions: additionalContext,
          additional_context: additionalContextObj,
          auto_generated_name: autoGeneratedName,
          is_auto_saved: true,
          is_favorited: false,
          category: category
        };

        const { error: promptError } = await supabase
          .from("prompts")
          .insert(promptData);

        if (promptError) {
          logger.error("Error saving prompt:", promptError);
          // Don't block user flow - auto-save is best-effort
        }
      } catch (error) {
        logger.error("Auto-save failed:", error);
        // Silently fail - don't interrupt user experience
      }
      
      // Verify authentication before calling edge function
      const { data: { user: authUser }, error: authCheckError } = await supabase.auth.getUser();
      if (authCheckError || !authUser) {
        throw new Error("Authentication required. Please sign in again.");
      }
      
      if (!currentOrganizationId) {
        throw new Error("No organization found. Please complete onboarding first.");
      }
      
      // Verify Supabase URL is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        logger.error("Missing VITE_SUPABASE_URL environment variable");
        throw new Error("Configuration error. Please contact support.");
      }
      
      logger.debug("Calling edge function with:", {
        hasPrompt: !!fullPrompt,
        promptLength: fullPrompt.length,
        organizationId: currentOrganizationId,
        mode: "generate",
        format,
        userId: authUser.id
      });
      
      // Call real AI edge function
      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: { 
          prompt: fullPrompt,
          organizationId: currentOrganizationId,
          mode: "generate",
          styleOverlay: style.toUpperCase().replace(/-/g, '_'),
          productData,
          product_id: product && product !== "none" ? product : null, // Pass product ID for database lookup
          contentType: format // Pass the content type so Madison knows what format to use
        }
      });

      if (error) {
        // Enhanced error handling - try to extract detailed error message
        let errorMessage = error.message || "Failed to send a request to the Edge Function";
        
        // Try to read the error response body if it's a ReadableStream
        if (error.context?.body && error.context.body instanceof ReadableStream) {
          try {
            const reader = error.context.body.getReader();
            const decoder = new TextDecoder();
            let bodyText = '';
            let done = false;
            
            while (!done) {
              const { value, done: streamDone } = await reader.read();
              done = streamDone;
              if (value) {
                bodyText += decoder.decode(value, { stream: true });
              }
            }
            
            if (bodyText) {
              try {
                const parsed = JSON.parse(bodyText);
                if (parsed.error) {
                  errorMessage = parsed.error;
                } else if (parsed.message) {
                  errorMessage = parsed.message;
                }
              } catch (e) {
                // If it's not JSON, use the text as-is (up to 500 chars)
                if (bodyText.length < 500) {
                  errorMessage = bodyText;
                }
              }
            }
          } catch (e) {
            logger.error("Error reading error response stream:", e);
          }
        } else if (error.context?.body) {
          // Handle non-stream body
          try {
            const parsed = typeof error.context.body === 'string' 
              ? JSON.parse(error.context.body) 
              : error.context.body;
            if (parsed.error) {
              errorMessage = parsed.error;
            } else if (parsed.message) {
              errorMessage = parsed.message;
            }
          } catch (e) {
            // If parsing fails, check if body is a string with error info
            if (typeof error.context.body === 'string' && error.context.body.length < 500) {
              errorMessage = error.context.body;
            }
          }
        }
        
        // Check error context for status code
        if (error.context?.status) {
          const status = error.context.status;
          if (status === 401) {
            errorMessage = errorMessage || "Authentication failed. Please sign in again.";
          } else if (status === 403) {
            errorMessage = errorMessage || "You don't have access to this organization. Please check your workspace settings.";
          } else if (status === 404) {
            errorMessage = errorMessage || "Edge function not found. Please contact support.";
          } else if (status === 429) {
            errorMessage = errorMessage || "Rate limit exceeded. Please wait a moment and try again.";
          } else if (status === 402) {
            errorMessage = errorMessage || "AI credits depleted. Please add credits to your workspace in Settings.";
          } else if (status === 500) {
            // For 500 errors, preserve the detailed error message if we got one
            if (!errorMessage || errorMessage.includes('non-2xx')) {
              errorMessage = "Server error occurred. Please try again or contact support.";
            }
          }
        }
        
        // Check for network errors
        if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        
        // Check for CORS errors
        if (error.message?.includes('CORS') || error.message?.includes('cors')) {
          errorMessage = "CORS error. Please contact support.";
        }
        
        logger.error("Edge function error details:", {
          message: error.message,
          context: error.context,
          status: error.context?.status,
          bodyType: error.context?.body?.constructor?.name,
          errorMessage
        });
        
        throw new Error(errorMessage);
      }

      const generatedContent = stripMarkdown(data?.generatedContent || "");
      
      // Save to database (authUser already verified above)
      if (!authUser) throw new Error("Not authenticated");

      // Backup to localStorage immediately
      localStorage.setItem('draft-content-backup', JSON.stringify({
        title: contentName,
        content: generatedContent,
        format,
        timestamp: Date.now()
      }));

      // Remove generating loader
      loaderRoot.unmount();
      const generatingLoader = document.getElementById('generating-loader');
      if (generatingLoader) {
        generatingLoader.remove();
      }

      // Show transition loader
      setShowTransitionLoader(true);

      // Save to database (wait for it to complete)
      const { data: savedContent, error: saveError } = await supabase
        .from('master_content')
        .insert({
          title: contentName,
          full_content: generatedContent,
          content_type: format,
          created_by: authUser.id,
          organization_id: currentOrganizationId,
          status: 'draft'
        })
        .select()
        .single();

      if (saveError) {
        logger.error('Save failed:', saveError);
        toast({
          title: "Content saved locally",
          description: "We'll retry saving to your library shortly.",
        });
      } else {
        // Success - clear local backup
        localStorage.removeItem('draft-content-backup');
      }

      // Navigate immediately with the content ID
      setTimeout(() => {
        navigate("/editor", {
          state: { 
            contentId: savedContent?.id || null,
            content: generatedContent,
            contentType: format,
            productName: product,
            contentName: contentName
          }
        });
      }, 100);

    } catch (error: any) {
      logger.error("Error generating content:", error);
      
      // Extract error message with better handling
      let errorMessage = "Please try again";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show error toast with detailed message
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
      
      // Remove loading overlay
      loaderRoot.unmount();
      const loader = document.getElementById('generating-loader');
      if (loader) loader.remove();
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    // Clear form or navigate back
    navigate("/dashboard");
  };

  const handleLoadPrompt = async (prompt: any) => {
    // Check if this is an auto-saved prompt (has rich metadata) or a legacy template
    const isAutoSaved = prompt.is_auto_saved === true;
    
    if (isAutoSaved) {
      // NEW: Auto-saved prompts have rich metadata
      if (prompt.product_id) {
        setProduct(prompt.product_id);
      }
      if (prompt.deliverable_format) {
        setFormat(prompt.deliverable_format);
      }
      if (prompt.audience) {
        setAudience(prompt.audience);
      }
      if (prompt.goal) {
        setGoal(prompt.goal);
      }
      if (prompt.style_overlay) {
        setStyle(prompt.style_overlay);
      }
      if (prompt.custom_instructions) {
        setAdditionalContext(prompt.custom_instructions);
      }
    } else {
      // LEGACY: Old templates only have content_type and prompt_text
      // Try to parse the additional_context JSONB for backward compatibility
      if (prompt.additional_context?.full_brief) {
        const brief = prompt.additional_context.full_brief;
        if (brief.product_id) setProduct(brief.product_id);
        if (brief.deliverable_format) setFormat(brief.deliverable_format);
        if (brief.target_audience) setAudience(brief.target_audience);
        if (brief.content_goal) setGoal(brief.content_goal);
        if (brief.style_overlay) setStyle(brief.style_overlay);
        if (brief.additional_context) setAdditionalContext(brief.additional_context);
      } else {
        // Very old template with no metadata - just set the format from content_type
        // Map legacy content_type to new deliverable value keys
        const contentTypeValueMap: Record<string, string> = {
          email: 'email_campaign',
          social: 'social_media_post',
          blog: 'blog_article',
          product: 'product_description'
        };
        
        if (prompt.content_type && contentTypeValueMap[prompt.content_type]) {
          setFormat(contentTypeValueMap[prompt.content_type]);
        }
        
        // Always populate the editorial direction with the template text for legacy items
        if (prompt.prompt_text) {
          setAdditionalContext(prompt.prompt_text);
        }
        
        // Show a gentle notice
        toast({
          title: 'Legacy Template loaded',
          description: 'We mapped the format and inserted the template text into Advanced Options.',
          variant: 'default'
        });
      }
    }

    // Update use count
    await supabase
      .from('prompts')
      .update({ 
        times_used: (prompt.times_used || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', prompt.id);

    toast({
      title: "✓ Prompt Loaded",
      description: `Loaded: ${prompt.user_custom_name || prompt.auto_generated_name || prompt.title}`,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWorksheetUploaded = async (uploadId: string) => {
    try {
      // Fetch extracted data
      const { data, error } = await supabase
        .from('worksheet_uploads')
        .select('extracted_data, confidence_scores')
        .eq('id', uploadId)
        .single();

      if (error || !data) {
        toast({
          title: "Error loading worksheet data",
          description: "Please try uploading again",
          variant: "destructive"
        });
        return;
      }

      const extractedData = data.extracted_data as any;
      
      // Auto-fill form fields
      if (extractedData.product) setProduct(extractedData.product);
      if (extractedData.format) setFormat(extractedData.format);
      if (extractedData.audience) setAudience(extractedData.audience);
      if (extractedData.goal) setGoal(extractedData.goal);
      if (extractedData.style) setStyle(extractedData.style);
      if (extractedData.additionalContext) setAdditionalContext(extractedData.additionalContext);

      setUploadDialogOpen(false);

      toast({
        title: "Worksheet loaded!",
        description: "Review and adjust fields as needed, then create your content"
      });

    } catch (error) {
      logger.error('Worksheet load error:', error);
      toast({
        title: "Error loading worksheet",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  };

  const extractThinkModeText = (chunk: any) => {
    const openAIContent = chunk?.choices?.[0]?.delta?.content;
    if (openAIContent) return openAIContent as string;

    const candidate = chunk?.candidates?.[0];
    if (candidate?.content?.parts?.length) {
      return candidate.content.parts
        .map((part: any) => part?.text ?? '')
        .join('');
    }

    const parts = chunk?.message?.content?.parts;
    if (parts?.length) {
      return parts.map((part: any) => part?.text ?? '').join('');
    }

    return '';
  };

  const handleThinkModeSend = async () => {
    if (!thinkModeInput.trim() || isThinking) return;
    
    const userMessage = { 
      id: `think-${Date.now()}-user-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user', 
      content: thinkModeInput 
    };
    setThinkModeMessages(prev => [...prev, userMessage]);
    setThinkModeInput("");
    setIsThinking(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        toast({
          title: "Sign in required",
          description: "Please sign in to use Think Mode.",
          variant: "destructive"
        });
        setIsThinking(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/think-mode-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ 
            messages: [...thinkModeMessages, userMessage],
            userName: userName || undefined,
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          const error = await response.json();
          toast({
            title: "AI Unavailable",
            description: error.error,
            variant: "destructive"
          });
          setIsThinking(false);
          return;
        }
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let aiMessage = "";
      let aiMessageIndex = -1;
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line as data arrives
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);   // handle CRLF
          if (line.startsWith(":") || line.trim() === "") continue; // SSE comments/keepalive
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice(5).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = extractThinkModeText(parsed);
            
            if (content) {
              aiMessage += content;
              
              setThinkModeMessages(prev => {
                const updated = [...prev];
                
                if (aiMessageIndex === -1) {
                  const newMsg = { 
                    id: `think-${Date.now()}-ai-${Math.random().toString(36).substr(2, 9)}`,
                    role: 'assistant', 
                    content: aiMessage 
                  };
                  updated.push(newMsg);
                  aiMessageIndex = updated.length - 1;
                } else {
                  updated[aiMessageIndex].content = aiMessage;
                }
                
                return updated;
              });
            }
          } catch (parseError) {
            // Incomplete JSON split across chunks: put it back and wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush in case remaining buffered lines arrived without trailing newline
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data:")) continue;
          const jsonStr = raw.slice(5).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = extractThinkModeText(parsed);
            if (content) {
              aiMessage += content;
              setThinkModeMessages(prev => {
                const updated = [...prev];
                if (aiMessageIndex !== -1) {
                  updated[aiMessageIndex].content = aiMessage;
                }
                return updated;
              });
            }
          } catch { /* ignore partial leftovers */ }
        }
      }
    } catch (error) {
      logger.error('Think Mode error:', error);
      toast({
        title: "Chat error",
        description: "Failed to connect to AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-vellum-cream">
      <div className={`max-w-5xl mx-auto px-6 py-10 transition-opacity duration-300 ${isGenerating ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* Think Mode - Inline Expandable */}
          {!thinkModeExpanded ? (
            <div
              onClick={() => setThinkModeExpanded(true)}
              className="mb-8 rounded-xl cursor-pointer transition-all hover:opacity-90 bg-parchment-white border-2 border-dashed border-brass"
            >
              <div className="p-6 flex items-center gap-4">
                <Lightbulb className="w-6 h-6 text-brass" />
                <div>
                  <h3 className="font-semibold text-lg text-ink-black">
                    Not sure where to start? Ask Madison
                  </h3>
                  <p className="text-sm text-warm-gray">
                    Brainstorm with your Editorial Director before filling out the brief. No pressure, just ideas.
                  </p>
                </div>
              </div>
            </div>
        ) : (
          <div className="mb-8 rounded-xl overflow-hidden border border-warm-gray/20">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-gradient-to-r from-brass to-brass-glow">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-white" />
                <h3 className="font-semibold text-white">Think Mode with Madison</h3>
              </div>
              <button
                onClick={() => setThinkModeExpanded(false)}
                className="hover:opacity-80 transition-opacity"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 bg-parchment-white">
              <div className="text-center max-w-2xl mx-auto mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brass/10">
                  <Lightbulb className="w-8 h-8 text-brass" />
                </div>
                <h4 className="text-2xl font-serif mb-3 text-ink-black">
                  Madison's here to help
                </h4>
                <p className="text-base text-warm-gray">
                  Share your ideas, questions, or creative direction. Your Editorial Director will help you explore and refine them.
                </p>
              </div>

              {/* Example Prompts */}
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("I need a blog post about seasonal fragrance trends")}
                  className="text-sm border-warm-gray/20 text-warm-gray hover:border-brass hover:text-brass"
                >
                  "I need a blog post about seasonal fragrance trends"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("Help me describe our new product launch")}
                  className="text-sm border-warm-gray/20 text-warm-gray hover:border-brass hover:text-brass"
                >
                  "Help me describe our new product launch"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("What's the best way to tell our brand story?")}
                  className="text-sm border-warm-gray/20 text-warm-gray hover:border-brass hover:text-brass"
                >
                  "What's the best way to tell our brand story?"
                </Button>
              </div>

              {/* Input Area Wrapper */}
              {thinkModeMessages.length > 0 && (
                <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
                  {thinkModeMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-4 rounded-lg ${
                          msg.role === 'user' 
                            ? 'bg-warm-gray/10 text-ink-black' 
                            : 'bg-brass/10 text-ink-black'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-brass/10 p-4 rounded-lg">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-brass rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-brass rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <span className="w-2 h-2 bg-brass rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {thinkModeMessages.length > 0 && (
                <Button
                  onClick={() => {
                    setThinkModeExpanded(false);
                    toast({
                      title: "Fill out the brief below",
                      description: "Use the form to finalize your content request"
                    });
                  }}
                  variant="outline"
                  className="w-full mb-4 border-brass text-brass hover:bg-brass/10"
                >
                  Ready to Fill Out the Brief
                </Button>
              )}

              {/* Input Area */}
              <div className="relative">
                <Textarea
                  value={thinkModeInput}
                  onChange={(e) => setThinkModeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleThinkModeSend();
                    }
                  }}
                  placeholder="Type your thoughts here..."
                  className="min-h-[120px] pr-12 bg-vellum-cream border-warm-gray/20 text-ink-black resize-none"
                />
                <Button
                  onClick={handleThinkModeSend}
                  disabled={!thinkModeInput.trim() || isThinking}
                  variant="brass"
                  className="absolute bottom-3 right-3"
                  size="icon"
                >
                  {isThinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-warm-gray/70 mt-2">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        )}

          {/* Main Form */}
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={penNibIcon} 
                alt="Pen nib icon" 
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-serif font-medium text-ink-black">
                    Create Content
                  </h1>
                  <VideoHelpTrigger videoId="creating-first-content" variant="icon" />
                </div>
                <p className="text-base md:text-lg mt-1 text-warm-gray">
                  Quick brief to generate your content
                </p>
              </div>
            </div>
            
            {/* Quick-fill dropdowns */}
            <div className="flex flex-wrap gap-3 mb-4">
{/* Quick-fill dropdowns moved to Advanced Options to reduce distraction */}
            </div>
            
            <p className="text-base text-warm-gray">
              Fill out the brief below and Madison will craft the perfect content.
            </p>
          </div>

          {/* Form Container */}
          <div className="p-8 rounded-xl border border-warm-gray/20 space-y-8 bg-parchment-white">
            {/* Brand Knowledge Status Indicator */}
            <BrandKnowledgeIndicator organizationId={currentOrganizationId} />
            
            {/* Product - Optional */}
            <div>
              <Label htmlFor="product" className="text-base mb-2 text-ink-black">
                Product <span className="text-warm-gray text-sm font-normal">(Optional)</span>
              </Label>
              <Select 
                value={product} 
                onValueChange={(value) => {
                  setProduct(value);
                  const selectedProduct = products.find(p => p.id === value);
                  setProductData(selectedProduct || null);
                }}
                disabled={productsLoading || products.length === 0}
              >
                <SelectTrigger
                  id="product"
                  className="mt-2 bg-parchment-white border-warm-gray/20"
                >
                  <SelectValue placeholder={
                    productsLoading ? "Loading products..." : 
                    products.length === 0 ? "No products available" : 
                    "Select a product (or leave blank for brand-level copy)"
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto bg-white">
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <span className="text-warm-gray">No specific product (brand-level content)</span>
                </div>
              </SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {products.length === 0 && !productsLoading && (
                <p className="text-xs text-brass mt-2">
                  No products found. Add products in Settings → Products.
                </p>
              )}
            </div>

            {/* Deliverable Format - Required */}
            <div>
              <Label htmlFor="format" className="text-base mb-2 text-ink-black">
                Deliverable Format <span className="text-brass">*</span>
              </Label>
              <Popover open={formatPickerOpen} onOpenChange={setFormatPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={formatPickerOpen}
                    className={cn(
                      "w-full justify-between mt-2 bg-parchment-white border-warm-gray/20 hover:bg-parchment-white/80",
                      !format && "text-muted-foreground"
                    )}
                  >
                    {format ? (
                      <span className="flex items-center gap-2">
                        {(() => {
                          const deliverable = getDeliverableByValue(format);
                          const Icon = deliverable?.icon;
                          return Icon ? <Icon className="h-4 w-4" /> : null;
                        })()}
                        {getDeliverableByValue(format)?.label}
                      </span>
                    ) : (
                      "Select format..."
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0 bg-parchment-white border-warm-gray/20" align="start">
                  <Command className="bg-parchment-white">
                    <CommandInput 
                      placeholder="Search deliverables..." 
                      className="border-none focus:ring-0"
                    />
                    <CommandList className="max-h-[400px]">
                      <CommandEmpty>No deliverable found.</CommandEmpty>
                      {DELIVERABLE_CATEGORIES.map((category) => {
                        const CategoryIcon = category.icon;
                        return (
                          <CommandGroup 
                            key={category.name} 
                            heading={
                              <span className="flex items-center gap-2 text-ink-black/70">
                                <CategoryIcon className="h-4 w-4" />
                                {category.name}
                              </span>
                            }
                          >
                            {category.deliverables.map((deliverable) => {
                              const DeliverableIcon = deliverable.icon;
                              return (
                                <CommandItem
                                  key={deliverable.value}
                                  value={`${deliverable.label} ${deliverable.description}`}
                                  onSelect={() => {
                                    setFormat(deliverable.value);
                                    setFormatPickerOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-start gap-3 w-full">
                                    <DeliverableIcon className="h-4 w-4 mt-0.5 text-brass shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-ink-black">
                                        {deliverable.label}
                                      </div>
                                      <div className="text-xs text-warm-gray/70">
                                        {deliverable.description}
                                      </div>
                                    </div>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        );
                      })}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Target Audience - Optional */}
            <div>
              <Label htmlFor="audience" className="text-base mb-2 text-ink-black">
                Audience <span className="text-warm-gray text-sm font-normal">(Optional)</span>
              </Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger
                  id="audience"
                  className="mt-2 bg-parchment-white border-warm-gray/20"
                >
                  <SelectValue placeholder="Select target audience (or leave blank)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">
                    <span className="text-warm-gray">No specific audience</span>
                  </SelectItem>
                  <SelectItem value="luxury_beauty_enthusiasts">Luxury Beauty Enthusiasts</SelectItem>
                  <SelectItem value="gift_shoppers">Gift Shoppers</SelectItem>
                  <SelectItem value="new_customers">New Customers</SelectItem>
                  <SelectItem value="loyal_customers">Loyal Customers / VIP</SelectItem>
                  <SelectItem value="fragrance_collectors">Fragrance Collectors</SelectItem>
                  <SelectItem value="wellness_seekers">Wellness & Self-Care Seekers</SelectItem>
                  <SelectItem value="eco_conscious">Eco-Conscious Consumers</SelectItem>
                  <SelectItem value="young_professionals">Young Professionals (25-35)</SelectItem>
                  <SelectItem value="mature_luxury">Mature Luxury Buyers (45+)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs italic mt-2 text-warm-gray/70">
                Who is this content for? Helps Madison tailor message and tone
              </p>
            </div>

            {/* Content Goal - Optional */}
            <div>
              <Label htmlFor="goal" className="text-base mb-2 text-ink-black">
                Goal <span className="text-warm-gray text-sm font-normal">(Optional)</span>
              </Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger
                  id="goal"
                  className="mt-2 bg-parchment-white border-warm-gray/20"
                >
                  <SelectValue placeholder="Select content goal (or leave blank)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">
                    <span className="text-warm-gray">No specific goal</span>
                  </SelectItem>
                  <SelectItem value="drive_awareness">Drive Product Awareness</SelectItem>
                  <SelectItem value="build_loyalty">Build Brand Loyalty</SelectItem>
                  <SelectItem value="launch_collection">Launch New Collection</SelectItem>
                  <SelectItem value="increase_conversions">Increase Conversions / Sales</SelectItem>
                  <SelectItem value="educate_customers">Educate Customers</SelectItem>
                  <SelectItem value="seasonal_campaign">Seasonal Campaign / Promotion</SelectItem>
                  <SelectItem value="reengagement">Re-engage Inactive Customers</SelectItem>
                  <SelectItem value="build_community">Build Community / Social Engagement</SelectItem>
                  <SelectItem value="thought_leadership">Establish Thought Leadership</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs italic mt-2 text-warm-gray/70">
                What should this content achieve? Guides Madison on CTA and focus
              </p>
            </div>

            {/* Advanced Options Collapsible */}
            <Collapsible
              open={advancedOptionsOpen}
              onOpenChange={setAdvancedOptionsOpen}
              className="border-t border-warm-gray/20 pt-6"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between hover:bg-brass/5 text-ink-black p-4"
                >
                  <span className="text-base font-medium">
                    Advanced Options
                  </span>
                  {advancedOptionsOpen ? (
                    <ChevronUp className="w-5 h-5 text-brass" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-brass" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-6 pt-4">
                {/* Style Overlay */}
                <div>
                  <Label htmlFor="style" className="text-base mb-2 text-ink-black">
                    Style Overlay
                  </Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger
                      id="style"
                      className="mt-2 bg-parchment-white border-warm-gray/20"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="brand-voice">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {brandName ? `${brandName} Voice` : "Your Brand Voice"}
                          </span>
                          <span className="text-xs text-warm-gray">Your brand's authentic voice</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="poetic">
                        <div className="flex flex-col">
                          <span className="font-medium">J. Peterman Style</span>
                          <span className="text-xs text-warm-gray">Narrative adventure, romantic</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="direct">
                        <div className="flex flex-col">
                          <span className="font-medium">Ogilvy Style</span>
                          <span className="text-xs text-warm-gray">Sophisticated persuasion, factual</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="story">
                        <div className="flex flex-col">
                          <span className="font-medium">Hybrid Narrative</span>
                          <span className="text-xs text-warm-gray">Balanced elegance, versatile</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="minimal">
                        <div className="flex flex-col">
                          <span className="font-medium">Minimal & Modern</span>
                          <span className="text-xs text-warm-gray">Clean, concise, contemporary</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs italic mt-2 text-warm-gray/70">
                    Choose the writing style that best fits your content needs
                  </p>
                </div>

                {/* Additional Editorial Direction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="context" className="text-base text-ink-black">
                      Additional Editorial Direction
                    </Label>
                    <span className="text-xs text-warm-gray/70">
                      {additionalContext.length} / 1000 characters
                    </span>
                  </div>
                  <Textarea
                    id="context"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="Provide specific requirements or creative mandates..."
                    className="mt-2 min-h-[120px] bg-vellum-cream border-warm-gray/20 text-ink-black"
                    maxLength={1000}
                  />
                  <p className="text-xs italic mt-2 text-warm-gray/70">
                    Any specific themes, angles, seasonal notes, or key messages to include (max 1000 characters)
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-warm-gray/20">
            {/* Mobile Layout (< 768px) */}
            <div className="flex flex-col gap-3 md:hidden">
              <Button
                onClick={handleSubmit}
                disabled={!format}
                variant="brass"
                className="w-full gap-2 min-h-[44px]"
              >
                <PenTool className="w-5 h-5" />
                <span>Generate</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="w-full min-h-[44px] text-warm-gray hover:text-charcoal"
              >
                Cancel
              </Button>
              
              <button
                onClick={() => setThinkModeExpanded(true)}
                className="w-full text-sm text-brass hover:underline mt-2"
              >
                Not sure what to write? Try Think Mode
              </button>
              
              <p className="text-xs text-center mt-2 text-warm-gray/70">
                {!format ? (
                  <span className="text-brass">Select a format to continue</span>
                ) : (
                  "Madison will generate complete content based on your brief"
                )}
              </p>
            </div>

            {/* Desktop Layout (≥ 768px) */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-warm-gray hover:text-charcoal"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-right">
                <Button
                  onClick={handleSubmit}
                  disabled={!format}
                  variant="brass"
                  className="gap-2 px-8"
                  size="lg"
                >
                  <PenTool className="w-5 h-5" />
                  <span className="text-base">Generate</span>
                </Button>
                <button
                  onClick={() => setThinkModeExpanded(true)}
                  className="block text-sm text-brass hover:underline mt-2 ml-auto"
                >
                  Not sure what to write? Try Think Mode
                </button>
                <p className="text-xs mt-2 text-warm-gray/70">
                  {!format ? (
                    <span className="text-brass">Select a format to continue</span>
                  ) : (
                    "Madison will generate complete content based on your brief"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs and Loaders */}
      {showTransitionLoader && <TransitionLoader onComplete={() => setShowTransitionLoader(false)} />}
      

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Content Brief Worksheet</DialogTitle>
            <DialogDescription>
              Upload your completed worksheet to auto-fill this form
            </DialogDescription>
          </DialogHeader>
          
          {currentOrganizationId && (
            <WorksheetUpload
              onUploadComplete={handleWorksheetUploaded}
              organizationId={currentOrganizationId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
