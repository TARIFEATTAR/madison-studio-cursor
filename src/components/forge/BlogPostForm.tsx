import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BLOG_POST_TYPES, type BlogPostType } from "@/config/blogPostGuidelines";

interface BlogPostFormProps {
  blogPostType: BlogPostType;
  blogWordCount: number;
  blogSubject: string;
  blogThemes: string[];
  blogTakeaway: string;
  blogProductConnection: string;
  onTypeChange: (value: BlogPostType) => void;
  onWordCountChange: (value: number) => void;
  onSubjectChange: (value: string) => void;
  onThemesChange: (themes: string[]) => void;
  onTakeawayChange: (value: string) => void;
  onProductConnectionChange: (value: string) => void;
}

export function BlogPostForm({
  blogPostType,
  blogWordCount,
  blogSubject,
  blogThemes,
  blogTakeaway,
  blogProductConnection,
  onTypeChange,
  onWordCountChange,
  onSubjectChange,
  onThemesChange,
  onTakeawayChange,
  onProductConnectionChange,
}: BlogPostFormProps) {
  return (
    <div className="space-y-6 border-t border-border/40 pt-6 mt-6">
      <div className="space-y-2">
        <Label htmlFor="blogType">Blog Post Type</Label>
        <Select
          value={blogPostType}
          onValueChange={(value: BlogPostType) => onTypeChange(value)}
        >
          <SelectTrigger id="blogType" className="bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(BLOG_POST_TYPES).map(([key, type]) => (
              <SelectItem key={key} value={key}>
                {type.label} - {type.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blogWordCount">Target Word Count</Label>
        <Input
          id="blogWordCount"
          type="number"
          value={blogWordCount}
          onChange={(e) => onWordCountChange(parseInt(e.target.value))}
          className="bg-background/50"
        />
        <p className="text-xs text-muted-foreground">
          Recommended: {BLOG_POST_TYPES[blogPostType].wordCountRange[0]}-{BLOG_POST_TYPES[blogPostType].wordCountRange[1]} words
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blogSubject">Subject/Topic *</Label>
        <Textarea
          id="blogSubject"
          value={blogSubject}
          onChange={(e) => {
            const target = e.target;
            const cursorPosition = target.selectionStart;
            const value = target.value;
            onSubjectChange(value);
            requestAnimationFrame(() => {
              if (target) {
                target.setSelectionRange(cursorPosition, cursorPosition);
              }
            });
          }}
          placeholder="Describe what the post is about in 2-3 sentences..."
          className="bg-background/50 min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Key Themes (3 themes)</Label>
        {blogThemes.map((theme, idx) => (
          <Input
            key={idx}
            value={theme}
            onChange={(e) => {
              const newThemes = [...blogThemes];
              newThemes[idx] = e.target.value;
              onThemesChange(newThemes);
            }}
            placeholder={`Theme ${idx + 1}`}
            className="bg-background/50"
          />
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="blogTakeaway">Core Takeaway *</Label>
        <Textarea
          id="blogTakeaway"
          value={blogTakeaway}
          onChange={(e) => {
            const target = e.target;
            const cursorPosition = target.selectionStart;
            const value = target.value;
            onTakeawayChange(value);
            requestAnimationFrame(() => {
              if (target) {
                target.setSelectionRange(cursorPosition, cursorPosition);
              }
            });
          }}
          placeholder="What should readers remember after reading?"
          className="bg-background/50 min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blogProductConnection">Product Connection (Optional)</Label>
        <Textarea
          id="blogProductConnection"
          value={blogProductConnection}
          onChange={(e) => {
            const target = e.target;
            const cursorPosition = target.selectionStart;
            const value = target.value;
            onProductConnectionChange(value);
            requestAnimationFrame(() => {
              if (target) {
                target.setSelectionRange(cursorPosition, cursorPosition);
              }
            });
          }}
          placeholder="How does this relate to specific products?"
          className="bg-background/50 min-h-[80px]"
        />
      </div>
    </div>
  );
}