import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  FlaskConical,
  Box,
  FlaskRound,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBusinessType, BusinessType, BUSINESS_TYPE_OPTIONS } from "@/hooks/useBusinessType";

// Icon mapping
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  "flask-conical": FlaskConical,
  box: Box,
  "flask-round": FlaskRound,
};

interface BusinessTypeSelectorProps {
  onSelect?: (businessType: BusinessType) => void;
  showDescription?: boolean;
  compact?: boolean;
  className?: string;
}

export function BusinessTypeSelector({
  onSelect,
  showDescription = true,
  compact = false,
  className,
}: BusinessTypeSelectorProps) {
  const { 
    currentBusinessType, 
    updateBusinessType, 
    isLoading,
    allConfigs,
  } = useBusinessType();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState<BusinessType | null>(null);

  const handleSelect = (businessType: BusinessType) => {
    if (businessType === currentBusinessType) return;
    
    // If already has a business type, confirm change
    if (currentBusinessType) {
      setPendingType(businessType);
      setConfirmDialogOpen(true);
    } else {
      // First time selection, no confirmation needed
      confirmSelection(businessType);
    }
  };

  const confirmSelection = (businessType: BusinessType) => {
    updateBusinessType.mutate(businessType);
    onSelect?.(businessType);
    setConfirmDialogOpen(false);
    setPendingType(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        "grid gap-4",
        compact 
          ? "grid-cols-2 md:grid-cols-4" 
          : "grid-cols-1 md:grid-cols-2",
        className
      )}>
        {BUSINESS_TYPE_OPTIONS.map((option) => {
          const Icon = ICONS[option.icon] || Sparkles;
          const isSelected = currentBusinessType === option.value;
          const config = allConfigs?.find(c => c.business_type === option.value);
          
          return (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all border-2",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-level-2" 
                    : "border-border hover:border-primary/50 hover:shadow-level-1"
                )}
                onClick={() => handleSelect(option.value)}
              >
                <CardHeader className={cn(compact ? "p-3" : "p-4")}>
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    {isSelected && (
                      <Badge variant="default" className="gap-1">
                        <Check className="w-3 h-3" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <CardTitle className={cn(
                    "mt-3",
                    compact ? "text-sm" : "text-base"
                  )}>
                    {option.label}
                  </CardTitle>
                  {showDescription && !compact && (
                    <CardDescription className="mt-1">
                      {option.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                {!compact && config && (
                  <CardContent className="pt-0 pb-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(config.enabled_sections || {})
                        .filter(([_, enabled]) => enabled)
                        .slice(0, 4)
                        .map(([section]) => (
                          <Badge 
                            key={section} 
                            variant="outline" 
                            className="text-xs capitalize"
                          >
                            {section.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      {Object.values(config.enabled_sections || {}).filter(Boolean).length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.values(config.enabled_sections || {}).filter(Boolean).length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Change Business Type?
            </DialogTitle>
            <DialogDescription>
              Changing your business type will update which features and sections 
              are available in Madison Studio. Your existing content will not be deleted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {pendingType && (
                <>
                  {(() => {
                    const option = BUSINESS_TYPE_OPTIONS.find(o => o.value === pendingType);
                    const Icon = option ? ICONS[option.icon] || Sparkles : Sparkles;
                    return (
                      <>
                        <Icon className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{option?.label}</p>
                          <p className="text-sm text-muted-foreground">{option?.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => pendingType && confirmSelection(pendingType)}
              disabled={updateBusinessType.isPending}
            >
              {updateBusinessType.isPending ? "Updating..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Compact inline selector for use in forms
 */
export function BusinessTypeInlineSelector({
  value,
  onChange,
  disabled = false,
}: {
  value?: BusinessType;
  onChange: (value: BusinessType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {BUSINESS_TYPE_OPTIONS.map((option) => {
        const Icon = ICONS[option.icon] || Sparkles;
        const isSelected = value === option.value;
        
        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => onChange(option.value)}
            disabled={disabled}
          >
            <Icon className="w-4 h-4" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
