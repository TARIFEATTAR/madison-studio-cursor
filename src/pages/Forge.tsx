import { useState } from "react";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const Forge = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [formData, setFormData] = useState({
    contentType: "",
    collection: "",
    dipWeek: "",
    scentFamily: "",
    pillar: "",
    transparencyStatement: "",
    customInstructions: "",
  });

  const generatePrompt = () => {
    const parts = [];
    
    if (formData.pillar) {
      parts.push(`Focus on the ${formData.pillar} pillar.`);
    }
    
    if (formData.dipWeek) {
      const worlds: Record<string, string> = {
        "1": "Silk Road - Emphasize identity, anchoring, grounding language",
        "2": "Maritime Voyage - Weave journey, gathering, companion imagery",
        "3": "Imperial Garden - Invoke ritual, remembrance, preservation themes",
        "4": "Royal Court - Highlight cadence, rhythm, measured presence",
      };
      parts.push(worlds[formData.dipWeek]);
    }

    if (formData.scentFamily) {
      parts.push(`Scent profile: ${formData.scentFamily} family.`);
    }

    if (formData.transparencyStatement) {
      parts.push(`\n\nTransparency: ${formData.transparencyStatement}`);
    }

    if (formData.customInstructions) {
      parts.push(`\n\n${formData.customInstructions}`);
    }

    return parts.join(" ");
  };

  const generatedPrompt = generatePrompt();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast({
      title: "Prompt copied",
      description: "The crafted prompt has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const testWithClaude = async () => {
    if (!generatedPrompt) {
      toast({
        title: "This vessel requires refinement",
        description: "Please craft a prompt first before testing with Claude.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setGeneratedOutput("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: { prompt: generatedPrompt }
      });

      if (error) throw error;

      if (data?.generatedContent) {
        setGeneratedOutput(data.generatedContent);
        toast({
          title: "Content crafted",
          description: "Claude has generated your content successfully.",
        });
      }
    } catch (error) {
      console.error('Error generating with Claude:', error);
      toast({
        title: "This vessel requires refinement",
        description: error instanceof Error ? error.message : "Failed to generate content with Claude.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto codex-spacing">
        <div className="fade-enter mb-12">
          <h1 className="text-foreground mb-3">The Forge</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Craft new prompts with brand guardrails, or refine existing vessels of the Confident Whisper.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form Builder */}
          <div className="fade-enter space-y-6">
            <div className="card-matte p-8 rounded-lg border border-border/40">
              <h2 className="mb-6 text-2xl">Prompt Elements</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                  >
                    <SelectTrigger id="contentType" className="bg-background/50">
                      <SelectValue placeholder="Select content type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Description</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="visual">Visual Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection">Collection</Label>
                  <Select
                    value={formData.collection}
                    onValueChange={(value) => {
                      const transparencyStatements: Record<string, string> = {
                        cadence: "From the Cadence Collection—blended with natural ingredients and modern aromachemicals for balanced complexity.",
                        reserve: "From the Reserve Collection—crafted with 90-98% natural essences, minimal aromachemicals for refinement.",
                        purity: "From the Purity Collection—100% natural, no aromachemicals. Traditional attar art in its purest form.",
                        sacred: "From Sacred Space—ceremonial blends honoring ritual and reverence.",
                      };
                      setFormData({ 
                        ...formData, 
                        collection: value,
                        transparencyStatement: transparencyStatements[value] || ""
                      });
                    }}
                  >
                    <SelectTrigger id="collection" className="bg-background/50">
                      <SelectValue placeholder="Select collection..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cadence">Cadence Collection</SelectItem>
                      <SelectItem value="reserve">Reserve Collection</SelectItem>
                      <SelectItem value="purity">Purity Collection</SelectItem>
                      <SelectItem value="sacred">Sacred Space</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dipWeek">DIP Week Assignment</Label>
                  <Select
                    value={formData.dipWeek}
                    onValueChange={(value) => setFormData({ ...formData, dipWeek: value })}
                  >
                    <SelectTrigger id="dipWeek" className="bg-background/50">
                      <SelectValue placeholder="Select week..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Week 1: Identity / Silk Road</SelectItem>
                      <SelectItem value="2">Week 2: Memory / Maritime Voyage</SelectItem>
                      <SelectItem value="3">Week 3: Remembrance / Imperial Garden</SelectItem>
                      <SelectItem value="4">Week 4: Cadence / Royal Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scentFamily">Scent Family (Optional)</Label>
                  <Select
                    value={formData.scentFamily}
                    onValueChange={(value) => setFormData({ ...formData, scentFamily: value })}
                  >
                    <SelectTrigger id="scentFamily" className="bg-background/50">
                      <SelectValue placeholder="Select scent family..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warm">🔥 Warm</SelectItem>
                      <SelectItem value="Floral">🌸 Floral</SelectItem>
                      <SelectItem value="Fresh">🍃 Fresh</SelectItem>
                      <SelectItem value="Woody">🌲 Woody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pillar">Pillar Focus (Optional)</Label>
                  <Select
                    value={formData.pillar}
                    onValueChange={(value) => setFormData({ ...formData, pillar: value })}
                  >
                    <SelectTrigger id="pillar" className="bg-background/50">
                      <SelectValue placeholder="Select pillar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Identity">Identity (Anchoring, Grounding)</SelectItem>
                      <SelectItem value="Memory">Memory (Journey, Gathering)</SelectItem>
                      <SelectItem value="Remembrance">Remembrance (Ritual, Preservation)</SelectItem>
                      <SelectItem value="Cadence">Cadence (Rhythm, Presence)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transparency">Transparency Statement</Label>
                  <Textarea
                    id="transparency"
                    value={formData.transparencyStatement}
                    onChange={(e) => setFormData({ ...formData, transparencyStatement: e.target.value })}
                    placeholder="Auto-populated based on collection..."
                    className="bg-background/50 min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom">Custom Instructions</Label>
                  <Textarea
                    id="custom"
                    value={formData.customInstructions}
                    onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                    placeholder="Add specific requirements or creative direction..."
                    className="bg-background/50 min-h-[120px]"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-border/40">
                  <Label>Meta-Instructions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lexical" defaultChecked />
                      <label htmlFor="lexical" className="text-sm text-muted-foreground cursor-pointer">
                        Enforce Lexical Mandate (block forbidden terms)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="wordLimit" defaultChecked />
                      <label htmlFor="wordLimit" className="text-sm text-muted-foreground cursor-pointer">
                        Apply 150-word limit (product descriptions)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="redundancy" defaultChecked />
                      <label htmlFor="redundancy" className="text-sm text-muted-foreground cursor-pointer">
                        Check for redundancy vs. recent outputs
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="fade-enter">
            <div className="card-matte p-8 rounded-lg border border-border/40 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Crafted Prompt</h2>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-background/50 rounded-md p-6 min-h-[400px] font-mono text-sm leading-relaxed border border-border/30">
                {generatedPrompt || (
                  <p className="text-muted-foreground italic">
                    Your prompt will materialize here as you craft it...
                  </p>
                )}
              </div>

              {generatedOutput && (
                <div className="mt-6">
                  <h3 className="text-lg font-serif mb-3">Generated Output</h3>
                  <div className="bg-background/50 rounded-md p-6 min-h-[200px] leading-relaxed border border-border/30">
                    <p className="text-foreground whitespace-pre-wrap">{generatedOutput}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button 
                  className="btn-craft flex-1" 
                  onClick={testWithClaude}
                  disabled={generating || !generatedPrompt}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Crafting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Test with Claude
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1">
                  Save to Reservoir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forge;
