import { Card } from '@/components/ui/card';
import { ShoppingBag, Share2, Image, Globe, Sparkles } from 'lucide-react';

const GOALS = [
  {
    id: 'etsy-listing',
    icon: ShoppingBag,
    label: 'Etsy Listing',
    description: 'Product showcase, clean background, lifestyle props'
  },
  {
    id: 'facebook-ad',
    icon: Share2,
    label: 'Facebook/Instagram Ad',
    description: 'Bold, eye-catching, persuasive'
  },
  {
    id: 'website-hero',
    icon: Globe,
    label: 'Website Hero Banner',
    description: 'Wide aspect ratio, brand colors, minimal distractions'
  },
  {
    id: 'social-post',
    icon: Sparkles,
    label: 'Social Post',
    description: 'Trendy composition, editorial flair, authentic mood'
  },
  {
    id: 'instagram-post',
    icon: Image,
    label: 'Instagram Feed',
    description: 'Gallery-worthy, polished editorial'
  }
];

interface GoalSelectorProps {
  onSelectGoal: (goalId: string) => void;
}

export function GoalSelector({ onSelectGoal }: GoalSelectorProps) {
  return (
    <Card className="bg-parchment-white border border-charcoal/10 shadow-level-1 p-6">
      <h3 className="font-serif text-xl text-ink-black mb-2">What's your goal?</h3>
      <p className="font-sans text-sm text-charcoal/60 italic mb-6">
        Madison will suggest prompts optimized for your objective
      </p>
      
      <div className="space-y-3">
        {GOALS.map(goal => (
          <button
            key={goal.id}
            onClick={() => onSelectGoal(goal.id)}
            className="w-full text-left p-4 rounded-sm border-2 border-charcoal/10 
                     hover:border-brass/40 transition-all duration-300 
                     hover:shadow-level-2 group bg-parchment-white"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brass/10 flex items-center justify-center 
                            group-hover:bg-brass/20 transition-colors">
                <goal.icon className="w-5 h-5 text-brass" />
              </div>
              <div className="flex-1">
                <h4 className="font-sans font-semibold text-foreground">{goal.label}</h4>
                <p className="text-xs text-charcoal/60 mt-1">{goal.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
