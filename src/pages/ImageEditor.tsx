import { useState } from 'react';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GoalSelector } from '@/components/image-editor/GoalSelector';
import { PromptSuggestions } from '@/components/image-editor/PromptSuggestions';
import { ImagePreview } from '@/components/image-editor/ImagePreview';
import { RefinementChat } from '@/components/image-editor/RefinementChat';
import { ExportOptions } from '@/components/image-editor/ExportOptions';
import { ReferenceUpload } from '@/components/image-editor/ReferenceUpload';
import { useImagePromptBuilder } from '@/hooks/useImagePromptBuilder';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentOrganizationId } from '@/hooks/useIndustryConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import madisonInsignia from '@/assets/madison-insignia-new.png';

export default function ImageEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();

  // Workflow state
  const [step, setStep] = useState<'goal' | 'prompts' | 'preview' | 'refine'>('goal');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceDescription, setReferenceDescription] = useState<string>('');
  
  // Generation state
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; description: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Export state
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const { buildPromptOptions, refinePrompt, loading: contextLoading } = useImagePromptBuilder(
    selectedGoal,
    productName
  );

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    setStep('prompts');
  };

  const handlePromptSelect = async (prompt: string, templateKey: string) => {
    setSelectedPrompt(prompt);
    setSelectedTemplate(templateKey);
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-madison-image', {
        body: {
          prompt,
          organizationId: orgId,
          userId: user?.id,
          goalType: selectedGoal,
          aspectRatio,
          outputFormat,
          selectedTemplate: templateKey,
          userRefinements: null
        }
      });

      if (error) throw error;

      setGeneratedImages([{ url: data.imageUrl, description: data.description }]);
      setStep('preview');
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefinement = async (refinementText: string) => {
    const refinedPrompt = refinePrompt(selectedPrompt, refinementText);
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-madison-image', {
        body: {
          prompt: refinedPrompt,
          organizationId: orgId,
          userId: user?.id,
          goalType: selectedGoal,
          aspectRatio,
          outputFormat,
          selectedTemplate,
          userRefinements: refinementText
        }
      });

      if (error) throw error;

      setGeneratedImages(prev => [...prev, { url: data.imageUrl, description: data.description }]);
      toast.success('Refined image generated!');
    } catch (error) {
      console.error('Refinement error:', error);
      toast.error('Failed to refine image.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-vellum-cream">
      {/* Header */}
      <div className="relative border-b border-charcoal/10 bg-parchment-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <img 
                  src={madisonInsignia} 
                  alt="Madison" 
                  className="w-8 h-8 object-contain opacity-80"
                />
                <h1 className="font-serif text-2xl md:text-3xl text-ink-black">
                  Madison Image Studio
                </h1>
              </div>
              <p className="font-sans text-sm text-charcoal/60 italic">
                Guided image generation for your brand
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Wand2 className="w-4 h-4 mr-2" />
              Ask Madison
            </Button>
          </div>
        </div>
        
        {/* Brass accent line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-40"
          style={{ 
            background: `linear-gradient(to right, transparent, hsl(var(--brass)), transparent)`
          }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {step === 'goal' && (
              <>
                <GoalSelector onSelectGoal={handleGoalSelect} />
                <ReferenceUpload
                  onUpload={(url, desc) => {
                    setReferenceImage(url);
                    setReferenceDescription(desc);
                  }}
                />
              </>
            )}

            {step === 'prompts' && !contextLoading && (
              <PromptSuggestions
                options={buildPromptOptions(referenceDescription)}
                onSelectPrompt={handlePromptSelect}
                isGenerating={isGenerating}
              />
            )}

            {(step === 'preview' || step === 'refine') && (
              <>
                <ExportOptions
                  aspectRatio={aspectRatio}
                  outputFormat={outputFormat}
                  onAspectRatioChange={setAspectRatio}
                  onOutputFormatChange={(value) => setOutputFormat(value as 'png' | 'jpeg' | 'webp')}
                />
                <RefinementChat
                  onRefine={handleRefinement}
                  isGenerating={isGenerating}
                />
              </>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <ImagePreview
              images={generatedImages}
              isGenerating={isGenerating}
              referenceImage={referenceImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
