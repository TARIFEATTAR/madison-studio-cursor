/**
 * Madison Voice - Toast Messages
 * British voice wrapper for toast notifications
 *
 * "Framework acquired. Do make good use of it."
 */

import { toast as baseToast } from '@/hooks/use-toast';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

type MadisonToastType =
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | 'framework_acquired'
    | 'saved'
    | 'generation_complete'
    | 'loading';

interface MadisonToastOptions {
    type?: MadisonToastType;
    title?: string;
    description?: string;
    action?: ToastActionElement;
    duration?: number;
}

// Madison's voice mappings
const MADISON_MESSAGES: Record<string, { title: string; description?: string }> = {
    // Success states
    saved: {
        title: 'Safely stored.',
        description: 'It shall be here when you return.',
    },
    copied: {
        title: 'Framework acquired.',
        description: 'Do make good use of it.',
    },
    generation_complete: {
        title: 'Rather pleased with this one.',
        description: 'Your content is ready.',
    },
    published: {
        title: 'Successfully published.',
        description: 'Your work is now live.',
    },
    deleted: {
        title: 'Removed.',
        description: 'As requested.',
    },

    // Error states
    error: {
        title: "Something's gone awry.",
        description: 'Do try again.',
    },
    network_error: {
        title: "I couldn't quite manage that.",
        description: 'The connection seems troubled. Perhaps try once more?',
    },
    validation_error: {
        title: "I've noticed something that might want attention.",
    },

    // Warning states
    unsaved_changes: {
        title: 'Are you quite certain?',
        description: 'You have unsaved work.',
    },
    confirm_delete: {
        title: 'Shall I proceed with the deletion?',
        description: 'This cannot be undone.',
    },

    // Info states
    loading: {
        title: 'One moment...',
    },
    generating: {
        title: 'Crafting your content...',
    },
    searching: {
        title: 'Consulting The Librarian...',
    },
    syncing: {
        title: 'Synchronising...',
    },

    // Librarian specific
    framework_acquired: {
        title: 'Framework acquired.',
        description: 'Do make good use of it.',
    },
    framework_recommended: {
        title: 'I have a suggestion.',
        description: 'This framework might suit your needs.',
    },
};

/**
 * Madison-voiced toast function
 * Use this instead of the base toast for consistent branding
 */
export function madisonToast(options: MadisonToastOptions | string) {
    // If just a string, treat as title
    if (typeof options === 'string') {
        return baseToast({
            title: options,
        });
    }

    const { type, title, description, action, duration } = options;

    // Get Madison's pre-defined message if type matches
    const madisonMessage = type ? MADISON_MESSAGES[type] : null;

    // Determine variant
    let variant: 'default' | 'destructive' = 'default';
    if (type === 'error' || type === 'warning') {
        variant = 'destructive';
    }

    return baseToast({
        variant,
        title: title || madisonMessage?.title || 'Notice',
        description: description || madisonMessage?.description,
        action,
        duration,
    });
}

// Convenience methods
export const madison = {
    success: (title?: string, description?: string) =>
        madisonToast({ type: 'success', title: title || 'Done.', description }),

    error: (title?: string, description?: string) =>
        madisonToast({
            type: 'error',
            title: title || MADISON_MESSAGES.error.title,
            description: description || MADISON_MESSAGES.error.description
        }),

    saved: () =>
        madisonToast({ type: 'saved' }),

    copied: () =>
        madisonToast({ type: 'framework_acquired' }),

    frameworkAcquired: () =>
        madisonToast({ type: 'framework_acquired' }),

    generationComplete: (description?: string) =>
        madisonToast({ type: 'generation_complete', description }),

    loading: (title?: string) =>
        madisonToast({ type: 'loading', title }),

    generating: () =>
        madisonToast({ type: 'loading', title: MADISON_MESSAGES.generating.title }),

    searching: () =>
        madisonToast({ type: 'loading', title: MADISON_MESSAGES.searching.title }),

    info: (title: string, description?: string) =>
        madisonToast({ type: 'info', title, description }),

    warning: (title: string, description?: string) =>
        madisonToast({ type: 'warning', title, description }),
};

export default madison;
