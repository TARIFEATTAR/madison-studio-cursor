/**
 * ProductContextLayout - New layout wrapper for single product view
 *
 * This component provides the structural layout for the refactored product view:
 * - Left: ProductInternalSidebar (vertical navigation)
 * - Center: Main content area (where existing containers render)
 * - Right: Existing sidebar (status, quick actions)
 *
 * LIFT AND SHIFT REFACTOR:
 * - This component ONLY handles layout structure
 * - NO business logic changes to child components
 * - Existing components are lifted into this new structure unchanged
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProductInternalSidebar } from "./ProductInternalSidebar";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ProductContextLayoutProps {
    /** Product ID */
    productId: string;
    /** Product name for display */
    productName: string;
    /** Currently active section ID */
    activeSection: string;
    /** Callback when user navigates to a new section */
    onSectionChange: (sectionId: string) => void;
    /** Role-based access levels per section */
    accessLevels?: Record<string, 'full' | 'view' | 'none'>;
    /** Main content area (the current tab content) */
    children: ReactNode;
    /** Optional right sidebar content (status card, etc.) */
    rightSidebar?: ReactNode;
    /** Header content (product name, actions) */
    header?: ReactNode;
    className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ProductContextLayout({
    productId,
    productName,
    activeSection,
    onSectionChange,
    accessLevels,
    children,
    rightSidebar,
    header,
    className,
}: ProductContextLayoutProps) {
    return (
        <div className={cn("min-h-screen bg-background flex flex-col", className)}>
            {/* Header (sticky) */}
            {header && (
                <div className="border-b border-border bg-card sticky top-0 z-10">
                    {header}
                </div>
            )}

            {/* Main Layout: Sidebar + Content + Right Panel */}
            <div className="flex flex-1">
                {/* Left Sidebar - Product Internal Navigation */}
                <div className="hidden lg:flex flex-shrink-0 sticky top-[65px] h-[calc(100vh-65px)]">
                    <ProductInternalSidebar
                        productId={productId}
                        productName={productName}
                        activeSection={activeSection}
                        onSectionChange={onSectionChange}
                        accessLevels={accessLevels}
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 p-4 md:p-6">
                    <div className="max-w-4xl">
                        {children}
                    </div>
                </main>

                {/* Right Sidebar (Optional - Status, Quick Actions) */}
                {rightSidebar && (
                    <aside className="w-72 flex-shrink-0 hidden xl:block p-4">
                        <div className="sticky top-[89px] space-y-4">
                            {rightSidebar}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS FOR COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Section Header - Consistent header for each section panel
 */
interface SectionHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

/**
 * SectionContent - Wrapper for section content with consistent styling
 */
interface SectionContentProps {
    children: ReactNode;
    className?: string;
}

export function SectionContent({ children, className }: SectionContentProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {children}
        </div>
    );
}

export default ProductContextLayout;
