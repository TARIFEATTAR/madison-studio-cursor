import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, ChevronDown } from 'lucide-react';
import { formatRelativeTime } from '@/lib/dateUtils';
import { getCategoryIcon, getCategoryLabel } from '@/lib/promptCategorization';
import { formatPromptName } from '@/lib/promptNaming';

interface RecentPrompt {
  id: string;
  auto_generated_name: string;
  user_custom_name: string | null;
  deliverable_format: string;
  category: string;
  times_used: number;
  created_at: string;
  is_favorited: boolean;
  product_id: string | null;
  audience: string | null;
  goal: string | null;
  style_overlay: string | null;
  custom_instructions: string | null;
}

interface RecentPromptsDropdownProps {
  organizationId: string;
  onSelect: (prompt: RecentPrompt) => void;
}

export function RecentPromptsDropdown({ 
  organizationId, 
  onSelect 
}: RecentPromptsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch recent auto-saved prompts
  const { data: prompts, isLoading } = useQuery({
    queryKey: ['recent-prompts', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_auto_saved', true)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      return data as RecentPrompt[];
    },
    enabled: isOpen, // Only fetch when dropdown is opened
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  // Group prompts: Favorites first, then recent
  const favoritePrompts = prompts?.filter(p => p.is_favorited) || [];
  const recentPrompts = prompts?.filter(p => !p.is_favorited).slice(0, 10) || [];

  const handleSelect = (prompt: RecentPrompt) => {
    onSelect(prompt);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Clock className="h-4 w-4" />
          Load Recent
          {prompts && prompts.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {prompts.length}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[400px] max-w-[calc(100vw-2rem)] bg-background z-50">
        {isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading prompts...
          </div>
        )}

        {!isLoading && (!prompts || prompts.length === 0) && (
          <div className="p-4 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No saved prompts yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create content and Madison will auto-save your prompts
            </p>
          </div>
        )}

        {!isLoading && favoritePrompts.length > 0 && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              <Star className="h-4 w-4 text-brass" />
              Favorites
            </DropdownMenuLabel>
            {favoritePrompts.map((prompt) => (
              <DropdownMenuItem
                key={prompt.id}
                onClick={() => handleSelect(prompt)}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">
                    {formatPromptName(
                      prompt.auto_generated_name,
                      prompt.user_custom_name,
                      45
                    )}
                  </span>
                  {prompt.times_used > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {prompt.times_used}×
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {prompt.category && (
                    <span>
                      {getCategoryIcon(prompt.category)} {getCategoryLabel(prompt.category)}
                    </span>
                  )}
                  <span>•</span>
                  <span>{formatRelativeTime(prompt.created_at)}</span>
                </div>
              </DropdownMenuItem>
            ))}
            {recentPrompts.length > 0 && <DropdownMenuSeparator />}
          </>
        )}

        {!isLoading && recentPrompts.length > 0 && (
          <>
            <DropdownMenuLabel>Recent</DropdownMenuLabel>
            {recentPrompts.map((prompt) => (
              <DropdownMenuItem
                key={prompt.id}
                onClick={() => handleSelect(prompt)}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">
                    {formatPromptName(
                      prompt.auto_generated_name,
                      prompt.user_custom_name,
                      45
                    )}
                  </span>
                  {prompt.times_used > 1 && (
                    <Badge variant="outline" className="text-xs">
                      {prompt.times_used}×
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {prompt.category && (
                    <span>
                      {getCategoryIcon(prompt.category)} {getCategoryLabel(prompt.category)}
                    </span>
                  )}
                  <span>•</span>
                  <span>{formatRelativeTime(prompt.created_at)}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
