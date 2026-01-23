/**
 * useLibrarianFrameworks Hook
 * Madison Studio's curated marketing methodology library
 *
 * Handles fetching, filtering, and caching of framework data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
    LibrarianFramework,
    LibrarianFilters,
    LibrarianViewMode,
    UsageAction,
    UsageContext,
    FrameworkCategory,
    FrameworkChannel,
    MadisonMaster
} from '@/types/librarian';
import { ALPHABET } from '@/types/librarian';

interface UseLibrarianFrameworksOptions {
    category?: FrameworkCategory;
    channel?: FrameworkChannel;
    context?: UsageContext;
}

interface UseLibrarianFrameworksReturn {
    // Data
    frameworks: LibrarianFramework[];
    filteredFrameworks: LibrarianFramework[];
    groupedByLetter: Record<string, LibrarianFramework[]>;
    availableLetters: string[];

    // State
    isLoading: boolean;
    error: Error | null;

    // Filters
    filters: LibrarianFilters;
    setSearch: (search: string) => void;
    setCategory: (category: FrameworkCategory | null) => void;
    setChannel: (channel: FrameworkChannel | null) => void;
    setMaster: (master: MadisonMaster | null) => void;
    clearFilters: () => void;

    // View
    viewMode: LibrarianViewMode;
    setViewMode: (mode: LibrarianViewMode) => void;
    selectedLetter: string | null;
    setSelectedLetter: (letter: string | null) => void;

    // Actions
    logUsage: (frameworkId: string, action: UsageAction) => Promise<void>;
    refreshFrameworks: () => Promise<void>;
}

const DEFAULT_FILTERS: LibrarianFilters = {
    search: '',
    category: null,
    channel: null,
    intent: null,
    master: null,
    awareness_stage: null,
};

export function useLibrarianFrameworks(
    options: UseLibrarianFrameworksOptions = {}
): UseLibrarianFrameworksReturn {
    const { category: initialCategory, channel: initialChannel, context = 'global' } = options;

    // State
    const [frameworks, setFrameworks] = useState<LibrarianFramework[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [viewMode, setViewMode] = useState<LibrarianViewMode>('alphabetical');
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [filters, setFilters] = useState<LibrarianFilters>({
        ...DEFAULT_FILTERS,
        category: initialCategory || null,
        channel: initialChannel || null,
    });

    // Fetch frameworks from Supabase
    const fetchFrameworks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Note: Using 'any' cast because librarian_frameworks is a new table
            // that may not be in the generated types yet
            let query = (supabase as any)
                .from('librarian_frameworks')
                .select('*')
                .eq('is_active', true)
                .order('sort_letter', { ascending: true })
                .order('title', { ascending: true });

            // Apply initial category filter if provided
            if (initialCategory) {
                query = query.eq('category', initialCategory);
            }

            const { data, error: queryError } = await query;

            if (queryError) {
                throw queryError;
            }

            setFrameworks(data || []);
        } catch (err) {
            console.error('[Librarian] Error fetching frameworks:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch frameworks'));
        } finally {
            setIsLoading(false);
        }
    }, [initialCategory]);

    // Initial fetch
    useEffect(() => {
        fetchFrameworks();
    }, [fetchFrameworks]);

    // Filter frameworks based on current filters
    const filteredFrameworks = useMemo(() => {
        let result = [...frameworks];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(
                (f) =>
                    f.title.toLowerCase().includes(searchLower) ||
                    f.short_description?.toLowerCase().includes(searchLower) ||
                    f.framework_content.toLowerCase().includes(searchLower) ||
                    f.madison_note.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (filters.category) {
            result = result.filter((f) => f.category === filters.category);
        }

        // Channel filter
        if (filters.channel) {
            result = result.filter((f) => f.channel === filters.channel);
        }

        // Intent filter
        if (filters.intent) {
            result = result.filter((f) => f.intent === filters.intent);
        }

        // Master filter
        if (filters.master) {
            result = result.filter((f) => f.masters.includes(filters.master!));
        }

        // Awareness stage filter
        if (filters.awareness_stage) {
            result = result.filter((f) => f.awareness_stage === filters.awareness_stage);
        }

        // Letter filter (for alphabetical view)
        if (selectedLetter && viewMode === 'alphabetical') {
            result = result.filter((f) => f.sort_letter.toUpperCase() === selectedLetter);
        }

        return result;
    }, [frameworks, filters, selectedLetter, viewMode]);

    // Group frameworks by letter for A-Z view
    const groupedByLetter = useMemo(() => {
        const groups: Record<string, LibrarianFramework[]> = {};

        filteredFrameworks.forEach((framework) => {
            const letter = framework.sort_letter.toUpperCase();
            if (!groups[letter]) {
                groups[letter] = [];
            }
            groups[letter].push(framework);
        });

        return groups;
    }, [filteredFrameworks]);

    // Get available letters (letters that have at least one framework)
    const availableLetters = useMemo(() => {
        const lettersWithFrameworks = new Set(
            frameworks.map((f) => f.sort_letter.toUpperCase())
        );
        return ALPHABET.filter((letter) => lettersWithFrameworks.has(letter));
    }, [frameworks]);

    // Filter setters
    const setSearch = useCallback((search: string) => {
        setFilters((prev) => ({ ...prev, search }));
    }, []);

    const setCategory = useCallback((category: FrameworkCategory | null) => {
        setFilters((prev) => ({ ...prev, category }));
    }, []);

    const setChannel = useCallback((channel: FrameworkChannel | null) => {
        setFilters((prev) => ({ ...prev, channel }));
    }, []);

    const setMaster = useCallback((master: MadisonMaster | null) => {
        setFilters((prev) => ({ ...prev, master }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        setSelectedLetter(null);
    }, []);

    // Log usage action
    const logUsage = useCallback(
        async (frameworkId: string, action: UsageAction) => {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) return;

                // Log the usage
                await (supabase as any).from('librarian_usage_log').insert({
                    framework_id: frameworkId,
                    user_id: user.id,
                    action,
                    context,
                    search_query: filters.search || null,
                });

                // Increment usage count on the framework
                if (action === 'copy' || action === 'drag') {
                    await (supabase as any).rpc('increment_framework_usage', {
                        framework_uuid: frameworkId,
                    });
                }
            } catch (err) {
                console.error('[Librarian] Error logging usage:', err);
            }
        },
        [context, filters.search]
    );

    return {
        // Data
        frameworks,
        filteredFrameworks,
        groupedByLetter,
        availableLetters,

        // State
        isLoading,
        error,

        // Filters
        filters,
        setSearch,
        setCategory,
        setChannel,
        setMaster,
        clearFilters,

        // View
        viewMode,
        setViewMode,
        selectedLetter,
        setSelectedLetter,

        // Actions
        logUsage,
        refreshFrameworks: fetchFrameworks,
    };
}
