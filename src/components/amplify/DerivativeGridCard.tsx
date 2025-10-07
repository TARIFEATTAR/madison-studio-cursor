import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Mail, Instagram, Twitter, Package, MessageSquare, FileText } from "lucide-react";

interface DerivativeGridCardProps {
  derivative: {
    id: string;
    asset_type: string;
    generated_content: string;
    approval_status: string;
  };
  label: string;
  isScheduled?: boolean;
  onClick: () => void;
  typeColor?: string;
}

const DERIVATIVE_ICONS = {
  email: Mail,
  instagram: Instagram,
  twitter: Twitter,
  product: Package,
  sms: MessageSquare,
  email_3part: Mail,
  email_5part: Mail,
  email_7part: Mail,
};

export function DerivativeGridCard({ derivative, label, isScheduled, onClick, typeColor }: DerivativeGridCardProps) {
  const Icon = DERIVATIVE_ICONS[derivative.asset_type as keyof typeof DERIVATIVE_ICONS] || FileText;
  
  // Get status styling with optional type color
  const getStatusStyles = () => {
    // If typeColor provided and status is pending, use type color as accent
    if (typeColor && derivative.approval_status === 'pending') {
      return `border-2 bg-card hover:shadow-lg`;
    }
    
    switch (derivative.approval_status) {
      case 'approved':
        return 'border-forest-ink/40 bg-forest-ink/5 hover:border-forest-ink/60';
      case 'rejected':
        return 'border-muted bg-muted/20 opacity-60 hover:border-muted';
      case 'pending':
      default:
        return 'border-antique-gold/40 bg-antique-gold/5 hover:border-antique-gold/60';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (derivative.approval_status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const base = derivative.generated_content || "";
  const previewText = base.slice(0, 80) + (base.length > 80 ? '...' : '');

  return (
    <Card 
      className={`
        p-5 cursor-pointer transition-all duration-300 
        border-2 hover:shadow-level-2 hover:scale-[1.02]
        ${getStatusStyles()}
      `}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Icon and Badge Row */}
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-lg"
            style={typeColor ? { backgroundColor: `${typeColor}20`, color: typeColor } : {}}
          >
            <Icon className={`h-6 w-6 ${typeColor ? '' : 'text-primary'}`} />
          </div>
          <Badge variant={getStatusBadgeVariant()} className="text-xs capitalize">
            {derivative.approval_status}
          </Badge>
        </div>

        {/* Label */}
        <h4 className="font-serif text-base font-medium text-foreground line-clamp-1">
          {label}
        </h4>

        {/* Preview Text */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {previewText}
        </p>

        {/* Scheduled Indicator */}
        {isScheduled && (
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Scheduled</span>
          </div>
        )}
      </div>
    </Card>
  );
}
