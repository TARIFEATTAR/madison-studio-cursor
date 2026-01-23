import React from 'react';
import { cn } from '@/lib/utils';

interface RecIndicatorProps {
    isRecording?: boolean;
    className?: string;
}

export function RecIndicator({ isRecording, className }: RecIndicatorProps) {
    return (
        <div
            className={cn(
                "rec-indicator",
                isRecording && "recording",
                className
            )}
        />
    );
}
