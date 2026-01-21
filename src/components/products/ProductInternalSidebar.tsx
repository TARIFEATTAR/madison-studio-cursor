/**
 * ProductInternalSidebar - Vertical navigation sidebar for single product view
 *
 * This component replaces the horizontal tab bar with a vertical navigation structure
 * to reduce cognitive load and provide better organization of product sections.
 *
 * LIFT AND SHIFT REFACTOR:
 * - This component ONLY handles navigation display
 * - NO business logic, data fetching, or state management
 * - Existing tab containers will be routed to, not embedded here
 */

import { cn } from "@/lib/utils";
import {
    FileText,
    ListTodo,
    Image as ImageIcon,
    Layers,
    DollarSign,
    Beaker,
    Package,
    Sparkles,
    Lock,
    Eye,
    ChevronRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    section: string;
    description?: string;
}

interface ProductInternalSidebarProps {
    productId: string;
    productName: string;
    activeSection: string;
    onSectionChange: (sectionId: string) => void;
    /** Map of section ID to access level: 'full' | 'view' | 'none' */
    accessLevels?: Record<string, 'full' | 'view' | 'none'>;
    className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const NAV_ITEMS: NavItem[] = [
    {
        id: "core",
        label: "Core Details",
        icon: FileText,
        section: "info",
        description: "Basic product information"
    },
    {
        id: "tasks",
        label: "Tasks",
        icon: ListTodo,
        section: "info",
        description: "Product-related tasks"
    },
    {
        id: "media",
        label: "Media",
        icon: ImageIcon,
        section: "media",
        description: "Images and gallery"
    },
    {
        id: "variants",
        label: "Variants & Pricing",
        icon: Layers,
        section: "info",
        description: "SKUs, sizes, and pricing"
    },
    {
        id: "formulation",
        label: "Scent Profile",
        icon: Beaker,
        section: "formulation",
        description: "Notes, longevity, sillage"
    },
    {
        id: "ingredients",
        label: "Ingredients",
        icon: Beaker,
        section: "ingredients",
        description: "INCI list and materials"
    },
    {
        id: "sds",
        label: "Compliance / SDS",
        icon: FileText,
        section: "compliance",
        description: "Safety data sheets"
    },
    {
        id: "packaging",
        label: "Packaging",
        icon: Package,
        section: "packaging",
        description: "Packaging specifications"
    },
    {
        id: "content",
        label: "Content",
        icon: Sparkles,
        section: "marketing",
        description: "Generated content"
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// NAV ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface NavItemButtonProps {
    item: NavItem;
    isActive: boolean;
    accessLevel: 'full' | 'view' | 'none';
    onClick: () => void;
}

function NavItemButton({ item, isActive, accessLevel, onClick }: NavItemButtonProps) {
    const Icon = item.icon;
    const isViewOnly = accessLevel === 'view';
    const isHidden = accessLevel === 'none';

    if (isHidden) return null;

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group",
                "hover:bg-muted/50",
                isActive && "bg-primary/10 border-l-2 border-primary",
                !isActive && "border-l-2 border-transparent"
            )}
        >
            <Icon className={cn(
                "w-4 h-4 flex-shrink-0",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        {item.label}
                    </span>

                    {isViewOnly && (
                        <Eye className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                </div>

                {item.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.description}
                    </p>
                )}
            </div>

            <ChevronRight className={cn(
                "w-4 h-4 flex-shrink-0 transition-transform",
                isActive ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100"
            )} />
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SIDEBAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ProductInternalSidebar({
    productId,
    productName,
    activeSection,
    onSectionChange,
    accessLevels = {},
    className,
}: ProductInternalSidebarProps) {
    // Get access level for an item, default to 'full' if not specified
    const getAccessLevel = (item: NavItem): 'full' | 'view' | 'none' => {
        return accessLevels[item.section] || 'full';
    };

    // Filter visible items based on access
    const visibleItems = NAV_ITEMS.filter(item => getAccessLevel(item) !== 'none');

    return (
        <nav
            className={cn(
                "w-56 flex-shrink-0 bg-card border-r border-border",
                className
            )}
            aria-label="Product sections"
        >
            {/* Section Header */}
            <div className="px-4 py-3 border-b border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Product Sections
                </h3>
            </div>

            {/* Navigation Items */}
            <div className="p-2 space-y-1">
                {visibleItems.map((item) => (
                    <NavItemButton
                        key={item.id}
                        item={item}
                        isActive={activeSection === item.id}
                        accessLevel={getAccessLevel(item)}
                        onClick={() => onSectionChange(item.id)}
                    />
                ))}
            </div>

            {/* Quick Access Footer */}
            <div className="mt-auto p-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-primary/50" />
                        Full access sections
                    </p>
                    <p className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3" />
                        View only
                    </p>
                </div>
            </div>
        </nav>
    );
}

export default ProductInternalSidebar;
