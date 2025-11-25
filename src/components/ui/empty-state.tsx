import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: "default" | "outline" | "ghost";
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    children?: React.ReactNode;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    className,
    children,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center",
            className
        )}>
            {Icon && (
                <div className="mb-6 p-4 rounded-full bg-accent/10 border border-border/20">
                    <Icon className="w-12 h-12 text-muted-foreground/60" strokeWidth={1.5} />
                </div>
            )}

            <h2 className="font-serif text-3xl font-semibold text-foreground mb-3 max-w-md">
                {title}
            </h2>

            <p className="text-muted-foreground text-center max-w-md mb-8 text-base leading-relaxed">
                {description}
            </p>

            {children}

            {(action || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    {action && (
                        <Button
                            onClick={action.onClick}
                            variant={action.variant || "default"}
                            size="lg"
                            className="min-w-[200px]"
                        >
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            onClick={secondaryAction.onClick}
                            variant="outline"
                            size="lg"
                            className="min-w-[200px]"
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

interface EmptyStateCardProps extends EmptyStateProps {
    compact?: boolean;
}

export function EmptyStateCard({
    compact = false,
    className,
    ...props
}: EmptyStateCardProps) {
    return (
        <div className={cn(
            "rounded-lg border border-border/40 bg-card",
            compact ? "p-8" : "p-12",
            className
        )}>
            <EmptyState {...props} className={compact ? "py-0" : undefined} />
        </div>
    );
}
