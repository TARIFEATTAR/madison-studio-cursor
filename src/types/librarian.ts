/**
 * THE LIBRARIAN - Type Definitions
 * Madison Studio's curated marketing methodology library
 */

// ============================================================================
// FRAMEWORK TYPES
// ============================================================================

export type FrameworkCategory = 'copy' | 'image' | 'video';

export type FrameworkChannel =
    | 'email'
    | 'social'
    | 'web'
    | 'marketplace'
    | 'sms'
    | 'video'
    | 'blog'
    | 'instagram'
    | 'linkedin'
    | 'twitter'
    | 'print';

export type FrameworkIntent = 'launch' | 'nurture' | 'convert' | 'retain' | 'winback';

export type AwarenessStage = 'unaware' | 'problem' | 'solution' | 'product' | 'most';

export type MadisonMaster =
    | 'ogilvy'
    | 'hopkins'
    | 'reeves'
    | 'wieden_kennedy'
    | 'clow'
    | 'burnett'
    | 'peterman'
    | 'schwartz';

export interface LibrarianFramework {
    id: string;
    title: string;
    slug: string;
    sort_letter: string;
    category: FrameworkCategory;
    channel: FrameworkChannel;
    intent: FrameworkIntent;
    masters: MadisonMaster[];
    awareness_stage: AwarenessStage;
    industries: string[];
    short_description: string | null;
    framework_content: string;
    madison_note: string;
    example_output: string | null;
    usage_count: number;
    is_featured: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// USAGE LOGGING
// ============================================================================

export type UsageAction = 'view' | 'expand' | 'copy' | 'drag' | 'search';

export type UsageContext = 'forge' | 'dark_room' | 'multiply' | 'library' | 'global';

export interface LibrarianUsageLog {
    id: string;
    framework_id: string;
    user_id: string | null;
    organization_id: string | null;
    action: UsageAction;
    context: UsageContext | null;
    search_query: string | null;
    created_at: string;
}

// ============================================================================
// AGENT SUGGESTIONS
// ============================================================================

export type SuggestionType =
    | 'idle_prompt'
    | 'post_generation'
    | 'framework_recommend'
    | 'brand_health'
    | 'welcome_back'
    | 'onboarding_help';

export interface AgentSuggestion {
    id: string;
    user_id: string | null;
    organization_id: string | null;
    suggestion_type: SuggestionType;
    suggestion_content: string;
    trigger_context: Record<string, unknown> | null;
    framework_id: string | null;
    accepted: boolean | null;
    dismissed: boolean | null;
    shown_at: string;
    responded_at: string | null;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type LibrarianViewMode = 'alphabetical' | 'channel' | 'intent' | 'masters';

export interface LibrarianFilters {
    search: string;
    category: FrameworkCategory | null;
    channel: FrameworkChannel | null;
    intent: FrameworkIntent | null;
    master: MadisonMaster | null;
    awareness_stage: AwarenessStage | null;
}

export interface LibrarianState {
    isOpen: boolean;
    viewMode: LibrarianViewMode;
    selectedLetter: string | null;
    selectedFramework: LibrarianFramework | null;
    filters: LibrarianFilters;
    context: UsageContext;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface FrameworkCardProps {
    framework: LibrarianFramework;
    isExpanded?: boolean;
    onExpand?: () => void;
    onCollapse?: () => void;
    onCopy?: () => void;
    onDrag?: () => void;
}

export interface AlphabetScrollerProps {
    selectedLetter: string | null;
    availableLetters: string[];
    onLetterSelect: (letter: string) => void;
}

export interface LibrarianDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    context?: UsageContext;
    initialCategory?: FrameworkCategory;
}

// ============================================================================
// MASTERS DATA
// ============================================================================

export interface MasterInfo {
    id: MadisonMaster;
    name: string;
    title: string;
    specialty: string;
    color: string;
}

export const MADISON_MASTERS: Record<MadisonMaster, MasterInfo> = {
    ogilvy: {
        id: 'ogilvy',
        name: 'David Ogilvy',
        title: 'The Father of Advertising',
        specialty: 'Specificity & Research',
        color: '#B8956A', // brass
    },
    hopkins: {
        id: 'hopkins',
        name: 'Claude Hopkins',
        title: 'Scientific Advertising',
        specialty: 'Reason-Why Copy',
        color: '#8B7355', // stone
    },
    reeves: {
        id: 'reeves',
        name: 'Rosser Reeves',
        title: 'USP Pioneer',
        specialty: 'Unique Selling Proposition',
        color: '#C4975C', // aged amber
    },
    wieden_kennedy: {
        id: 'wieden_kennedy',
        name: 'Wieden+Kennedy',
        title: 'Cultural Authenticity',
        specialty: 'Brand Voice & Spirit',
        color: '#4A90E2', // muted blue
    },
    clow: {
        id: 'clow',
        name: 'Lee Clow',
        title: 'Creative Disruption',
        specialty: 'Category Disruption',
        color: '#8B5CF6', // muted purple
    },
    burnett: {
        id: 'burnett',
        name: 'Leo Burnett',
        title: 'Inherent Drama',
        specialty: 'Product Drama & Storytelling',
        color: '#F97316', // muted orange
    },
    peterman: {
        id: 'peterman',
        name: 'J. Peterman',
        title: 'Romance Copywriting',
        specialty: 'Evocative Storytelling',
        color: '#10B981', // muted green
    },
    schwartz: {
        id: 'schwartz',
        name: 'Eugene Schwartz',
        title: 'Awareness Stages',
        specialty: 'Market Sophistication',
        color: '#6366F1', // indigo
    },
};

// ============================================================================
// AWARENESS STAGES DATA
// ============================================================================

export interface AwarenessStageInfo {
    id: AwarenessStage;
    name: string;
    description: string;
    approach: string;
}

export const AWARENESS_STAGES: Record<AwarenessStage, AwarenessStageInfo> = {
    unaware: {
        id: 'unaware',
        name: 'Unaware',
        description: 'Prospect doesn\'t know they have a problem',
        approach: 'Lead with identity or story',
    },
    problem: {
        id: 'problem',
        name: 'Problem-Aware',
        description: 'Knows the problem, not the solutions',
        approach: 'Agitate the pain point',
    },
    solution: {
        id: 'solution',
        name: 'Solution-Aware',
        description: 'Knows solutions exist, not yours specifically',
        approach: 'Differentiate your approach',
    },
    product: {
        id: 'product',
        name: 'Product-Aware',
        description: 'Knows your product, needs convincing',
        approach: 'Provide proof and specificity',
    },
    most: {
        id: 'most',
        name: 'Most-Aware',
        description: 'Ready to buy, needs the right offer',
        approach: 'Clear CTA with urgency',
    },
};

// ============================================================================
// CHANNEL ICONS & DATA
// ============================================================================

export interface ChannelInfo {
    id: FrameworkChannel;
    name: string;
    icon: string; // Lucide icon name
    color: string;
}

export const CHANNELS: Record<FrameworkChannel, ChannelInfo> = {
    email: { id: 'email', name: 'Email', icon: 'Mail', color: '#4A90E2' },
    social: { id: 'social', name: 'Social', icon: 'Share2', color: '#8B5CF6' },
    web: { id: 'web', name: 'Web', icon: 'Globe', color: '#10B981' },
    marketplace: { id: 'marketplace', name: 'Marketplace', icon: 'ShoppingBag', color: '#F97316' },
    sms: { id: 'sms', name: 'SMS', icon: 'MessageSquare', color: '#10B981' },
    video: { id: 'video', name: 'Video', icon: 'Video', color: '#EF4444' },
    blog: { id: 'blog', name: 'Blog', icon: 'FileText', color: '#6366F1' },
    instagram: { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#E4405F' },
    linkedin: { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: '#0A66C2' },
    twitter: { id: 'twitter', name: 'Twitter/X', icon: 'Twitter', color: '#1DA1F2' },
    print: { id: 'print', name: 'Print', icon: 'Printer', color: '#8B7355' },
};

// ============================================================================
// ALPHABET FOR SCROLLER
// ============================================================================

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
