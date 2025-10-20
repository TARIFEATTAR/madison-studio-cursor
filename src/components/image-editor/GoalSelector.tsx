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
  selectedGoal?: string;
  onSelectGoal: (goalId: string) => void;
}

export function GoalSelector({ selectedGoal, onSelectGoal }: GoalSelectorProps) {
  return (
    <div className="space-y-2">
      {GOALS.map(goal => (
        <button
          key={goal.id}
          onClick={() => onSelectGoal(goal.id)}
          className={`w-full text-left px-4 py-3 rounded border-2 transition-all duration-200 ${
            selectedGoal === goal.id
              ? 'border-brass bg-brass/5 shadow-sm'
              : 'border-charcoal/10 hover:border-brass/40 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              selectedGoal === goal.id ? 'bg-brass/20' : 'bg-brass/10'
            }`}>
              <goal.icon className="w-4 h-4 text-brass" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">{goal.label}</h4>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
