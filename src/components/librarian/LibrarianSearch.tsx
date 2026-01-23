/**
 * LibrarianSearch Component
 * Brass-styled search with magnifying glass icon
 *
 * Elegant search field in the style of an old library catalogue
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibrarianSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
}

export function LibrarianSearch({
    value,
    onChange,
    placeholder = "Search frameworks...",
    className,
    autoFocus = false,
}: LibrarianSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleClear = () => {
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div className={cn('librarian-search', className)}>
            <Search
                className={cn(
                    'librarian-search-icon transition-colors',
                    isFocused && 'text-brand-brass'
                )}
            />
            <input
                ref={inputRef}
                type="text"
                className="librarian-search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-label="Search frameworks"
            />
            {value && (
                <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-stone/10 transition-colors"
                    onClick={handleClear}
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4 text-charcoal/50" />
                </button>
            )}
        </div>
    );
}
