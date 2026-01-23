/**
 * LibrarianDrawer Component
 * Main slide-out panel container for The Librarian
 *
 * A companion panel that slides from the right side,
 * allowing users to browse frameworks while staying in their workflow
 */

import React, { useState, useCallback, useMemo } from 'react';
import { BookOpen, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLibrarianFrameworks } from '@/hooks/useLibrarianFrameworks';
import type { LibrarianDrawerProps, LibrarianFramework, UsageContext } from '@/types/librarian';

import { AlphabetScroller } from './AlphabetScroller';
import { LibrarianSearch } from './LibrarianSearch';
import { ViewToggle } from './ViewToggle';
import { FrameworkCard, FrameworkCardSkeleton } from './FrameworkCard';

// Import styles
import '@/styles/librarian.css';

interface ExtendedLibrarianDrawerProps extends LibrarianDrawerProps {
    onFrameworkSelect?: (framework: LibrarianFramework) => void;
}

export function LibrarianDrawer({
    isOpen,
    onClose,
    context = 'global',
    initialCategory,
    onFrameworkSelect,
}: ExtendedLibrarianDrawerProps) {
    const [expandedFrameworkId, setExpandedFrameworkId] = useState<string | null>(null);

    const {
        filteredFrameworks,
        groupedByLetter,
        availableLetters,
        isLoading,
        error,
        filters,
        setSearch,
        viewMode,
        setViewMode,
        selectedLetter,
        setSelectedLetter,
        logUsage,
    } = useLibrarianFrameworks({
        category: initialCategory,
        context,
    });

    // Handle letter selection
    const handleLetterSelect = useCallback((letter: string) => {
        setSelectedLetter(letter === selectedLetter ? null : letter);
        setExpandedFrameworkId(null);
    }, [selectedLetter, setSelectedLetter]);

    // Handle framework expand
    const handleExpand = useCallback((frameworkId: string) => {
        setExpandedFrameworkId(frameworkId);
        logUsage(frameworkId, 'expand');
    }, [logUsage]);

    // Handle framework copy
    const handleCopy = useCallback((frameworkId: string) => {
        logUsage(frameworkId, 'copy');
    }, [logUsage]);

    // Handle framework drag
    const handleDrag = useCallback((frameworkId: string) => {
        logUsage(frameworkId, 'drag');
    }, [logUsage]);

    // Handle framework use
    const handleUse = useCallback((framework: LibrarianFramework) => {
        onFrameworkSelect?.(framework);
    }, [onFrameworkSelect]);

    // Render frameworks based on view mode
    const renderFrameworks = useMemo(() => {
        if (isLoading) {
            return (
                <div className="frameworks-grid">
                    {[...Array(5)].map((_, i) => (
                        <FrameworkCardSkeleton key={i} />
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="librarian-empty-state">
                    <div className="librarian-empty-illustration">
                        <BookOpen className="w-12 h-12" />
                    </div>
                    <p className="librarian-empty-title">
                        "Something's gone awry. Do try again."
                    </p>
                </div>
            );
        }

        if (filteredFrameworks.length === 0) {
            return (
                <div className="librarian-empty-state">
                    <div className="librarian-empty-illustration">
                        <BookOpen className="w-12 h-12" />
                    </div>
                    <p className="librarian-empty-title">
                        {filters.search
                            ? `"No frameworks match '${filters.search}'."`
                            : '"Every great campaign begins with the right framework."'}
                    </p>
                </div>
            );
        }

        // Alphabetical view with letter grouping
        if (viewMode === 'alphabetical') {
            const frameworksToShow = selectedLetter
                ? groupedByLetter[selectedLetter] || []
                : filteredFrameworks;

            return (
                <div className="frameworks-grid">
                    {frameworksToShow.map((framework) => (
                        <FrameworkCard
                            key={framework.id}
                            framework={framework}
                            isExpanded={expandedFrameworkId === framework.id}
                            onExpand={() => handleExpand(framework.id)}
                            onCollapse={() => setExpandedFrameworkId(null)}
                            onCopy={() => handleCopy(framework.id)}
                            onDrag={() => handleDrag(framework.id)}
                            onUse={handleUse}
                        />
                    ))}
                </div>
            );
        }

        // Other views (channel, intent, masters) - group and display
        return (
            <div className="frameworks-grid">
                {filteredFrameworks.map((framework) => (
                    <FrameworkCard
                        key={framework.id}
                        framework={framework}
                        isExpanded={expandedFrameworkId === framework.id}
                        onExpand={() => handleExpand(framework.id)}
                        onCollapse={() => setExpandedFrameworkId(null)}
                        onCopy={() => handleCopy(framework.id)}
                        onDrag={() => handleDrag(framework.id)}
                        onUse={handleUse}
                    />
                ))}
            </div>
        );
    }, [
        isLoading,
        error,
        filteredFrameworks,
        filters.search,
        viewMode,
        selectedLetter,
        groupedByLetter,
        expandedFrameworkId,
        handleExpand,
        handleCopy,
        handleDrag,
        handleUse,
    ]);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                className="librarian-drawer w-[90vw] sm:w-[500px] md:w-[560px] p-0 flex flex-col h-full overflow-hidden"
                side="right"
            >
                {/* Header */}
                <div className="librarian-drawer-header px-6 pt-6">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="flex items-center gap-3 font-serif text-2xl">
                            <div className="p-2 bg-brand-brass/10 rounded-lg">
                                <BookOpen className="w-5 h-5 text-brand-brass" />
                            </div>
                            <span>The Librarian</span>
                        </SheetTitle>
                    </SheetHeader>

                    {/* Search */}
                    <LibrarianSearch
                        value={filters.search}
                        onChange={setSearch}
                        placeholder="Search frameworks..."
                    />

                    {/* View Toggle */}
                    <ViewToggle
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        className="mt-4"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 min-h-0 mt-4">
                    {/* Alphabet Scroller (visible in alphabetical view) */}
                    {viewMode === 'alphabetical' && (
                        <div className="px-2 py-4 border-r border-stone/10">
                            <AlphabetScroller
                                selectedLetter={selectedLetter}
                                availableLetters={availableLetters}
                                onLetterSelect={handleLetterSelect}
                            />
                        </div>
                    )}

                    {/* Frameworks List */}
                    <ScrollArea className="flex-1 px-4 pb-6">
                        <div className="py-4">
                            {/* Letter heading (if selected) */}
                            {viewMode === 'alphabetical' && selectedLetter && (
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="font-serif text-4xl font-bold text-brand-brass">
                                        {selectedLetter}
                                    </span>
                                    <span className="text-sm text-charcoal/60">
                                        {groupedByLetter[selectedLetter]?.length || 0} framework
                                        {(groupedByLetter[selectedLetter]?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}

                            {renderFrameworks}
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
}
