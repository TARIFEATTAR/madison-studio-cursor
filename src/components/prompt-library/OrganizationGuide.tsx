import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Check, Star, Clock, Folder, Hash } from "lucide-react";

interface OrganizationGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationGuide({ open, onOpenChange }: OrganizationGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif">How the Prompt Library Works</DialogTitle>
          <p className="text-muted-foreground mt-2">
            Your prompts, perfectly organized • No more scattered spreadsheets
          </p>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          {/* Visual Hierarchy */}
          <section>
            <h3 className="text-xl font-serif mb-4">Organization Structure</h3>
            <Card className="p-6 bg-[hsl(var(--stone-beige)/0.2)]">
              <pre className="text-sm font-mono whitespace-pre">
{`Prompt Library
├── 🌟 Quick Access (Zero-decision access)
│   ├── ⭐ Favorites
│   ├── 🕐 Recently Used
│   └── 📊 Most Used
│
├── 📁 Collections (User-created folders)
│   ├── 🚀 Product Launches
│   ├── 📱 Social Media
│   └── ... (custom collections)
│
└── # Categories (System tags)
    ├── Product
    ├── Editorial
    └── ... (all categories)`}
              </pre>
            </Card>
          </section>

          {/* Collections vs Categories */}
          <section>
            <h3 className="text-xl font-serif mb-4">Collections vs Categories</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Folder className="w-6 h-6 text-[hsl(var(--saffron-gold))]" />
                  <div>
                    <h4 className="font-semibold mb-1">Collections</h4>
                    <p className="text-sm text-muted-foreground">
                      User-created project folders
                    </p>
                  </div>
                </div>
                <p className="text-sm">
                  Organize prompts by campaigns, seasons, or projects. Example: "Holiday 2024 Campaign", "Product Launch Q1"
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Hash className="w-6 h-6 text-[hsl(var(--saffron-gold))]" />
                  <div>
                    <h4 className="font-semibold mb-1">Categories</h4>
                    <p className="text-sm text-muted-foreground">
                      System-wide content type tags
                    </p>
                  </div>
                </div>
                <p className="text-sm">
                  Automatic classification by content type. Example: Email, Social, Product, Editorial
                </p>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Example:</strong> A "Product Launch" prompt can be in the "Email Campaigns" collection with the "Email" category
            </p>
          </section>

          {/* Benefits */}
          <section>
            <h3 className="text-xl font-serif mb-4">Benefits Over Spreadsheets</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {BENEFITS.map((benefit, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h3 className="text-xl font-serif mb-4">Best Practices</h3>
            <Card className="p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Folder className="w-5 h-5 text-[hsl(var(--saffron-gold))] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Create collections for campaigns or projects</p>
                  <p className="text-sm text-muted-foreground">Keep related prompts together</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-[hsl(var(--saffron-gold))] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Use favorites for your go-to prompts</p>
                  <p className="text-sm text-muted-foreground">Quick access to what works best</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-[hsl(var(--saffron-gold))] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Let categories auto-organize by content type</p>
                  <p className="text-sm text-muted-foreground">Automatic organization without effort</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[hsl(var(--saffron-gold))] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Review "Recently Used" to track what's working</p>
                  <p className="text-sm text-muted-foreground">See your content patterns</p>
                </div>
              </div>
            </Card>
          </section>

          {/* AI Features */}
          <section>
            <h3 className="text-xl font-serif mb-4">AI-Powered Features</h3>
            <Card className="p-6 bg-gradient-to-br from-[hsl(var(--saffron-gold)/0.1)] to-[hsl(var(--brass-accent)/0.1)]">
              <div className="space-y-3">
                <p className="text-sm">✨ Madison suggests improvements to prompts</p>
                <p className="text-sm">✨ Auto-categorization based on content</p>
                <p className="text-sm">✨ Find similar prompts automatically</p>
                <p className="text-sm">✨ Generate variations of existing prompts</p>
              </div>
            </Card>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const BENEFITS = [
  "Everything in one place",
  "Visual organization at a glance",
  "Quick access to frequently used prompts",
  "AI-powered suggestions (Madison)",
  "Easy to add, move, or reorganize",
  "Search across all prompts instantly",
  "Track usage and effectiveness",
  "Version control for prompts",
];
