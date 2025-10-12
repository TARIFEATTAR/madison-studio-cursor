import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Sparkles, Library, Upload } from "lucide-react";

interface QuickStartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartWizard: () => void;
  onShowTemplates: () => void;
  onShowImport: () => void;
}

export function QuickStartModal({
  open,
  onOpenChange,
  onStartWizard,
  onShowTemplates,
  onShowImport,
}: QuickStartModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-serif">Create a Prompt</DialogTitle>
          <DialogDescription>
            Choose how you'd like to get started
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1">
          <div className="grid gap-3 sm:gap-4 mt-4 sm:mt-6">
            {/* Guided Wizard - PRIMARY */}
            <Card
              className="p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg hover:border-[hsl(var(--saffron-gold))] bg-gradient-to-br from-[hsl(var(--saffron-gold)/0.1)] to-[hsl(var(--brass-accent)/0.1)]"
              onClick={onStartWizard}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-[hsl(var(--deep-charcoal))]">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--soft-ivory))]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-serif mb-1 sm:mb-2">🧙‍♀️ Guided Wizard (Recommended)</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Answer 5 quick questions and Madison will build a custom prompt for you. Perfect for first-time users.
                  </p>
                </div>
              </div>
            </Card>

            {/* Start from Template - SECONDARY */}
            <Card
              className="p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg hover:border-border"
              onClick={onShowTemplates}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-[hsl(var(--stone-beige))]">
                  <Library className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--deep-charcoal))]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-serif mb-1 sm:mb-2">📚 Start from Template</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Choose from pre-built templates and customize them to your needs.
                  </p>
                </div>
              </div>
            </Card>

            {/* Import from Spreadsheet - TERTIARY */}
            <Card
              className="p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg hover:border-border"
              onClick={onShowImport}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-[hsl(var(--stone-beige))]">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--deep-charcoal))]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-serif mb-1 sm:mb-2">📊 Import from Spreadsheet</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Already have prompts in Excel or Google Sheets? Import them all at once.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Template Preview Section */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
            <h3 className="text-base sm:text-lg font-serif mb-3 sm:mb-4">Quick Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_TEMPLATES.map((template) => (
                <Card
                  key={template.title}
                  className="p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md hover:border-[hsl(var(--saffron-gold))]"
                  onClick={() => {
                    // TODO: Pre-fill with template
                    onStartWizard();
                  }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{template.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-xs sm:text-sm mb-1">{template.title}</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const QUICK_TEMPLATES = [
  {
    emoji: "🚀",
    title: "Product Launch",
    description: "Announce new products with sophistication",
    category: "Product",
  },
  {
    emoji: "📧",
    title: "Email Newsletter",
    description: "Monthly newsletter with collection highlights",
    category: "Email",
  },
  {
    emoji: "📱",
    title: "Social Media Post",
    description: "Instagram-optimized storytelling captions",
    category: "Social",
  },
  {
    emoji: "✍️",
    title: "Behind the Scenes",
    description: "Editorial content about craftsmanship",
    category: "Editorial",
  },
  {
    emoji: "🏷️",
    title: "Product Description",
    description: "Detailed product page copy",
    category: "Product",
  },
  {
    emoji: "💌",
    title: "Customer Story",
    description: "Feature customer testimonials",
    category: "Editorial",
  },
];
