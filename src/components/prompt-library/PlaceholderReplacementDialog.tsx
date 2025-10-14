import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface PlaceholderValue {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
}

interface PlaceholderReplacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptText: string;
  wizardDefaults?: Record<string, string>;
  onConfirm: (replacedText: string, placeholderValues: Record<string, string>) => void;
}

/**
 * Extract placeholders from prompt text
 * Matches patterns like {{PLACEHOLDER_NAME}}
 */
function extractPlaceholders(text: string, wizardDefaults?: Record<string, string>): PlaceholderValue[] {
  const regex = /\{\{([A-Z_]+)\}\}/g;
  const matches = [...text.matchAll(regex)];
  const uniqueKeys = [...new Set(matches.map(m => m[1]))];
  
  // Map placeholder keys to wizard_defaults keys
  const keyMap: Record<string, string> = {
    "CONTENT_TYPE": "content_type",
    "PURPOSE": "purpose",
    "TONE": "tone",
    "KEY_ELEMENTS": "key_elements",
    "CONSTRAINTS": "constraints",
  };
  
  return uniqueKeys.map(key => ({
    key,
    label: formatPlaceholderLabel(key),
    value: (wizardDefaults && wizardDefaults[keyMap[key]]) || "",
    multiline: key.includes("ELEMENTS") || key.includes("CONSTRAINTS") || key.includes("INSTRUCTIONS") || key.includes("PURPOSE")
  }));
}

/**
 * Convert PLACEHOLDER_NAME to readable label
 */
function formatPlaceholderLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Replace all placeholders in text with provided values
 */
function replacePlaceholders(text: string, values: Record<string, string>): string {
  let result = text;
  Object.entries(values).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value);
  });
  return result;
}

export function PlaceholderReplacementDialog({
  open,
  onOpenChange,
  promptText,
  wizardDefaults,
  onConfirm
}: PlaceholderReplacementDialogProps) {
  const [placeholders, setPlaceholders] = useState<PlaceholderValue[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (open) {
      const extracted = extractPlaceholders(promptText, wizardDefaults);
      setPlaceholders(extracted);
    }
  }, [open, promptText, wizardDefaults]);

  useEffect(() => {
    // Check if all placeholders have values
    const allFilled = placeholders.every(p => p.value.trim().length > 0);
    setIsValid(allFilled);
  }, [placeholders]);

  const handleValueChange = (key: string, value: string) => {
    setPlaceholders(prev =>
      prev.map(p => (p.key === key ? { ...p, value } : p))
    );
  };

  const handleConfirm = () => {
    const values = placeholders.reduce((acc, p) => {
      acc[p.key] = p.value;
      return acc;
    }, {} as Record<string, string>);

    const replacedText = replacePlaceholders(promptText, values);
    onConfirm(replacedText, values);
    onOpenChange(false);
  };

  const handleSkip = () => {
    // User can skip and use the prompt as-is with placeholders intact
    onConfirm(promptText, {});
    onOpenChange(false);
  };

  if (placeholders.length === 0) {
    // No placeholders, auto-confirm
    if (open) {
      onConfirm(promptText, {});
      onOpenChange(false);
    }
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#FFFCF5]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-serif text-[#1A1816]">
            <Sparkles className="w-6 h-6 text-[#B8956A]" />
            Customize Your Prompt
          </DialogTitle>
          <p className="text-sm text-[#6B6560] mt-2">
            Fill in the details below to personalize this template for your specific needs.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Placeholder Syntax:</strong> Use <code className="px-1 py-0.5 bg-white rounded text-xs">&#123;&#123;PLACEHOLDER_NAME&#125;&#125;</code> in your prompts to make them reusable. Avoid <code className="px-1 py-0.5 bg-white rounded text-xs">[BRACKETS]</code> - they won't be recognized.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {placeholders.map((placeholder) => (
            <div key={placeholder.key} className="space-y-2">
              <Label 
                htmlFor={placeholder.key}
                className="text-sm font-medium text-[#2F2A26]"
              >
                {placeholder.label}
              </Label>
              {placeholder.multiline ? (
                <Textarea
                  id={placeholder.key}
                  value={placeholder.value}
                  onChange={(e) => handleValueChange(placeholder.key, e.target.value)}
                  placeholder={`Enter ${placeholder.label.toLowerCase()}...`}
                  className="min-h-[100px] bg-white border-2 border-[#D4CFC8] focus:border-[#B8956A] rounded-lg text-[#2F2A26] placeholder:text-[#A8A39E]"
                />
              ) : (
                <Input
                  id={placeholder.key}
                  value={placeholder.value}
                  onChange={(e) => handleValueChange(placeholder.key, e.target.value)}
                  placeholder={`Enter ${placeholder.label.toLowerCase()}...`}
                  className="bg-white border-2 border-[#D4CFC8] focus:border-[#B8956A] rounded-lg text-[#2F2A26] placeholder:text-[#A8A39E]"
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="border-2 border-[#D4CFC8] text-[#6B6560] hover:bg-[#F5F1E8]"
          >
            Use As-Is
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="bg-gradient-to-r from-[#B8956A] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B8956A] text-white disabled:opacity-50"
          >
            Apply & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
